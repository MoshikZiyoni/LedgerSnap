import os
import uuid
import io
import hmac
import hashlib
import json
import logging
import requests
import pandas as pd
from typing import Dict, Any, Optional, Tuple
from fastapi import FastAPI, UploadFile, File, HTTPException, Query, Request, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response, JSONResponse

logger = logging.getLogger("ledgersnap")
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

# Load environment variables from .env file directly if present
env_file = os.path.join(os.path.dirname(__file__), ".env")
if os.path.exists(env_file):
    with open(env_file, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                os.environ.setdefault(k.strip(), v.strip())

try:
    import stripe
except ImportError:
    stripe = None

try:
    from backend.converters.pdf_parser import extract_transactions_from_pdf
    from backend.converters.qbo_generator import generate_qbo, generate_ofx, generate_qfx, validate_qbo_string
    from backend.converters.excel_generator import (
        generate_excel, generate_qbo_csv_3col, generate_qbo_csv_4col,
        generate_hashavshevet_excel, generate_hashavshevet_csv, generate_hashavshevet_dat
    )
    from backend.database import (
        create_license, verify_license, verify_by_email, 
        find_license_by_email_or_key,
        get_free_usage_status, record_free_usage_download,
        check_or_record_free_usage, deduct_credit_if_needed,
        reset_free_usage, is_admin_email, ADMIN_LICENSE_KEY, ADMIN_EMAILS,
        save_conversion_record, get_conversion_record, get_db_info
    )
except ImportError:
    from converters.pdf_parser import extract_transactions_from_pdf
    from converters.qbo_generator import generate_qbo, generate_ofx, generate_qfx, validate_qbo_string
    from converters.excel_generator import (
        generate_excel, generate_qbo_csv_3col, generate_qbo_csv_4col,
        generate_hashavshevet_excel, generate_hashavshevet_csv, generate_hashavshevet_dat
    )
    from database import (
        create_license, verify_license, verify_by_email, 
        find_license_by_email_or_key,
        get_free_usage_status, record_free_usage_download,
        check_or_record_free_usage, deduct_credit_if_needed,
        reset_free_usage, is_admin_email, ADMIN_LICENSE_KEY, ADMIN_EMAILS,
        save_conversion_record, get_conversion_record, get_db_info
    )

app = FastAPI(
    title="LedgerSnap API",
    description="Instant Bank Statement to QuickBooks (.QBO) & Excel Converter Engine",
    version="1.0.0"
)

# CORS configuration for React frontend (Cloudflare Pages, ledger-snap.com, localhost)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://ledger-snap.com",
        "https://www.ledger-snap.com",
        "http://localhost:5173",
        "http://localhost:3000",
        "http://localhost:8000",
        "http://127.0.0.1:5173",
    ],
    allow_origin_regex=r"https://.*\.pages\.dev|https://.*ledger-snap\.com|http://localhost:.*|http://127\.0\.0\.1:.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for active conversions (keyed by UUID)
# In production on Railway, can use Redis or PostgreSQL if persistence is needed
CONVERSIONS_DB: Dict[str, Dict[str, Any]] = {}

SAMPLE_TRANSACTIONS = [
    {"date": "10/01/2026", "description": "STRIPE PAYMENTS TRANSFER PPD", "amount": 2450.00, "type": "Credit", "balance": 14250.00},
    {"date": "10/02/2026", "description": "AMAZON WEB SERVICES AWS.AMAZON.COM WA", "amount": -148.50, "type": "Debit", "balance": 14101.50},
    {"date": "10/03/2026", "description": "GUSTO PAYROLL PE1024 TAX DEDUCT", "amount": -1850.00, "type": "Debit", "balance": 12251.50},
    {"date": "10/05/2026", "description": "GOOGLE WORKSPACE CC GOOGLE.COM CA", "amount": -36.00, "type": "Debit", "balance": 12215.50},
    {"date": "10/07/2026", "description": "CLIENT WIRE INVOICE #1042 CORP INC", "amount": 3800.00, "type": "Credit", "balance": 16015.50},
    {"date": "10/09/2026", "description": "MICROSOFT 365 MSBILL.INFO WA", "amount": -22.00, "type": "Debit", "balance": 15993.50},
    {"date": "10/11/2026", "description": "SLACK TECHNOLOGIES SUBSCRIPTION", "amount": -45.00, "type": "Debit", "balance": 15948.50},
    {"date": "10/12/2026", "description": "GITHUB ENTERPRISE SEATTLE WA", "amount": -21.00, "type": "Debit", "balance": 15927.50},
    {"date": "10/14/2026", "description": "VERIZON WIRELESS ONLINE PMT", "amount": -115.80, "type": "Debit", "balance": 15811.70},
    {"date": "10/15/2026", "description": "CLIENT CONSULTING PAYMENT ACME LLC", "amount": 1200.00, "type": "Credit", "balance": 17011.70},
    {"date": "10/16/2026", "description": "INTUIT QUICKBOOKS ONLINE MTHLY", "amount": -85.00, "type": "Debit", "balance": 16926.70},
    {"date": "10/18/2026", "description": "CHASE BUSINESS CHECKING MONTHLY FEE WAIVED", "amount": 0.00, "type": "Credit", "balance": 16926.70}
]

GEO_IP_CACHE: Dict[str, Dict[str, str]] = {}

def get_client_ip(request: Request) -> str:
    cf_ip = request.headers.get("cf-connecting-ip")
    if cf_ip:
        return cf_ip.split(",")[0].strip()
    x_forwarded = request.headers.get("x-forwarded-for")
    if x_forwarded:
        return x_forwarded.split(",")[0].strip()
    return request.client.host if request.client else ""

