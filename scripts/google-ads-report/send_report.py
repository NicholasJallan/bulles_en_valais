#!/usr/bin/env python3
"""
Rapport Quotidien Automatique Google Ads — Bulles en Valais
Extrait les métriques GA4 / Google Ads et envoie un e-mail HTML stylisé.
"""

import os
import sys
import json
import smtplib
from datetime import datetime
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from html import escape
from zoneinfo import ZoneInfo

# Le SDK Google n'est importé que par les fonctions qui interrogent GA4 (_ga4) : le rendu de l'e-mail
# et l'envoi se testent sans lui (test_send_report.py).


PROPERTY_ID = os.environ.get("GA4_PROPERTY_ID", "358387240")
DAILY_BUDGET_CHF = 3.00
TARGET_MAX_CPC_CHF = 2.00
REPORT_DAYS = 7
SEARCH_TERMS_LIMIT = 20
LOCAL_TZ = ZoneInfo("Europe/Zurich")


def _ga4():
    """Le module de types GA4, importé à la demande ; message clair s'il manque."""
    try:
        from google.analytics.data_v1beta import types
    except ImportError:
        print("Erreur : le package 'google-analytics-data' n'est pas installé.", file=sys.stderr)
        print("Installez-le via : pip install -r scripts/google-ads-report/requirements.txt", file=sys.stderr)
        sys.exit(1)
    return types


def report_range(days: int = REPORT_DAYS) -> dict:
    """Les `days` derniers jours complets : de `<days>daysAgo` à hier (aujourd'hui est partiel)."""
    return {"start_date": f"{days}daysAgo", "end_date": "yesterday"}


def local_now() -> datetime:
    """L'heure suisse : le runner GitHub tourne en UTC."""
    return datetime.now(LOCAL_TZ)


def get_client():
    """Initialise le client GA4 via les credentials SA (fichier ou variable JSON)."""
    sa_key = os.environ.get("GA4_SERVICE_ACCOUNT_KEY")
    if not sa_key:
        local_path = os.path.join(
            os.path.dirname(__file__), "..", "..", "GA", "gen-lang-client-0133176806-3929118a87a1.json"
        )
        if os.path.exists(local_path):
            with open(local_path, "r", encoding="utf-8") as f:
                sa_key = f.read()
        else:
            raise ValueError("Variable GA4_SERVICE_ACCOUNT_KEY manquante.")

    try:
        from google.analytics.data_v1beta import BetaAnalyticsDataClient
        from google.oauth2 import service_account
    except ImportError:
        _ga4()  # même message, puis sortie

    # Si c'est du JSON brut en string
    if sa_key.strip().startswith("{"):
        info = json.loads(sa_key)
        credentials = service_account.Credentials.from_service_account_info(info)
    else:
        # Si c'est un chemin de fichier
        credentials = service_account.Credentials.from_service_account_file(sa_key)

    return BetaAnalyticsDataClient(credentials=credentials)


def build_campaign_request(types, days: int = REPORT_DAYS):
    """Requête GA4 des métriques par campagne et groupe d'annonces (`types` : module de types GA4)."""
    return types.RunReportRequest(
        property=f"properties/{PROPERTY_ID}",
        date_ranges=[types.DateRange(**report_range(days))],
        dimensions=[
            types.Dimension(name="sessionGoogleAdsCampaignName"),
            types.Dimension(name="sessionGoogleAdsAdGroupName"),
        ],
        metrics=[
            types.Metric(name="advertiserAdImpressions"),
            types.Metric(name="advertiserAdClicks"),
            types.Metric(name="advertiserAdCost"),
            types.Metric(name="advertiserAdCostPerClick"),
            types.Metric(name="keyEvents:generate_lead"),
            types.Metric(name="keyEvents:whatsapp_click"),
            types.Metric(name="keyEvents:phone_click"),
        ],
    )


