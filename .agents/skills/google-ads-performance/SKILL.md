---
name: google-ads-performance
description: >-
  Analyse la performance de la campagne Google Ads pour Bulles en Valais (Search-BEV),
  incluant les clics, impressions, coûts, coût par clic (CPC), conversions (leads, WhatsApp, appels)
  et requêtes réelles des internautes. À activer dès que l'utilisateur demande d'analyser,
  d'auditer ou d'afficher les performances de sa campagne Google Ads ou de sa publicité en ligne.
---

# Analyse de Performance Google Ads — Bulles en Valais

Ce skill fournit la méthodologie complète pour auditer et présenter l'analyse de performance de la campagne Google Ads `Search-BEV` de Bulles en Valais en s'appuyant sur les données collectées via Google Analytics 4 (propriété `properties/358387240`).

---

## 1. Données à extraire via l'outil MCP `ga_run_report`

Pour obtenir les métriques de la campagne, appeler l'outil MCP `call_mcp_tool` sur le serveur `google-analytics` avec la méthode `ga_run_report` et la propriété `properties/358387240`.

### Requête 1 : Vue globale de la campagne et des groupes d'annonces
```json
{
  "property": "properties/358387240",
  "dateRanges": [{ "startDate": "30daysAgo", "endDate": "today" }],
  "dimensions": [
    { "name": "sessionGoogleAdsCampaignName" },
    { "name": "sessionGoogleAdsAdGroupName" }
  ],
  "metrics": [
    { "name": "advertiserAdImpressions" },
    { "name": "advertiserAdClicks" },
    { "name": "advertiserAdCost" },
    { "name": "advertiserAdCostPerClick" },
    { "name": "keyEvents:generate_lead" },
    { "name": "keyEvents:whatsapp_click" },
    { "name": "keyEvents:phone_click" },
    { "name": "advertiserAdCostPerKeyEvent" }
  ]
}
```

### Requête 2 : Analyse des requêtes de recherche réelles (Search Terms)
Pour détecter les requêtes exactes tapées par les internautes qui ont déclenché l'annonce :
```json
{
  "property": "properties/358387240",
  "dateRanges": [{ "startDate": "30daysAgo", "endDate": "today" }],
  "dimensions": [
    { "name": "sessionGoogleAdsQuery" },
    { "name": "sessionGoogleAdsAdGroupName" }
  ],
  "metrics": [
    { "name": "advertiserAdClicks" },
    { "name": "advertiserAdCost" },
    { "name": "keyEvents:generate_lead" }
  ]
}
```

### Requête 3 : Activité temps réel (dernières 30 minutes)
Pour vérifier si du trafic est actuellement actif sur le site :
```json
{
  "property": "properties/358387240",
  "dimensions": [{ "name": "eventName" }],
  "metrics": [{ "name": "eventCount" }]
}
```
*(via `ga_run_realtime_report`)*

---

## 2. Structure du Rapport d'Analyse à afficher

Lorsque ce skill est exécuté, présenter les résultats sous la forme d'un tableau de bord clair et décisionnel structuré comme suit :

### A. Synthèse Exécutive (Le bilan rapide)
* **Budget consommé vs Budget alloué** : Total dépensé sur la période comparé au plafond quotidien (CHF 3.00/jour).
* **Volume d'acquisition** : Nombre total d'impressions et de clics générés.
* **Taux de clic moyen (CTR)** : Pourcentage `(Clics / Impressions) * 100` (objectif Search local : > 5-7 %).
* **Coût Moyen par Clic (CPC réel)** : Comparé à la limite fixée (CHF 2.00 max).

### B. Tableau de Performance par Groupe d'Annonces
Présenter un tableau comparatif :

| Groupe d'annonces | Impressions | Clics | CTR | Coût Total | CPC moyen | Formulaires (`lead`) | Clics WhatsApp | Clics Tél | Coût par Lead (CPA) |
|---|---|---|---|---|---|---|---|---|---|
| `Baptême plongée` | ... | ... | ...% | CHF ... | CHF ... | ... | ... | ... | CHF ... |
| `Cours & Open Water` | ... | ... | ...% | CHF ... | CHF ... | ... | ... | ... | CHF ... |
| **Total Campagne** | **...** | **...** | **...%** | **CHF ...** | **CHF ...** | **...** | **...** | **...** | **CHF ...** |

### C. Analyse des Requêtes de Recherche (Search Terms)
* **Top requêtes rentables** : Celles qui ont déclenché une conversion (`generate_lead`, `whatsapp_click`).
* **Requêtes parasites / Hors-sujet** : Repérer les termes non pertinents qui ont consommé du budget sans convertir.

### D. Recommandations d'Optimisation Immédiates
1. **Mots-clés négatifs à ajouter** : Lister les nouveaux mots-clés à exclure d'après les requêtes parasites observées.
2. **Ajustement d'enchères ou de budget** : Si un groupe d'annonces surperforme en conversion (ex. les baptêmes ont un CPA très bas), recommander de lui allouer plus de poids.
3. **Optimisation d'annonces** : Identifier les titres ou descriptions qui génèrent le meilleur CTR.