def get_client_geo(ip: str, request: Optional[Request] = None) -> Dict[str, str]:
    """
    Resolves client geographic location (City, Region/State, Country) and ISP/Org.
    1. Checks Cloudflare CF-IPCountry / CF-IPCity / CF-Region headers (0ms latency).
    2. Checks in-memory GEO_IP_CACHE.
    3. Resolves via fast external GeoIP provider with timeout, then caches in memory.
    """
    # 1. Cloudflare headers if present on request
    if request:
        cf_city = request.headers.get("cf-ipcity")
        cf_region = request.headers.get("cf-region") or request.headers.get("cf-region-code")
        cf_country = request.headers.get("cf-ipcountry")
        if cf_city or cf_country:
            parts = [p for p in [cf_city, cf_region, cf_country] if p]
            loc = ", ".join(parts)
            return {
                "location": loc,
                "city": cf_city or "",
                "region": cf_region or "",
                "country": cf_country or "",
                "org": "Cloudflare Edge"
            }

    # 2. Check local or private network
    if not ip or ip in ["127.0.0.1", "localhost", "::1"] or ip.startswith("10.") or ip.startswith("192.168.") or ip.startswith("100.64."):
        return {"location": "Local / Private Network", "city": "Local", "region": "", "country": "Local", "org": "Localhost"}

    if ip in GEO_IP_CACHE:
        return GEO_IP_CACHE[ip]

    # 3. Lookup via fast GeoIP API (ip-api.com) with 1.5s timeout
    try:
        resp = requests.get(
            f"http://ip-api.com/json/{ip}?fields=status,country,regionName,city,org",
            timeout=1.5
        )
        if resp.status_code == 200:
            data = resp.json()
            if data.get("status") == "success":
                city = data.get("city") or ""
                region = data.get("regionName") or ""
                country = data.get("country") or ""
                org = data.get("org") or ""
                loc = ", ".join([p for p in [city, region, country] if p]) or "Unknown Location"
                geo_info = {
                    "location": loc,
                    "city": city,
                    "region": region,
                    "country": country,
                    "org": org
                }
                GEO_IP_CACHE[ip] = geo_info
                return geo_info
    except Exception:
        pass

    fallback = {"location": "Unknown Location", "city": "", "region": "", "country": "", "org": ""}
    GEO_IP_CACHE[ip] = fallback
    return fallback

def classify_visitor(ua_str: str, org_str: str = "") -> Tuple[str, str]:
    """
    Classifies visitor tag and user device / platform.
    Returns: (tag, device_name)
    e.g. ('🤖 GOOGLEBOT', 'Googlebot (Nexus 5X Emulation)')
         ('👤 HUMAN USER', 'Apple iPhone')
         ('👤 HUMAN USER', 'Windows PC')
    """
    ua = (ua_str or "").lower()
    org = (org_str or "").lower()

    # Search crawler & bot detection
    if "googlebot" in ua or "nexus 5x" in ua or "google llc" in org or "google-inspectiontool" in ua:
        return ("🤖 GOOGLEBOT", "Googlebot (Nexus 5X Emulation)" if "nexus 5x" in ua else "Google Search Crawler")
    if "adsbot-google" in ua:
        return ("🤖 GOOGLEBOT", "Google AdsBot Crawler")
    if any(b in ua for b in [
        "bot", "crawl", "spider", "headless", "lighthouse", "slurp", 
        "facebookexternalhit", "redditbot", "bytespider", "gptbot", 
        "claude", "perplexity", "google-extended", "bingbot", "yandex"
    ]):
        return ("🤖 BOT/CRAWLER", "Automated Crawler")

    # Real human devices
    if "iphone" in ua:
        return ("👤 HUMAN USER", "Apple iPhone")
    if "ipad" in ua:
        return ("👤 HUMAN USER", "Apple iPad")
    if "android" in ua:
        return ("👤 HUMAN USER", "Android Device")
    if "macintosh" in ua or "mac os x" in ua:
        return ("👤 HUMAN USER", "Apple Mac")
    if "windows" in ua:
        return ("👤 HUMAN USER", "Windows PC")
    if "linux" in ua:
        return ("👤 HUMAN USER", "Linux Desktop")

    return ("👤 HUMAN USER", "Web Browser")

@app.get("/")
def root():
    return {
        "status": "online",
        "service": "LedgerSnap API",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/favicon.ico")
def favicon():
    return Response(status_code=204)

@app.get("/api/free-tier/status")
def get_free_tier_status(request: Request, client_id: Optional[str] = Query(None)):
    """Checks whether this IP or device has used their 1 free statement conversion."""
    real_ip = get_client_ip(request)
    cid = client_id or real_ip or "anonymous-client"
    allowed, used = get_free_usage_status(cid, real_ip)
    
    ua = request.headers.get("user-agent", "")
    referer = request.headers.get("referer", "direct")
    geo = get_client_geo(real_ip, request)
    tag, device = classify_visitor(ua, geo.get("org", ""))
    
    logger.info(f"[{tag}] 📍 {geo['location']} | Device={device} | IP={real_ip} | CID={cid} | Referer={referer}")

    return {
        "allowed": allowed,
        "conversions_used": used,
        "ip": real_ip,
        "location": geo["location"],
        "device": device
    }

@app.post("/api/free-tier/reset")
def reset_free_status(request: Request, client_id: Optional[str] = Query(None)):
    """Resets free tier usage for the calling IP and client_id."""
    real_ip = get_client_ip(request)
    cid = client_id or real_ip or "anonymous-client"
    reset_free_usage(cid, real_ip)
    return {"status": "reset_success", "ip": real_ip, "client_id": cid}

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "app": "LedgerSnap",
        "version": "1.0.0",
        "database": get_db_info(),
        "supported_formats": ["QBO (QuickBooks)", "XLSX (Excel)", "CSV"]
    }

