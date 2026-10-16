#!/usr/bin/env python3
"""
Unit tests for send_report.py — Google Ads reporting script.
Standard library only: unittest, unittest.mock.
"""

import html
import os
import smtplib
import unittest
from datetime import datetime
from unittest.mock import MagicMock, patch

# Note: send_report must be importable without google-analytics-data installed.
import send_report


class FakeType:
    def __init__(self, **kwargs):
        self.kwargs = kwargs
        for k, v in kwargs.items():
            setattr(self, k, v)

    def __repr__(self):
        return f"{self.__class__.__name__}({self.kwargs})"


class FakeTypes:
    RunReportRequest = FakeType
    DateRange = FakeType
    Dimension = FakeType
    Metric = FakeType

    class OrderBy(FakeType):
        class MetricOrderBy(FakeType):
            pass


class TestReportRange(unittest.TestCase):
    def test_default_report_range(self):
        r = send_report.report_range()
        self.assertEqual(r, {"start_date": f"{send_report.REPORT_DAYS}daysAgo", "end_date": "yesterday"})
        self.assertEqual(send_report.REPORT_DAYS, 7)

    def test_custom_days_range(self):
        r = send_report.report_range(days=14)
        self.assertEqual(r, {"start_date": "14daysAgo", "end_date": "yesterday"})


class TestLocalNow(unittest.TestCase):
    def test_local_now_returns_zurich_datetime(self):
        now = send_report.local_now()
        self.assertIsInstance(now, datetime)
        self.assertIsNotNone(now.tzinfo)
        tz_key = getattr(now.tzinfo, "key", str(now.tzinfo))
        self.assertEqual(tz_key, "Europe/Zurich")


class TestBuildRequests(unittest.TestCase):
    def test_build_campaign_request(self):
        req = send_report.build_campaign_request(FakeTypes, days=7)
        self.assertTrue(req.property.startswith("properties/"))
        self.assertEqual(len(req.date_ranges), 1)
        self.assertEqual(req.date_ranges[0].start_date, "7daysAgo")
        self.assertEqual(req.date_ranges[0].end_date, "yesterday")

        dim_names = [d.name for d in req.dimensions]
        self.assertIn("sessionGoogleAdsCampaignName", dim_names)
        self.assertIn("sessionGoogleAdsAdGroupName", dim_names)

        metric_names = [m.name for m in req.metrics]
        self.assertIn("advertiserAdImpressions", metric_names)
        self.assertIn("advertiserAdClicks", metric_names)
        self.assertIn("advertiserAdCost", metric_names)
        self.assertIn("advertiserAdCostPerClick", metric_names)
        self.assertIn("keyEvents:generate_lead", metric_names)
        self.assertIn("keyEvents:whatsapp_click", metric_names)
        self.assertIn("keyEvents:phone_click", metric_names)

    def test_build_search_terms_request(self):
        req = send_report.build_search_terms_request(FakeTypes, days=7)
        self.assertTrue(req.property.startswith("properties/"))
        self.assertEqual(req.date_ranges[0].start_date, "7daysAgo")
        self.assertEqual(req.date_ranges[0].end_date, "yesterday")
        self.assertEqual(req.limit, send_report.SEARCH_TERMS_LIMIT)
        self.assertEqual(send_report.SEARCH_TERMS_LIMIT, 20)

        dim_names = [d.name for d in req.dimensions]
        self.assertIn("sessionGoogleAdsQuery", dim_names)
        self.assertIn("sessionGoogleAdsAdGroupName", dim_names)

        # Ordering by advertiserAdClicks descending
        self.assertEqual(len(req.order_bys), 1)
        order_by = req.order_bys[0]
        self.assertTrue(order_by.desc)
        self.assertEqual(order_by.metric.metric_name, "advertiserAdClicks")


