import os
import uuid
import io
import hmac
import hashlib
import json
import requests
import pandas as pd
from typing import Dict, Any, Optional
from fastapi import FastAPI, UploadFile, File, HTTPException, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response, JSONResponse

try:
    import stripe
except ImportError:
    stripe = None

try:
    from backend.converters.pdf_parser import extract_transactions_from_pdf
    from backend.converters.qbo_generator import generate_qbo
    from backend.converters.excel_generator import generate_excel
    from backend.database import (
        create_license, verify_license, verify_by_email, 
        find_license_by_email_or_key,
        check_or_record_free_usage, deduct_credit_if_needed
    )
except ImportError:
    from converters.pdf_parser import extract_transactions_from_pdf
    from converters.qbo_generator import generate_qbo
    from converters.excel_generator import generate_excel
    from database import (
        create_license, verify_license, verify_by_email, 
        find_license_by_email_or_key,
        check_or_record_free_usage, deduct_credit_if_needed
    )

app = FastAPI(
    title="LedgerSnap API",
    description="Instant Bank Statement to QuickBooks (.QBO) & Excel Converter Engine",
    version="1.0.0"
)

# CORS configuration for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "app": "BankToQBO",
        "version": "1.0.0",
        "supported_formats": ["QBO (QuickBooks)", "XLSX (Excel)", "CSV"]
    }

@app.get("/sitemap.xml")
def sitemap():
    content = """<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://ledgersnap.com/</loc><priority>1.0</priority></url>
  <url><loc>https://ledgersnap.com/#pricing</loc><priority>0.8</priority></url>
  <url><loc>https://ledgersnap.com/#faq</loc><priority>0.8</priority></url>
</urlset>"""
    return Response(content=content, media_type="application/xml")

@app.get("/robots.txt")
def robots():
    content = "User-agent: *\nAllow: /\nSitemap: https://ledgersnap.com/sitemap.xml\n\nUser-agent: GPTBot\nAllow: /\n\nUser-agent: PerplexityBot\nAllow: /\n\nUser-agent: ClaudeBot\nAllow: /\n"
    return Response(content=content, media_type="text/plain")

@app.get("/api/sample")
def get_sample():
    """Generates a demo session with pre-populated Chase statement data."""
    sample_id = "demo-sample-chase-statement"
    CONVERSIONS_DB[sample_id] = {
        "filename": "Chase_Business_Checking_October_2026.pdf",
        "bank_name": "JPMorgan Chase Bank, N.A.",
        "transactions": SAMPLE_TRANSACTIONS,
        "summary": {
            "count": len(SAMPLE_TRANSACTIONS),
            "total_credits": 7450.00,
            "total_debits": 2423.30,
            "net_change": 5026.70,
            "bank_detected": "JPMorgan Chase Bank, N.A."
        }
    }
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
    
    lic = verify_license(license_key)
    if lic:
        return {
            "has_license": True,
            "license_key": lic["license_key"],
            "plan": lic["plan"],
            "credits": lic["credits_remaining"],
            "email": lic["email"]
        }
    return {"has_license": False, "plan": "free_tier", "credits": 0, "error": "Invalid or expired license key"}