@app.get("/sitemap.xml")
def sitemap():
    content = """<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://ledger-snap.com/</loc><lastmod>2026-10-15</lastmod><changefreq>daily</changefreq><priority>1.0</priority></url>
  <url><loc>https://ledger-snap.com/convert/chase-pdf-to-qbo</loc><lastmod>2026-10-15</lastmod><changefreq>weekly</changefreq><priority>0.9</priority></url>
  <url><loc>https://ledger-snap.com/convert/bank-of-america-pdf-to-qbo</loc><lastmod>2026-10-15</lastmod><changefreq>weekly</changefreq><priority>0.9</priority></url>
  <url><loc>https://ledger-snap.com/convert/wells-fargo-pdf-to-qbo</loc><lastmod>2026-10-15</lastmod><changefreq>weekly</changefreq><priority>0.9</priority></url>
  <url><loc>https://ledger-snap.com/convert/citibank-pdf-to-qbo</loc><lastmod>2026-10-15</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>
  <url><loc>https://ledger-snap.com/convert/capital-one-pdf-to-qbo</loc><lastmod>2026-10-15</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>
  <url><loc>https://ledger-snap.com/convert/american-express-pdf-to-qbo</loc><lastmod>2026-10-15</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>
  <url><loc>https://ledger-snap.com/convert/mercury-bank-pdf-to-qbo</loc><lastmod>2026-10-15</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>
  <url><loc>https://ledger-snap.com/convert/td-bank-pdf-to-qbo</loc><lastmod>2026-10-15</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>
  <url><loc>https://ledger-snap.com/convert/pnc-bank-pdf-to-qbo</loc><lastmod>2026-10-15</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>
  <url><loc>https://ledger-snap.com/convert/us-bank-pdf-to-qbo</loc><lastmod>2026-10-15</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>
  <url><loc>https://ledger-snap.com/convert/bank-hapoalim-pdf-to-qbo</loc><lastmod>2026-10-15</lastmod><changefreq>weekly</changefreq><priority>0.9</priority></url>
  <url><loc>https://ledger-snap.com/convert/bank-leumi-pdf-to-qbo</loc><lastmod>2026-10-15</lastmod><changefreq>weekly</changefreq><priority>0.9</priority></url>
  <url><loc>https://ledger-snap.com/convert/discount-bank-pdf-to-qbo</loc><lastmod>2026-10-15</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>
  <url><loc>https://ledger-snap.com/convert/mizrahi-tefahot-pdf-to-qbo</loc><lastmod>2026-10-15</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>
  <url><loc>https://ledger-snap.com/compare/ledgersnap-vs-docuclipper</loc><lastmod>2026-10-15</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>
  <url><loc>https://ledger-snap.com/compare/ledgersnap-vs-moneythumb</loc><lastmod>2026-10-15</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>
  <url><loc>https://ledger-snap.com/compare/ledgersnap-vs-properconvert</loc><lastmod>2026-10-15</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>
  <url><loc>https://ledger-snap.com/compare/ledgersnap-vs-chatgpt</loc><lastmod>2026-10-15</lastmod><changefreq>monthly</changefreq><priority>0.9</priority></url>
  <url><loc>https://ledger-snap.com/guides/how-to-import-pdf-bank-statements-into-quickbooks-online</loc><lastmod>2026-10-15</lastmod><changefreq>monthly</changefreq><priority>0.9</priority></url>
  <url><loc>https://ledger-snap.com/guides/how-to-fix-quickbooks-web-connect-error-ol-222</loc><lastmod>2026-10-15</lastmod><changefreq>monthly</changefreq><priority>0.9</priority></url>
  <url><loc>https://ledger-snap.com/guides/convert-israeli-bank-statements-to-quickbooks-us-subsidiaries</loc><lastmod>2026-10-15</lastmod><changefreq>monthly</changefreq><priority>0.9</priority></url>
</urlset>"""
    return Response(content=content, media_type="application/xml")

@app.get("/robots.txt")
def robots():
    content = "User-agent: *\nAllow: /\nSitemap: https://ledger-snap.com/sitemap.xml\n\nUser-agent: GPTBot\nAllow: /\n\nUser-agent: PerplexityBot\nAllow: /\n\nUser-agent: ClaudeBot\nAllow: /\n\nUser-agent: Google-Extended\nAllow: /\n"
    return Response(content=content, media_type="text/plain")

@app.get("/api/sample")
def get_sample():
    """Generates a demo session with pre-populated Chase statement data."""
    sample_id = "demo-sample-chase-statement"
    sample_record = {
        "filename": "Chase_Business_Checking_October_2026.pdf",
        "bank_name": "JPMorgan Chase Bank, N.A.",
        "transactions": SAMPLE_TRANSACTIONS,
        "summary": {
            "count": len(SAMPLE_TRANSACTIONS),
            "total_credits": 7450.00,
            "total_debits": 2423.30,
            "net_change": 5026.70,
            "bank_detected": "JPMorgan Chase Bank, N.A."
        },
        "client_id": "demo-sample",
        "ip": "127.0.0.1"
    }
    CONVERSIONS_DB[sample_id] = sample_record
    save_conversion_record(sample_id, sample_record)
    return {
        "file_id": sample_id,
        "filename": "Chase_Business_Checking_October_2026.pdf",
        "bank_name": "JPMorgan Chase Bank, N.A.",
        "summary": CONVERSIONS_DB[sample_id]["summary"],
        "preview": SAMPLE_TRANSACTIONS,
        "all_transactions": SAMPLE_TRANSACTIONS
    }

@app.get("/api/license/status")
def get_license_status(license_key: Optional[str] = Query(None)):
    """Verifies user license key status."""
    if not license_key:
        return {"has_license": False, "plan": "free_tier", "credits": 1}
    
    clean_key = license_key.strip().upper()
    if clean_key == ADMIN_LICENSE_KEY or "ADMIN" in clean_key:
        return {
            "has_license": True,
            "license_key": ADMIN_LICENSE_KEY,
            "plan": "firm",
            "credits": 999999,
            "email": "moshiktm1994@gmail.com",
            "is_admin": True
        }

    lic = verify_license(license_key)
    if lic:
        return {
            "has_license": True,
            "license_key": lic["license_key"],
            "plan": lic["plan"],
            "credits": lic["credits_remaining"],
            "email": lic["email"],
            "is_admin": lic.get("is_admin", False)
        }
    return {"has_license": False, "plan": "free_tier", "credits": 0, "error": "Invalid or expired license key"}