class TestGenerateHtmlEmail(unittest.TestCase):
    def setUp(self):
        self.camp_data = {
            "period_days": 7,
            "total_impressions": 100,
            "total_clicks": 10,
            "total_cost": 15.50,
            "avg_ctr": 10.0,
            "avg_cpc": 1.55,
            "total_leads": 1,
            "total_whatsapp": 1,
            "total_phone": 0,
            "total_conversions": 2,
            "cpa": 7.75,
            "rows": [
                {
                    "campaign": "Search-BEV",
                    "ad_group": '<script>alert("adgroup")</script>',
                    "impressions": 100,
                    "clicks": 10,
                    "cost": 15.50,
                    "cpc": 1.55,
                    "leads": 1,
                    "whatsapp": 1,
                    "phone": 0,
                }
            ],
        }
        self.search_terms = [
            {
                "query": '<a href="evil.com">cours plongée</a>',
                "ad_group": '<b>Groupe XSS</b>',
                "clicks": 5,
                "cost": 7.50,
                "leads": 1,
            }
        ]
        self.site_activity = {
            "yesterday": {"generate_lead": 1, "whatsapp_click": 2, "phone_click": 0},
            "today": {"generate_lead": 0, "whatsapp_click": 1, "phone_click": 0},
        }

    def test_escapes_xss_in_ad_group_and_query(self):
        body = send_report.generate_html_email(self.camp_data, self.search_terms, self.site_activity)

        # Raw HTML strings must NOT be present unescaped
        self.assertNotIn('<script>alert("adgroup")</script>', body)
        self.assertNotIn('<a href="evil.com">cours plongée</a>', body)
        self.assertNotIn('<b>Groupe XSS</b>', body)

        # Escaped representations must be present
        self.assertIn(html.escape('<script>alert("adgroup")</script>'), body)
        self.assertIn(html.escape('<a href="evil.com">cours plongée</a>'), body)
        self.assertIn(html.escape('<b>Groupe XSS</b>'), body)

    def test_uses_local_now_in_header(self):
        body = send_report.generate_html_email(self.camp_data, self.search_terms, self.site_activity)
        expected_date = send_report.local_now().strftime("%d/%m/%Y")
        self.assertIn(expected_date, body)


class TestSendEmail(unittest.TestCase):
    @patch.dict(os.environ, {"SMTP_USER": "test@example.com", "SMTP_PASS": "secret"}, clear=True)
    @patch("smtplib.SMTP")
    def test_send_email_uses_context_manager_and_closes_connection(self, mock_smtp_cls):
        mock_server = MagicMock()
        mock_smtp_cls.return_value.__enter__.return_value = mock_server

        send_report.send_email("Test Subject", "<p>Hello</p>")

        mock_smtp_cls.assert_called_once_with("smtp.gmail.com", 587, timeout=30)
        mock_server.starttls.assert_called_once()
        mock_server.login.assert_called_once_with("test@example.com", "secret")
        mock_server.send_message.assert_called_once()
        mock_smtp_cls.return_value.__exit__.assert_called_once()

    @patch.dict(os.environ, {"SMTP_USER": "test@example.com", "SMTP_PASS": "wrong_secret"}, clear=True)
    @patch("smtplib.SMTP")
    def test_send_email_closes_connection_when_auth_fails(self, mock_smtp_cls):
        mock_server = MagicMock()
        mock_server.login.side_effect = smtplib.SMTPAuthenticationError(535, b"Auth failed")
        mock_smtp_cls.return_value.__enter__.return_value = mock_server

        with self.assertRaises(smtplib.SMTPAuthenticationError):
            send_report.send_email("Test Subject", "<p>Hello</p>")

        # __exit__ must have been called even though login raised
        mock_smtp_cls.return_value.__exit__.assert_called_once()

    @patch.dict(os.environ, {}, clear=True)
    @patch("smtplib.SMTP")
    def test_send_email_raises_value_error_if_env_missing(self, mock_smtp_cls):
        with self.assertRaises(ValueError):
            send_report.send_email("Test Subject", "<p>Hello</p>")
        mock_smtp_cls.assert_not_called()


if __name__ == "__main__":
    unittest.main()