def fetch_campaign_report(client, days: int = REPORT_DAYS) -> dict:
    """Récupère les métriques de la campagne Google Ads et des groupes d'annonces."""
    response = client.run_report(build_campaign_request(_ga4(), days))

    rows = []
    total_impressions = 0
    total_clicks = 0
    total_cost = 0.0
    total_leads = 0
    total_whatsapp = 0
    total_phone = 0

    for row in response.rows:
        camp_name = row.dimension_values[0].value
        ad_group = row.dimension_values[1].value

        # Ignorer les lignes de trafic non liées à Google Ads ((not set))
        if camp_name == "(not set)" or ad_group == "(not set)":
            continue

        impressions = int(row.metric_values[0].value or 0)
        clicks = int(row.metric_values[1].value or 0)
        cost = float(row.metric_values[2].value or 0.0)
        cpc = float(row.metric_values[3].value or 0.0)
        leads = int(row.metric_values[4].value or 0)
        whatsapp = int(row.metric_values[5].value or 0)
        phone = int(row.metric_values[6].value or 0)

        total_impressions += impressions
        total_clicks += clicks
        total_cost += cost
        total_leads += leads
        total_whatsapp += whatsapp
        total_phone += phone

        rows.append({
            "campaign": camp_name,
            "ad_group": ad_group,
            "impressions": impressions,
            "clicks": clicks,
            "cost": cost,
            "cpc": cpc,
            "leads": leads,
            "whatsapp": whatsapp,
            "phone": phone,
        })

    avg_ctr = (total_clicks / total_impressions * 100) if total_impressions > 0 else 0.0
    avg_cpc = (total_cost / total_clicks) if total_clicks > 0 else 0.0
    total_conversions = total_leads + total_whatsapp + total_phone
    cpa = (total_cost / total_conversions) if total_conversions > 0 else 0.0

    return {
        "period_days": days,
        "total_impressions": total_impressions,
        "total_clicks": total_clicks,
        "total_cost": total_cost,
        "avg_ctr": avg_ctr,
        "avg_cpc": avg_cpc,
        "total_leads": total_leads,
        "total_whatsapp": total_whatsapp,
        "total_phone": total_phone,
        "total_conversions": total_conversions,
        "cpa": cpa,
        "rows": rows,
    }


def build_search_terms_request(types, days: int = REPORT_DAYS):
    """Requête GA4 des termes de recherche, les plus cliqués d'abord."""
    return types.RunReportRequest(
        property=f"properties/{PROPERTY_ID}",
        date_ranges=[types.DateRange(**report_range(days))],
        dimensions=[
            types.Dimension(name="sessionGoogleAdsQuery"),
            types.Dimension(name="sessionGoogleAdsAdGroupName"),
        ],
        metrics=[
            types.Metric(name="advertiserAdClicks"),
            types.Metric(name="advertiserAdCost"),
            types.Metric(name="keyEvents:generate_lead"),
        ],
        order_bys=[
            types.OrderBy(
                metric=types.OrderBy.MetricOrderBy(metric_name="advertiserAdClicks"), desc=True
            )
        ],
        limit=SEARCH_TERMS_LIMIT,
    )


def fetch_search_terms(client, days: int = REPORT_DAYS) -> list:
    """Récupère les requêtes exactes tapées par les internautes."""
    response = client.run_report(build_search_terms_request(_ga4(), days))
    queries = []
    for row in response.rows:
        query = row.dimension_values[0].value
        ad_group = row.dimension_values[1].value
        clicks = int(row.metric_values[0].value or 0)
        cost = float(row.metric_values[1].value or 0.0)
        leads = int(row.metric_values[2].value or 0)
        if query and query != "(not set)":
            queries.append({
                "query": query,
                "ad_group": ad_group,
                "clicks": clicks,
                "cost": cost,
                "leads": leads,
            })
    return queries