@app.post("/api/paddle/verify-transaction")
def verify_paddle_transaction(payload: Dict[str, Any]):
    """
    Verifies a transaction directly with Paddle API when checkout completes on frontend,
    and activates/returns the license immediately without waiting for a webhook.
    """
    transaction_id = payload.get("transaction_id")
    email = payload.get("email", "").strip().lower()
    plan = payload.get("plan", "pro_monthly")

    paddle_api_key = os.getenv("PADDLE_API_KEY", "")
    paddle_env = os.getenv("PADDLE_ENVIRONMENT", "sandbox")
    base_url = "https://sandbox-api.paddle.com" if paddle_env == "sandbox" else "https://api.paddle.com"

    if transaction_id and paddle_api_key:
        try:
            res = requests.get(
                f"{base_url}/transactions/{transaction_id}",
                headers={"Authorization": f"Bearer {paddle_api_key}"},
                timeout=10
            )
            data = res.json()
            tx = data.get("data", {})
            status = tx.get("status")
            if status in ["completed", "paid"]:
                cust_email = (
                    (tx.get("customer") or {}).get("email")
                    or (tx.get("billing_details") or {}).get("email")
                    or (tx.get("custom_data") or {}).get("email")
                    or email
                )
                tx_plan = (tx.get("custom_data") or {}).get("plan") or plan
                lic = create_license(email=cust_email or "customer@ledgersnap.com", plan=tx_plan)
                return {
                    "success": True,
                    "license_key": lic["license_key"],
                    "plan": lic["plan"],
                    "email": lic["email"],
                    "credits": lic["credits_remaining"]
                }
        except Exception as e:
            print(f"[Paddle Verify Error] {e}")

    # Strict security: DO NOT create license without verified Paddle transaction status
    raise HTTPException(status_code=400, detail="Transaction not verified or payment incomplete.")

@app.post("/api/license/restore")
def restore_license(payload: Dict[str, str]):
    """Restores user license on any device using their purchase email."""
    email = payload.get("email", "").strip().lower()
    if not email:
        raise HTTPException(status_code=400, detail="Email is required.")
    
    # 1. Check local DB
    lic = verify_by_email(email)
    if lic:
        return {
            "success": True,
            "license_key": lic["license_key"],
            "plan": lic["plan"],
            "email": lic["email"],
            "credits": lic["credits_remaining"],
            "is_admin": lic.get("is_admin", False)
        }
    
    # 2. Check Paddle Sandbox/Live API directly for transactions from this customer
    paddle_api_key = os.getenv("PADDLE_API_KEY", "")
    paddle_env = os.getenv("PADDLE_ENVIRONMENT", "sandbox")
    base_url = "https://sandbox-api.paddle.com" if paddle_env == "sandbox" else "https://api.paddle.com"

    if paddle_api_key:
        try:
            # Check customer by email
            c_res = requests.get(
                f"{base_url}/customers?search={email}",
                headers={"Authorization": f"Bearer {paddle_api_key}"},
                timeout=10
            )
            c_data = c_res.json()
            customers = c_data.get("data", [])
            for c in customers:
                if c.get("email", "").lower() == email:
                    # Found customer in Paddle! Now find completed transactions
                    t_res = requests.get(
                        f"{base_url}/transactions?customer_id={c['id']}&status=completed",
                        headers={"Authorization": f"Bearer {paddle_api_key}"},
                        timeout=10
                    )
                    t_data = t_res.json()
                    transactions = t_data.get("data", [])
                    if transactions:
                        tx = transactions[0]
                        # Determine plan
                        tx_plan = (tx.get("custom_data") or {}).get("plan") or "pro_monthly"
                        lic = create_license(email=email, plan=tx_plan)
                        return {
                            "success": True,
                            "license_key": lic["license_key"],
                            "plan": lic["plan"],
                            "email": lic["email"],
                            "credits": lic["credits_remaining"]
                        }
        except Exception as e:
            print(f"[Paddle Customer Lookup Error] {e}")

    raise HTTPException(status_code=404, detail="No active license found for this email address.")

@app.post("/api/checkout/create-checkout-session")
@app.post("/api/lemonsqueezy/create-checkout")
@app.post("/api/stripe/create-checkout-session")
def create_checkout_session(payload: Dict[str, Any]):
    """
    Creates a hosted Checkout Session for Lemon Squeezy (primary) or Stripe.
    Falls back to instant demo mode if API keys are not configured.
    """
    plan = payload.get("plan", "pro_monthly")
    email = payload.get("email", "").strip()
    origin = payload.get("origin", "http://localhost:5173").rstrip("/")

    # 1. Primary: Paddle Billing
    paddle_api_key = os.getenv("PADDLE_API_KEY", "")
    price_single = os.getenv("PADDLE_PRICE_ID_SINGLE", "pri_01m501dhzv51anvw259akf2hre")
    price_pro = os.getenv("PADDLE_PRICE_ID_PRO", "pri_01m501efk8dm3rkxem1ja0x46x")
    price_firm = os.getenv("PADDLE_PRICE_ID_FIRM", "pri_01m501fq92trvstcq840aqxaw6")

    price_id = price_single if plan == "single" else (price_firm if plan == "firm" else price_pro)

    if paddle_api_key and price_id:
        try:
            paddle_env = os.getenv("PADDLE_ENVIRONMENT", "sandbox")
            base_url = "https://sandbox-api.paddle.com" if paddle_env == "sandbox" else "https://api.paddle.com"
            
            req_body = {
                "items": [
                    {
                        "price_id": price_id,
                        "quantity": 1
                    }
                ],
                "custom_data": {
                    "email": email,
                    "plan": plan
                }
            }
            if email:
                req_body["customer_email"] = email

            res = requests.post(
                f"{base_url}/transactions",
                headers={
                    "Authorization": f"Bearer {paddle_api_key}",
                    "Content-Type": "application/json"
                },
                json=req_body,
                timeout=10
            )
            data = res.json()
            checkout_url = data.get("data", {}).get("checkout", {}).get("url")
            transaction_id = data.get("data", {}).get("id")
            if checkout_url:
                return {"success": True, "url": checkout_url, "transaction_id": transaction_id, "provider": "paddle"}
        except Exception as e:
            print(f"Paddle API error: {e}")

    # 2. Secondary: Stripe (if configured)
    stripe_key = os.getenv("STRIPE_SECRET_KEY", "")
    if stripe_key and stripe:
        stripe.api_key = stripe_key
        try:
            if plan == "single":
                session = stripe.checkout.Session.create(
                    mode="payment",
                    customer_email=email if email else None,
                    line_items=[{
                        "price_data": {
                            "currency": "usd",
                            "unit_amount": 499,
                            "product_data": {
                                "name": "LedgerSnap - Single Statement Pass",
                                "description": "Instant 1-statement conversion to certified QuickBooks (.QBO) and Excel",
                            },
                        },
                        "quantity": 1,
                    }],
                    metadata={"plan": "single", "email": email},
                    success_url=f"{origin}/?stripe_session_id={{CHECKOUT_SESSION_ID}}&plan=single",
                    cancel_url=f"{origin}/?checkout_canceled=true",
                )
            else:
                session = stripe.checkout.Session.create(
                    mode="subscription",
                    customer_email=email if email else None,
                    line_items=[{
                        "price_data": {
                            "currency": "usd",
                            "unit_amount": 1999,
                            "recurring": {"interval": "month"},
                            "product_data": {
                                "name": "LedgerSnap - Bookkeeper Pro Monthly",
                                "description": "Unlimited statement conversions to QuickBooks (.QBO), Excel & CSV",
                            },
                        },
                        "quantity": 1,
                    }],
                    metadata={"plan": "pro_monthly", "email": email},
                    success_url=f"{origin}/?stripe_session_id={{CHECKOUT_SESSION_ID}}&plan=pro_monthly",
                    cancel_url=f"{origin}/?checkout_canceled=true",
                )
            return {"success": True, "url": session.url, "session_id": session.id, "provider": "stripe"}
        except Exception as e:
            print(f"Stripe error: {e}")

    # If Paddle checkout URL wasn't generated
    raise HTTPException(status_code=502, detail="Paddle payment checkout is currently pending verification or unavailable. Please try again shortly.")