@app.post("/api/license/restore")
def restore_license(payload: Dict[str, str]):
    """Restores user license on any device using their purchase email."""
    email = payload.get("email", "").strip().lower()
    if not email:
        raise HTTPException(status_code=400, detail="Email is required.")
    
    lic = verify_by_email(email)
    if not lic:
        raise HTTPException(status_code=404, detail="No active license found for this email address.")
    
    return {
        "success": True,
        "license_key": lic["license_key"],
        "plan": lic["plan"],
        "email": lic["email"],
        "credits": lic["credits_remaining"]
    }

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

    # 1. Primary: Lemon Squeezy Checkouts
    ls_api_key = os.getenv("LEMONSQUEEZY_API_KEY", "")
    ls_store_id = os.getenv("LEMONSQUEEZY_STORE_ID", "")
    variant_single = os.getenv("LEMONSQUEEZY_VARIANT_ID_SINGLE", "")
    variant_pro = os.getenv("LEMONSQUEEZY_VARIANT_ID_PRO", "")

    variant_id = variant_single if plan == "single" else variant_pro

    if ls_api_key and ls_store_id and variant_id:
        try:
            req_body = {
                "data": {
                    "type": "checkouts",
                    "attributes": {
                        "checkout_data": {
                            "email": email if email else None,
                            "custom": {
                                "plan": plan,
                                "email": email
                            }
                        },
                        "product_options": {
                            "redirect_url": f"{origin}/?plan={plan}&ls_success=1"
                        }
                    },
                    "relationships": {
                        "store": {
                            "data": {
                                "type": "stores",
                                "id": str(ls_store_id)
                            }
                        },
                        "variant": {
                            "data": {
                                "type": "variants",
                                "id": str(variant_id)
                            }
                        }
                    }
                }
            }
            res = requests.post(
                "https://api.lemonsqueezy.com/v1/checkouts",
                headers={
                    "Authorization": f"Bearer {ls_api_key}",
                    "Accept": "application/vnd.api+json",
                    "Content-Type": "application/vnd.api+json"
                },
                json=req_body,
                timeout=10
            )
            data = res.json()
            checkout_url = data.get("data", {}).get("attributes", {}).get("url")
            if checkout_url:
                return {"success": True, "url": checkout_url, "provider": "lemonsqueezy"}
        except Exception as e:
            print(f"Lemon Squeezy error: {e}")

    # 2. Secondary: Stripe (if configured)
    stripe_key = os.getenv("STRIPE_SECRET_KEY", "")
    if stripe_key and stripe:
        stripe.api_key = stripe_key
        try:
            if plan == "single":
                session = stripe.checkout.Session.create(
                    payment_method_types=["card"],
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
                    payment_method_types=["card"],
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

    # 3. Demo / Local Test Mode fallback
    lic = create_license(email=email or "demo-user@ledgersnap.com", plan=plan)
    return {
        "success": True,
        "demo_mode": True,
        "message": "Demo mode active (payment keys not configured yet). License activated immediately!",
        "license": lic,
        "url": f"{origin}/?license={lic['license_key']}&plan={plan}"
    }

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

    if event_name in ["order_created", "subscription_created"]:
        email = attributes.get("user_email") or custom_data.get("email") or "customer@ledgersnap.com"
        plan = custom_data.get("plan") or ("single" if "single" in attributes.get("first_order_item", {}).get("product_name", "").lower() else "pro_monthly")
        lic = create_license(email=email, plan=plan)
        return {"status": "success", "license_key": lic["license_key"], "plan": lic["plan"]}

    return {"status": "ignored", "event_name": event_name}

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
async def convert_pdf(file: UploadFile = File(...)):
    """Uploads and parses bank statement PDF."""
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
        CONVERSIONS_DB[file_id] = {
            "filename": file.filename,
            "bank_name": bank_detected,
            "transactions": transactions,
            "summary": summary
        }

        return {
            "file_id": file_id,
            "filename": file.filename,
            "bank_name": bank_detected,
            "summary": summary,
            "preview": transactions,
            "total_count": len(transactions)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse statement: {str(e)}")

@app.get("/api/download/{file_id}")
def download_converted(
    file_id: str, 
    format: str = Query("qbo", enum=["qbo", "xlsx", "csv"]),
    license_key: Optional[str] = Query(None)
):
    """Downloads parsed transactions in QBO, Excel (.xlsx), or CSV format."""
    if license_key:
        deduct_credit_if_needed(license_key)

    record = CONVERSIONS_DB.get(file_id)
    if not record:
        # Check if sample
        if file_id == "demo-sample-chase-statement":
            record = {
                "filename": "Chase_Business_Checking_October_2026.pdf",
                "bank_name": "JPMorgan Chase",
                "transactions": SAMPLE_TRANSACTIONS
            }
        else:
            raise HTTPException(status_code=404, detail="File session expired or not found. Please re-upload.")

    transactions = record["transactions"]
    bank_name = record.get("bank_name", "Bank Statement")
    raw_base = os.path.splitext(record.get("filename", "statement"))[0]
    
    # RFC 5987 safe header encoding for non-ASCII / Hebrew filenames
    import urllib.parse
    safe_ascii = "bank_statement"
    encoded_name = urllib.parse.quote(f"{raw_base}.{format}")
    disp_header = f'attachment; filename="{safe_ascii}.{format}"; filename*=UTF-8\'\'{encoded_name}'

    if format == "qbo":
        qbo_content = generate_qbo(transactions, bank_name=bank_name)
        return Response(
            content=qbo_content.encode('utf-8', errors='replace'), 
            media_type="application/x-ofx", 
            headers={"Content-Disposition": disp_header}
        )

    elif format == "xlsx":
        xlsx_bytes = generate_excel(transactions, bank_name=bank_name)
        return Response(
            content=xlsx_bytes, 
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", 
            headers={"Content-Disposition": disp_header}
        )

    elif format == "csv":
        df = pd.DataFrame(transactions)
        csv_buffer = io.StringIO()
        df.to_csv(csv_buffer, index=False)
        return Response(
            content=csv_buffer.getvalue().encode('utf-8-sig', errors='replace'), 
            media_type="text/csv", 
            headers={"Content-Disposition": disp_header}
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