def fetch_conversions_for_range(client, start_date: str, end_date: str) -> dict:
    """Récupère les événements de conversion pour une plage donnée."""
    types = _ga4()
    request = types.RunReportRequest(
        property=f"properties/{PROPERTY_ID}",
        date_ranges=[types.DateRange(start_date=start_date, end_date=end_date)],
        dimensions=[types.Dimension(name="eventName")],
        metrics=[types.Metric(name="eventCount")],
    )
    response = client.run_report(request)
    events = {"generate_lead": 0, "whatsapp_click": 0, "phone_click": 0}
    for row in response.rows:
        name = row.dimension_values[0].value
        count = int(row.metric_values[0].value or 0)
        if name in events:
            events[name] = count
    return events


def fetch_site_activity(client) -> dict:
    """Récupère l'activité globale du site pour hier (journée complète) et aujourd'hui."""
    yesterday = fetch_conversions_for_range(client, "yesterday", "yesterday")
    today = fetch_conversions_for_range(client, "today", "today")
    return {"yesterday": yesterday, "today": today}


def generate_html_email(camp_data: dict, search_terms: list, site_activity: dict) -> str:
    """Génère le corps HTML de l'e-mail avec une mise en forme soignée."""
    now_str = local_now().strftime("%d/%m/%Y à %H:%M")
    period = camp_data["period_days"]

    # Budget status
    allocated_period_chf = DAILY_BUDGET_CHF * period
    cost_val = camp_data["total_cost"]
    budget_pct = (cost_val / allocated_period_chf * 100) if allocated_period_chf > 0 else 0

    # Lignes du tableau
    rows_html = ""
    if camp_data["rows"]:
        for r in camp_data["rows"]:
            c_ctr = (r["clicks"] / r["impressions"] * 100) if r["impressions"] > 0 else 0.0
            conv = r["leads"] + r["whatsapp"] + r["phone"]
            c_cpa = (r["cost"] / conv) if conv > 0 else 0.0
            cpa_display = f"CHF {c_cpa:.2f}" if conv > 0 else "—"
            cpc_display = f"CHF {r['cpc']:.2f}" if r["clicks"] > 0 else "—"

            rows_html += f"""
            <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 10px; font-weight: 600; color: #1e293b;">{escape(r['ad_group'])}</td>
                <td style="padding: 10px; text-align: center; color: #475569;">{r['impressions']}</td>
                <td style="padding: 10px; text-align: center; font-weight: 600; color: #0284c7;">{r['clicks']}</td>
                <td style="padding: 10px; text-align: center; color: #475569;">{c_ctr:.1f}%</td>
                <td style="padding: 10px; text-align: right; color: #475569;">CHF {r['cost']:.2f}</td>
                <td style="padding: 10px; text-align: right; color: #475569;">{cpc_display}</td>
                <td style="padding: 10px; text-align: center; color: #16a34a; font-weight: 600;">{r['leads']}</td>
                <td style="padding: 10px; text-align: center; color: #16a34a; font-weight: 600;">{r['whatsapp']}</td>
                <td style="padding: 10px; text-align: center; color: #16a34a; font-weight: 600;">{r['phone']}</td>
                <td style="padding: 10px; text-align: right; font-weight: 600; color: #0f172a;">{cpa_display}</td>
            </tr>
            """
    else:
        rows_html = """
        <tr>
            <td colspan="10" style="padding: 18px; text-align: center; color: #64748b; font-size: 13px;">
                ℹ️ <strong>Campagne Search-BEV</strong> : En cours de diffusion ou de synchronisation avec Google Ads (délai standard 12-24h). Aucune dépense ni clic payant consolidé sur cette période.
            </td>
        </tr>
        """

    # Search terms section
    queries_html = ""
    if search_terms:
        for q in search_terms:
            badge = '<span style="background-color: #dcfce7; color: #15803d; padding: 2px 8px; border-radius: 9999px; font-size: 11px; font-weight: 600;">Converti</span>' if q['leads'] > 0 else '<span style="background-color: #f1f5f9; color: #64748b; padding: 2px 8px; border-radius: 9999px; font-size: 11px;">Clic</span>'
            queries_html += f"""
            <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 8px 10px; color: #334155; font-family: monospace;">{escape(q['query'])}</td>
                <td style="padding: 8px 10px; color: #64748b;">{escape(q['ad_group'])}</td>
                <td style="padding: 8px 10px; text-align: center; font-weight: 600;">{q['clicks']}</td>
                <td style="padding: 8px 10px; text-align: right; color: #475569;">CHF {q['cost']:.2f}</td>
                <td style="padding: 8px 10px; text-align: center;">{badge}</td>
            </tr>
            """
    else:
        queries_html = """
        <tr>
            <td colspan="5" style="padding: 12px; text-align: center; color: #94a3b8; font-size: 13px;">
                Aucune requête de recherche consolidée enregistrée sur cette fenêtre.
            </td>
        </tr>
        """

    cpa_summary = f"CHF {camp_data['cpa']:.2f}" if camp_data['total_conversions'] > 0 else "—"
    cpc_summary = f"CHF {camp_data['avg_cpc']:.2f}" if camp_data['total_clicks'] > 0 else "—"

    html = f"""
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Bulles en Valais — Rapport Google Ads</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
        <div style="max-width: 680px; margin: 20px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
            
            <!-- HEADER -->
            <div style="background: linear-gradient(135deg, #092340 0%, #0369a1 100%); padding: 28px 32px; color: #ffffff;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <div style="font-size: 13px; text-transform: uppercase; letter-spacing: 1.5px; opacity: 0.85; font-weight: 600;">Bulles en Valais</div>
                        <h1 style="margin: 6px 0 0 0; font-size: 22px; font-weight: 700; color: #ffffff;">Rapport Quotidien Google Ads</h1>
                    </div>
                </div>
                <div style="margin-top: 14px; font-size: 12px; opacity: 0.8; display: flex; gap: 16px;">
                    <span>Campagne : <strong>Search-BEV</strong></span>
                    <span>•</span>
                    <span>Fenêtre : <strong>{period} derniers jours</strong></span>
                    <span>•</span>
                    <span>Généré le {now_str}</span>
                </div>
            </div>

            <div style="padding: 28px 32px;">
                
                <!-- KPI HERO CARDS -->
                <div style="display: table; width: 100%; margin-bottom: 24px;">
                    <div style="display: table-row;">
                        
                        <!-- Card 1 : Coût -->
                        <div style="display: table-cell; width: 25%; padding: 6px;">
                            <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 14px; text-align: center;">
                                <div style="font-size: 11px; text-transform: uppercase; color: #166534; font-weight: 700; letter-spacing: 0.5px;">Dépenses</div>
                                <div style="font-size: 20px; font-weight: 800; color: #14532d; margin: 4px 0;">CHF {camp_data['total_cost']:.2f}</div>
                                <div style="font-size: 11px; color: #16a34a;">Max: CHF {DAILY_BUDGET_CHF:.2f}/j</div>
                            </div>
                        </div>

                        <!-- Card 2 : Clics & CTR -->
                        <div style="display: table-cell; width: 25%; padding: 6px;">
                            <div style="background-color: #f0f9ff; border: 1px solid #bae6fd; border-radius: 10px; padding: 14px; text-align: center;">
                                <div style="font-size: 11px; text-transform: uppercase; color: #075985; font-weight: 700; letter-spacing: 0.5px;">Clics (CTR)</div>
                                <div style="font-size: 20px; font-weight: 800; color: #0369a1; margin: 4px 0;">{camp_data['total_clicks']} <span style="font-size: 13px; font-weight: 500;">({camp_data['avg_ctr']:.1f}%)</span></div>
                                <div style="font-size: 11px; color: #0284c7;">{camp_data['total_impressions']} imp.</div>
                            </div>
                        </div>

                        <!-- Card 3 : CPC Réel -->
                        <div style="display: table-cell; width: 25%; padding: 6px;">
                            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px; text-align: center;">
                                <div style="font-size: 11px; text-transform: uppercase; color: #475569; font-weight: 700; letter-spacing: 0.5px;">CPC Moyen</div>
                                <div style="font-size: 20px; font-weight: 800; color: #1e293b; margin: 4px 0;">{cpc_summary}</div>
                                <div style="font-size: 11px; color: #64748b;">Plafond: 2.00</div>
                            </div>
                        </div>

                        <!-- Card 4 : Conversions -->
                        <div style="display: table-cell; width: 25%; padding: 6px;">
                            <div style="background-color: #fefce8; border: 1px solid #fef08a; border-radius: 10px; padding: 14px; text-align: center;">
                                <div style="font-size: 11px; text-transform: uppercase; color: #854d0e; font-weight: 700; letter-spacing: 0.5px;">Contacts Ads (CPA)</div>
                                <div style="font-size: 20px; font-weight: 800; color: #713f12; margin: 4px 0;">{camp_data['total_conversions']}</div>
                                <div style="font-size: 11px; color: #a16207;">CPA: {cpa_summary}</div>
                            </div>
                        </div>

                    </div>
                </div>

                <!-- ACTIVITÉ DU SITE (GA4 DIRECT) -->
                <div style="background-color: #f8fafc; border-left: 4px solid #0284c7; padding: 14px 18px; border-radius: 6px; margin-bottom: 26px;">
                    <div style="font-size: 13px; font-weight: 700; color: #0f172a; margin-bottom: 8px;">
                        🎯 Activité globale captée sur le site (toutes sources confondues) :
                    </div>
                    <div style="font-size: 13px; color: #334155; line-height: 1.6;">
                        <strong>Hier (journée complète) :</strong> 
                        <strong>{site_activity['yesterday']['generate_lead']}</strong> formulaire(s) de lead • 
                        <strong>{site_activity['yesterday']['whatsapp_click']}</strong> clic(s) WhatsApp • 
                        <strong>{site_activity['yesterday']['phone_click']}</strong> appel(s)<br>
                        <span style="color: #64748b; font-size: 12px;">Aujourd'hui (depuis minuit) : 
                        {site_activity['today']['generate_lead']} formulaire(s) • 
                        {site_activity['today']['whatsapp_click']} WhatsApp • 
                        {site_activity['today']['phone_click']} appel(s)</span>
                    </div>
                </div>

                <!-- TABLEAU GROUPES D'ANNONCES -->
                <div style="margin-bottom: 28px;">
                    <h2 style="font-size: 15px; font-weight: 700; color: #0f172a; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px;">
                        Performance par Groupe d'Annonces
                    </h2>
                    <div style="overflow-x: auto; border: 1px solid #e2e8f0; border-radius: 8px;">
                        <table style="width: 100%; border-collapse: collapse; font-size: 12px; text-align: left;">
                            <thead style="background-color: #f1f5f9; color: #475569; border-bottom: 2px solid #e2e8f0;">
                                <tr>
                                    <th style="padding: 10px;">Groupe</th>
                                    <th style="padding: 10px; text-align: center;">Imp.</th>
                                    <th style="padding: 10px; text-align: center;">Clics</th>
                                    <th style="padding: 10px; text-align: center;">CTR</th>
                                    <th style="padding: 10px; text-align: right;">Coût</th>
                                    <th style="padding: 10px; text-align: right;">CPC</th>
                                    <th style="padding: 10px; text-align: center;">Lead</th>
                                    <th style="padding: 10px; text-align: center;">WA</th>
                                    <th style="padding: 10px; text-align: center;">Tél</th>
                                    <th style="padding: 10px; text-align: right;">CPA</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows_html}
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- REQUÊTES DE RECHERCHE -->
                <div style="margin-bottom: 28px;">
                    <h2 style="font-size: 15px; font-weight: 700; color: #0f172a; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px;">
                        Dernières Requêtes de Recherche Réelles (Search Terms)
                    </h2>
                    <div style="overflow-x: auto; border: 1px solid #e2e8f0; border-radius: 8px;">
                        <table style="width: 100%; border-collapse: collapse; font-size: 12px; text-align: left;">
                            <thead style="background-color: #f1f5f9; color: #475569; border-bottom: 1px solid #e2e8f0;">
                                <tr>
                                    <th style="padding: 8px 10px;">Terme recherché</th>
                                    <th style="padding: 8px 10px;">Groupe</th>
                                    <th style="padding: 8px 10px; text-align: center;">Clics</th>
                                    <th style="padding: 8px 10px; text-align: right;">Coût</th>
                                    <th style="padding: 8px 10px; text-align: center;">Statut</th>
                                </tr>
                            </thead>
                            <tbody>
                                {queries_html}
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- CONSEIL D'OPTIMISATION -->
                <div style="background-color: #f1f5f9; border-radius: 8px; padding: 16px; font-size: 12px; color: #475569; line-height: 1.5;">
                    <strong style="color: #0f172a;">💡 Rappel d'optimisation :</strong><br>
                    Surveillez régulièrement l'onglet <em>Mots-clés à exclure</em> dans Google Ads pour bloquer les requêtes de recherche hors-sujet (ex: matériel, stage mer, piscine) dès qu'elles apparaissent.
                </div>

            </div>

            <!-- FOOTER -->
            <div style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px 32px; font-size: 11px; color: #94a3b8; text-align: center;">
                Rapport automatique propulsé par GitHub Actions & GA4 Data API • <a href="https://bullesenvalais.ch" style="color: #0284c7; text-decoration: none;">bullesenvalais.ch</a>
            </div>

        </div>
    </body>
    </html>
    """
    return html