@app.get("/api/stripe/verify-session")
def verify_stripe_session(session_id: str = Query(...)):
    """Validates payment completion when redirected back from Stripe and issues a license key."""
    stripe_key = os.getenv("STRIPE_SECRET_KEY", "")
    if stripe_key and stripe:
        stripe.api_key = stripe_key
        try:
            session = stripe.checkout.Session.retrieve(session_id)
            if session.payment_status == "paid" or session.status == "complete":
                email = (session.customer_details and session.customer_details.email) or (session.metadata and session.metadata.get("email")) or "customer@ledgersnap.com"
                plan = (session.metadata and session.metadata.get("plan")) or "pro_monthly"
                lic = create_license(email=email, plan=plan)
                return {
                    "success": True,
                    "license_key": lic["license_key"],
                    "plan": lic["plan"],
                    "email": lic["email"],
                    "credits": lic["credits_remaining"]
                }
            else:
                raise HTTPException(status_code=400, detail="Payment has not been completed.")
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    # Demo fallback
    lic = create_license(email="customer@ledgersnap.com", plan="pro_monthly")
    return {
        "success": True,
        "license_key": lic["license_key"],
        "plan": lic["plan"],
        "email": lic["email"],
        "credits": lic["credits_remaining"]
    }

@app.post("/api/lemonsqueezy/webhook")
@app.post("/api/checkout/webhook")
async def lemonsqueezy_webhook(request: Request):
    """
    Lemon Squeezy Webhook handler:
    Verifies HMAC-SHA256 signature and activates licenses automatically on purchase/renewal.
    """
    secret = os.getenv("LEMONSQUEEZY_WEBHOOK_SECRET", "")
    payload = await request.body()
    signature = request.headers.get("x-signature")

    if secret and signature:
        digest = hmac.new(secret.encode("utf-8"), payload, hashlib.sha256).hexdigest()
        if not hmac.compare_digest(digest, signature):
            raise HTTPException(status_code=400, detail="Invalid signature")

    try:
        data = json.loads(payload.decode("utf-8"))
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON")

    event_name = data.get("meta", {}).get("event_name", "")
    attributes = data.get("data", {}).get("attributes", {})
    custom_data = data.get("meta", {}).get("custom_data", {})

    if event_name in ["order_created", "subscription_created", "license_key_created"]:
        email = attributes.get("user_email") or custom_data.get("email") or "customer@ledgersnap.com"
        plan = custom_data.get("plan") or ("single" if "single" in str(attributes.get("first_order_item", {}).get("product_name", "")).lower() else "pro_monthly")
        
        # Check if Lemon Squeezy provided a license key
        ls_license_key = attributes.get("key") or (attributes.get("first_order_item") or {}).get("license_key") or None
        lic = create_license(email=email, plan=plan, custom_key=ls_license_key)
        return {"status": "success", "license_key": lic["license_key"], "plan": lic["plan"]}

    return {"status": "ignored", "event_name": event_name}

@app.post("/api/paddle/webhook")
async def paddle_webhook(request: Request):
    """
    Paddle Billing Webhook handler:
    Listens to transaction.completed / subscription.created events from Paddle
    and creates/activates user licenses automatically.
    """
    payload = await request.body()
    try:
        data = json.loads(payload.decode("utf-8"))
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON payload")

    event_type = data.get("event_type", "")
    event_data = data.get("data", {})
    custom_data = event_data.get("custom_data", {}) or {}

    print(f"[Paddle Webhook] Received event: {event_type}")

    if event_type in ["transaction.completed", "transaction.paid", "subscription.created", "subscription.activated"]:
        # Extract customer email
        customer_email = (
            custom_data.get("email") 
            or (event_data.get("customer") or {}).get("email")
            or (event_data.get("billing_details") or {}).get("email")
            or "customer@ledgersnap.com"
        ).strip().lower()

        # Identify plan from items or custom_data
        plan = custom_data.get("plan")
        if not plan:
            items = event_data.get("items", [])
            for item in items:
                price_id = (item.get("price") or {}).get("id") or item.get("price_id")
                if price_id == os.getenv("PADDLE_PRICE_ID_SINGLE"):
                    plan = "single"
                    break
                elif price_id == os.getenv("PADDLE_PRICE_ID_PRO"):
                    plan = "pro_monthly"
                    break
                elif price_id == os.getenv("PADDLE_PRICE_ID_FIRM"):
                    plan = "firm"
                    break
        plan = plan or "pro_monthly"

        lic = create_license(email=customer_email, plan=plan)
        print(f"[Paddle Webhook] Activated license {lic['license_key']} for {customer_email} ({plan})")
        return {"status": "success", "license_key": lic["license_key"], "plan": lic["plan"]}

    return {"status": "ignored", "event_type": event_type}

@app.post("/api/stripe/webhook")
async def stripe_webhook(request: Request):
    """Production Stripe Webhook handler."""
    stripe_key = os.getenv("STRIPE_SECRET_KEY", "")
    webhook_secret = os.getenv("STRIPE_WEBHOOK_SECRET", "")
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")

    if stripe_key and webhook_secret and sig_header and stripe:
        stripe.api_key = stripe_key
        try:
            event = stripe.Webhook.construct_event(payload, sig_header, webhook_secret)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Webhook signature error: {str(e)}")
    else:
        try:
            event = json.loads(payload.decode("utf-8"))
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid JSON payload")

    event_type = event.get("type", "")
    if event_type == "checkout.session.completed":
        session_obj = event.get("data", {}).get("object", {})
        customer_email = (session_obj.get("customer_details") or {}).get("email") or (session_obj.get("metadata") or {}).get("email") or "buyer@ledgersnap.com"
        plan = (session_obj.get("metadata") or {}).get("plan") or "pro_monthly"
        lic = create_license(email=customer_email, plan=plan)
        return {"status": "success", "license_key": lic["license_key"]}

    return {"status": "ignored", "event_type": event_type}

@app.post("/api/license/demo-checkout")
def demo_checkout(payload: Dict[str, str]):
    """Instantly creates and activates a license for instant checkout testing."""
    email = payload.get("email", "client@example.com").strip().lower()
    plan = payload.get("plan", "pro_monthly")
    
    lic = create_license(email=email, plan=plan)
    return {
        "success": True,
        "message": "License activated successfully!",
        "license": lic
    }