def send_email(subject: str, html_body: str) -> None:
    """Envoie l'e-mail via SMTP Gmail."""
    host = os.environ.get("SMTP_HOST", "smtp.gmail.com")
    port = int(os.environ.get("SMTP_PORT", "587"))
    user = os.environ.get("SMTP_USER")
    password = os.environ.get("SMTP_PASS")
    sender = os.environ.get("SMTP_FROM", user)
    recipient = os.environ.get("REPORT_RECIPIENT", "nicholas.jallan@gmail.com")

    if not user or not password:
        raise ValueError("Variables SMTP_USER ou SMTP_PASS manquantes.")

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"Bulles en Valais Reporting <{sender}>"
    msg["To"] = recipient

    # Version plain text fallback
    plain_text = "Veuillez consulter ce message avec un client compatible HTML pour afficher le rapport Google Ads."
    msg.attach(MIMEText(plain_text, "plain", "utf-8"))
    msg.attach(MIMEText(html_body, "html", "utf-8"))

    print(f"Connexion au serveur SMTP {host}:{port}...")
    with smtplib.SMTP(host, port, timeout=30) as server:
        server.starttls()
        server.login(user, password)
        server.send_message(msg)
    print(f"✅ E-mail envoyé avec succès à {recipient} !")


def main():
    print("=== Démarrage de la génération du rapport Google Ads ===")
    try:
        client = get_client()
        print("Client GA4 initialisé avec succès.")

        # Extraction des données
        camp_data = fetch_campaign_report(client, days=7)
        search_terms = fetch_search_terms(client, days=7)
        site_activity = fetch_site_activity(client)

        print(f"Données extraites : {camp_data['total_clicks']} clics, CHF {camp_data['total_cost']:.2f}")

        # Rendu HTML
        html = generate_html_email(camp_data, search_terms, site_activity)

        # Envoi e-mail
        subject = f"🤿 Bulles en Valais — Rapport Google Ads du {local_now().strftime('%d/%m/%Y')}"
        send_email(subject, html)
        print("=== Fin de l'exécution avec succès ===")
    except Exception as e:
        print(f"❌ Erreur lors de l'exécution : {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