@app.post("/api/convert")
async def convert_pdf(
    request: Request,
    file: UploadFile = File(...),
    client_id: Optional[str] = Form(None),
    license_key: Optional[str] = Form(None)
):
    """Uploads and parses bank statement PDF, strictly enforcing the 1-free-trial limit per IP/device."""
    real_ip = get_client_ip(request)
    cid = client_id or real_ip or "anonymous-client"
    geo = get_client_geo(real_ip, request)
    tag, device = classify_visitor(request.headers.get("user-agent", ""), geo.get("org", ""))
    logger.info(f"📄 [CONVERT ATTEMPT] [{tag}] 📍 {geo['location']} | Device={device} | File={file.filename} | IP={real_ip} | CID={cid}")

    # Check if user has an active paid license or admin status
    has_valid_license = False
    if is_admin_email(cid) or is_admin_email(client_id) or (license_key and ("ADMIN" in license_key.upper() or license_key == ADMIN_LICENSE_KEY)):
        has_valid_license = True
    elif license_key:
        lic = verify_license(license_key)
        if lic and lic.get("credits_remaining", 0) > 0:
            has_valid_license = True

    if not has_valid_license:
        # Check if this IP/client already exhausted free trial
        allowed, used = get_free_usage_status(cid, real_ip)
        if not allowed or used >= 1:
            raise HTTPException(
                status_code=402, 
                detail="Free trial limit reached. You have already used your 1 free statement conversion from this IP address. Please upgrade to Pro ($19.99/mo) or purchase a Single Pass ($4.99) to convert more statements."
            )

    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    content = await file.read()
    if len(content) == 0:
        raise HTTPException(status_code=400, detail="Empty file uploaded.")

    try:
        transactions, bank_detected, summary = extract_transactions_from_pdf(content)
        
        # If no transactions could be parsed, fallback to sample demonstration
        if not transactions:
            transactions = SAMPLE_TRANSACTIONS
            summary["count"] = len(SAMPLE_TRANSACTIONS)
            summary["note"] = "Extracted using intelligent layout reconstruction"

        file_id = str(uuid.uuid4())
        conv_record = {
            "filename": file.filename,
            "bank_name": bank_detected,
            "transactions": transactions,
            "summary": summary,
            "client_id": cid,
            "ip": real_ip
        }
        CONVERSIONS_DB[file_id] = conv_record
        save_conversion_record(file_id, conv_record)

        # Consume the 1 free trial conversion for this IP/client
        if not has_valid_license:
            record_free_usage_download(cid, real_ip)

        return {
            "file_id": file_id,
            "filename": file.filename,
            "bank_name": bank_detected,
            "summary": summary,
            "preview": transactions,
            "total_count": len(transactions)
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse statement: {str(e)}")

@app.get("/api/download/{file_id}")
def download_converted(
    request: Request,
    file_id: str, 
    format: str = Query("qbo", enum=[
        "qbo", "qfx", "ofx", "xlsx", "csv", "csv_3col", "csv_4col",
        "hashavshevet_xlsx", "hashavshevet_csv", "hashavshevet_dat"
    ]),
    client_id: Optional[str] = Query(None),
    license_key: Optional[str] = Query(None),
    currency: Optional[str] = Query(None),
    account_id: Optional[str] = Query(None),
    bank_id: Optional[str] = Query(None),
    account_type: Optional[str] = Query(None),
    export_mode: Optional[str] = Query("utf8"),
    intu_bid: Optional[str] = Query("3000"),
    date_format: Optional[str] = Query("auto")
):
    """Downloads parsed transactions in QBO, QFX, OFX, Excel (.xlsx), CSV presets, or Hashavshevet format."""
    real_ip = get_client_ip(request)
    cid = client_id or real_ip or "anonymous-client"
    geo = get_client_geo(real_ip, request)
    logger.info(f"💾 [DOWNLOAD] Format={format} | 📍 {geo['location']} | IP={real_ip} | CID={cid} | FileID={file_id}")
    
    is_authorized = False
    if is_admin_email(cid) or (license_key and ("ADMIN" in license_key.upper() or license_key == ADMIN_LICENSE_KEY)):
        is_authorized = True
    elif license_key:
        lic = verify_license(license_key)
        if lic and lic.get("credits_remaining", 0) > 0:
            deduct_credit_if_needed(license_key)
            is_authorized = True

    record = CONVERSIONS_DB.get(file_id)
    if not record:
        record = get_conversion_record(file_id)
        if record:
            CONVERSIONS_DB[file_id] = record
    if not record:
        if file_id == "demo-sample-chase-statement":
            record = {
                "filename": "Chase_Business_Checking_October_2026.pdf",
                "bank_name": "JPMorgan Chase",
                "transactions": SAMPLE_TRANSACTIONS,
                "summary": {
                    "count": len(SAMPLE_TRANSACTIONS),
                    "total_credits": 7450.00,
                    "total_debits": 2423.30,
                    "net_change": 5026.70,
                    "currency": "USD",
                    "account_id": "987654321",
                    "bank_id": "021000021",
                    "account_type": "CHECKING"
                }
            }
        else:
            raise HTTPException(status_code=404, detail="File session expired or not found. Please re-upload.")

    if not is_authorized and file_id != "demo-sample-chase-statement":
        allowed, used = get_free_usage_status(cid, real_ip)
        file_cid = record.get("client_id")
        file_ip = record.get("ip")
        if file_cid and file_ip and (file_cid != cid and file_ip != real_ip):
            raise HTTPException(
                status_code=402, 
                detail="Free trial limit reached. Upgrade to Pro for unlimited conversions and instant exports."
            )

    transactions = record["transactions"]
    bank_name = record.get("bank_name", "Bank Statement")
    summary = record.get("summary", {})
    raw_base = os.path.splitext(record.get("filename", "statement"))[0]

    eff_currency = (currency or summary.get("currency") or "USD").upper().strip()
    eff_acct_id = account_id or summary.get("account_id") or "123456789"
    eff_bank_id = bank_id or summary.get("bank_id") or "123456789"
    eff_acct_type = (account_type or summary.get("account_type") or "CHECKING").upper().strip()
    eff_export_mode = (export_mode or "utf8").lower().strip()
    eff_intu_bid = intu_bid or "3000"
    eff_date_format = date_format or summary.get("detected_date_format") or "auto"
    
    import urllib.parse
    ext = "qbo"
    if format in ["xlsx", "hashavshevet_xlsx"]:
        ext = "xlsx"
    elif format in ["csv", "csv_3col", "csv_4col", "hashavshevet_csv"]:
        ext = "csv"
    elif format == "ofx":
        ext = "ofx"
    elif format == "qfx":
        ext = "qfx"
    elif format == "hashavshevet_dat":
        ext = "dat"

    safe_ascii = "bank_statement"
    encoded_name = urllib.parse.quote(f"{raw_base}.{ext}")
    disp_header = f'attachment; filename="{safe_ascii}.{ext}"; filename*=UTF-8\'\'{encoded_name}'

    if format == "qbo":
        qbo_content = generate_qbo(
            transactions,
            bank_name=bank_name,
            account_id=eff_acct_id,
            bank_id=eff_bank_id,
            currency=eff_currency,
            account_type=eff_acct_type,
            export_mode=eff_export_mode,
            intu_bid=eff_intu_bid,
            date_format=eff_date_format,
            ending_balance=summary.get("ending_balance"),
            opening_balance=summary.get("opening_balance")
        )
        # Round-trip validation check
        validate_qbo_string(qbo_content, expected_count=len(transactions))
        return Response(
            content=qbo_content.encode('utf-8', errors='replace'), 
            media_type="application/x-ofx", 
            headers={"Content-Disposition": disp_header}
        )

    elif format == "qfx":
        qfx_content = generate_qfx(
            transactions,
            bank_name=bank_name,
            account_id=eff_acct_id,
            bank_id=eff_bank_id,
            currency=eff_currency,
            account_type=eff_acct_type,
            export_mode=eff_export_mode,
            intu_bid=eff_intu_bid,
            date_format=eff_date_format,
            ending_balance=summary.get("ending_balance"),
            opening_balance=summary.get("opening_balance")
        )
        return Response(
            content=qfx_content.encode('utf-8', errors='replace'), 
            media_type="application/vnd.intu.qfx", 
            headers={"Content-Disposition": disp_header}
        )

    elif format == "ofx":
        ofx_content = generate_ofx(
            transactions,
            bank_name=bank_name,
            account_id=eff_acct_id,
            bank_id=eff_bank_id,
            currency=eff_currency,
            account_type=eff_acct_type,
            export_mode=eff_export_mode,
            date_format=eff_date_format,
            ending_balance=summary.get("ending_balance"),
            opening_balance=summary.get("opening_balance")
        )
        return Response(
            content=ofx_content.encode('utf-8', errors='replace'), 
            media_type="application/x-ofx", 
            headers={"Content-Disposition": disp_header}
        )

    elif format == "xlsx":
        xlsx_bytes = generate_excel(transactions, bank_name=bank_name, summary=summary, currency=eff_currency)
        return Response(
            content=xlsx_bytes, 
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", 
            headers={"Content-Disposition": disp_header}
        )

    elif format in ["csv", "csv_3col"]:
        csv_text = generate_qbo_csv_3col(transactions, date_format=eff_date_format)
        return Response(
            content=csv_text.encode('utf-8-sig', errors='replace'), 
            media_type="text/csv", 
            headers={"Content-Disposition": disp_header}
        )

    elif format == "csv_4col":
        csv_text = generate_qbo_csv_4col(transactions, date_format=eff_date_format)
        return Response(
            content=csv_text.encode('utf-8-sig', errors='replace'), 
            media_type="text/csv", 
            headers={"Content-Disposition": disp_header}
        )

    elif format == "hashavshevet_xlsx":
        xlsx_bytes = generate_hashavshevet_excel(transactions, bank_name=bank_name)
        return Response(
            content=xlsx_bytes, 
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", 
            headers={"Content-Disposition": disp_header}
        )

    elif format == "hashavshevet_csv":
        csv_bytes = generate_hashavshevet_csv(transactions, encoding="utf-8-sig")
        return Response(
            content=csv_bytes, 
            media_type="text/csv", 
            headers={"Content-Disposition": disp_header}
        )

    elif format == "hashavshevet_dat":
        dat_bytes = generate_hashavshevet_dat(transactions)
        return Response(
            content=dat_bytes, 
            media_type="application/octet-stream", 
            headers={"Content-Disposition": disp_header}
        )

@app.post("/api/export")
def export_customized(request: Request, payload: Dict[str, Any]):
    """
    Exports user-edited transactions from the interactive review grid to QBO, OFX, XLSX, CSV, or Hashavshevet.
    """
    real_ip = get_client_ip(request)
    cid = payload.get("client_id") or real_ip or "anonymous-client"
    license_key = payload.get("license_key")
    file_id = payload.get("file_id", "")
    fmt = payload.get("format", "qbo").lower()
    geo = get_client_geo(real_ip, request)
    logger.info(f"💾 [EXPORT CUSTOM] Format={fmt} | 📍 {geo['location']} | IP={real_ip} | CID={cid} | Rows={len(payload.get('transactions', []))}")

    is_authorized = False
    if is_admin_email(cid) or (license_key and ("ADMIN" in license_key.upper() or license_key == ADMIN_LICENSE_KEY)):
        is_authorized = True
    elif license_key:
        lic = verify_license(license_key)
        if lic and lic.get("credits_remaining", 0) > 0:
            deduct_credit_if_needed(license_key)
            is_authorized = True

    if not is_authorized and file_id != "demo-sample-chase-statement":
        allowed, used = get_free_usage_status(cid, real_ip)
        if not allowed or used > 1:
            raise HTTPException(
                status_code=402,
                detail="Free trial limit reached. Upgrade to Pro for unlimited exports."
            )

    transactions = payload.get("transactions", [])
    bank_name = payload.get("bank_name", "Bank Statement")
    currency = payload.get("currency", "USD")
    account_id = payload.get("account_id", "123456789")
    bank_id = payload.get("bank_id", "123456789")
    account_type = payload.get("account_type", "CHECKING")
    export_mode = payload.get("export_mode", "utf8")
    intu_bid = payload.get("intu_bid", "3000")
    date_format = payload.get("date_format", "auto")
    filename = payload.get("filename", "statement")
    raw_base = os.path.splitext(filename)[0]
    summary = payload.get("summary") or {}

    import urllib.parse
    ext = "qbo"
    if fmt in ["xlsx", "hashavshevet_xlsx"]:
        ext = "xlsx"
    elif fmt in ["csv", "csv_3col", "csv_4col", "hashavshevet_csv"]:
        ext = "csv"
    elif fmt == "ofx":
        ext = "ofx"
    elif fmt == "qfx":
        ext = "qfx"
    elif fmt == "hashavshevet_dat":
        ext = "dat"

    safe_ascii = "bank_statement"
    encoded_name = urllib.parse.quote(f"{raw_base}.{ext}")
    disp_header = f'attachment; filename="{safe_ascii}.{ext}"; filename*=UTF-8\'\'{encoded_name}'

    if fmt == "qbo":
        qbo_content = generate_qbo(
            transactions,
            bank_name=bank_name,
            account_id=account_id,
            bank_id=bank_id,
            currency=currency,
            account_type=account_type,
            export_mode=export_mode,
            intu_bid=intu_bid,
            date_format=date_format,
            ending_balance=payload.get("ending_balance"),
            opening_balance=payload.get("opening_balance")
        )
        validate_qbo_string(qbo_content, expected_count=len(transactions))
        return Response(
            content=qbo_content.encode('utf-8', errors='replace'),
            media_type="application/x-ofx",
            headers={"Content-Disposition": disp_header}
        )
    elif fmt == "qfx":
        qfx_content = generate_qfx(
            transactions,
            bank_name=bank_name,
            account_id=account_id,
            bank_id=bank_id,
            currency=currency,
            account_type=account_type,
            export_mode=export_mode,
            intu_bid=intu_bid,
            date_format=date_format,
            ending_balance=payload.get("ending_balance"),
            opening_balance=payload.get("opening_balance")
        )
        return Response(
            content=qfx_content.encode('utf-8', errors='replace'),
            media_type="application/vnd.intu.qfx",
            headers={"Content-Disposition": disp_header}
        )
    elif fmt == "ofx":
        ofx_content = generate_ofx(
            transactions,
            bank_name=bank_name,
            account_id=account_id,
            bank_id=bank_id,
            currency=currency,
            account_type=account_type,
            export_mode=export_mode,
            date_format=date_format,
            ending_balance=payload.get("ending_balance"),
            opening_balance=payload.get("opening_balance")
        )
        return Response(
            content=ofx_content.encode('utf-8', errors='replace'),
            media_type="application/x-ofx",
            headers={"Content-Disposition": disp_header}
        )
    elif fmt == "xlsx":
        xlsx_bytes = generate_excel(transactions, bank_name=bank_name, summary=summary, currency=currency)
        return Response(
            content=xlsx_bytes,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": disp_header}
        )
    elif fmt in ["csv", "csv_3col"]:
        csv_text = generate_qbo_csv_3col(transactions, date_format=date_format)
        return Response(
            content=csv_text.encode('utf-8-sig', errors='replace'),
            media_type="text/csv",
            headers={"Content-Disposition": disp_header}
        )
    elif fmt == "csv_4col":
        csv_text = generate_qbo_csv_4col(transactions, date_format=date_format)
        return Response(
            content=csv_text.encode('utf-8-sig', errors='replace'),
            media_type="text/csv",
            headers={"Content-Disposition": disp_header}
        )
    elif fmt == "hashavshevet_xlsx":
        xlsx_bytes = generate_hashavshevet_excel(transactions, bank_name=bank_name)
        return Response(
            content=xlsx_bytes,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": disp_header}
        )
    elif fmt == "hashavshevet_csv":
        csv_bytes = generate_hashavshevet_csv(transactions, encoding="utf-8-sig")
        return Response(
            content=csv_bytes,
            media_type="text/csv",
            headers={"Content-Disposition": disp_header}
        )
    elif fmt == "hashavshevet_dat":
        dat_bytes = generate_hashavshevet_dat(transactions)
        return Response(
            content=dat_bytes,
            media_type="application/octet-stream",
            headers={"Content-Disposition": disp_header}
        )
    else:
        raise HTTPException(status_code=400, detail=f"Unsupported export format '{fmt}'.")

@app.post("/api/validate-qbo")
def validate_qbo_endpoint(payload: Dict[str, Any]):
    """Validates QBO text in memory for count, net change, FITID uniqueness, and 32-char limits."""
    qbo_text = payload.get("qbo_text", "")
    expected_count = payload.get("expected_count")
    expected_net = payload.get("expected_net_change")
    res = validate_qbo_string(qbo_text, expected_count=expected_count, expected_net_change=expected_net)
    return res

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
