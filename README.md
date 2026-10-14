# LedgerSnap ⚡
### AI-Powered Bank Statement to QuickBooks (.QBO) & Excel Converter

Transform unstructured bank and credit card PDF statements into certified Intuit QuickBooks (`.QBO`), `.OFX`, and cleanly categorized Excel/CSV spreadsheets in seconds.

---

## 🚀 Key Features

- **Certified QuickBooks Output**: Generates valid QBO/OFX files ready for direct import into QuickBooks Online, QuickBooks Desktop, and Xero.
- **Privacy-First**: Client financial data is parsed in memory and never permanently stored.
- **Lemon Squeezy Integration**: Fully compliant Merchant of Record (MoR) checkout with automated license issuance and restore.
- **Multi-Bank Intelligence**: Automatic bank detection for Chase, Bank of America, Wells Fargo, Citibank, Capital One, American Express, and 1,000+ regional institutions.
- **Instant Restore**: Users can restore their access on any device using their purchase email address.

---

## 🛠 Tech Stack

- **Frontend**: React 18, Vite, Lucide Icons, Canvas Confetti
- **Backend**: Python 3.10+, FastAPI, Uvicorn, pdfplumber, pandas, openpyxl
- **Payments & Licensing**: Lemon Squeezy (MoR) with fallback demo mode & SQLite license vault

---

## 💻 Local Setup & Development

### 1. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate # On Windows (or source venv/bin/activate on Mac/Linux)

# Install dependencies
pip install -r ../requirements.txt

# Create .env from template
copy .env.example .env

# Run FastAPI server
uvicorn main:app --reload --port 8000
```

### 2. Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```

The application will be live at `http://localhost:5173`.

---

## ☁️ Deploying to Cloudflare Pages (Frontend)

1. Log into your [Cloudflare Dashboard](https://dash.cloudflare.com/) and go to **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**.
2. Select repository: `MoshikZiyoni/LedgerSnap`.
3. Set Build configuration:
   - **Framework preset**: `Vite`
   - **Root directory**: `frontend`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
4. Set Environment Variables:
   - `VITE_API_BASE`: `https://your-backend-api-url.com` (or your Cloudflare Tunnel / Railway domain).
5. Click **Save and Deploy**!

---

## 💳 Lemon Squeezy Setup

1. Create a store at [Lemon Squeezy](https://app.lemonsqueezy.com/).
2. Create 2 products/variants:
   - **Single Pass** ($4.99 one-time)
   - **Bookkeeper Pro Monthly** ($19.99/mo subscription)
3. Set Webhook:
   - URL: `https://your-backend-url.com/api/lemonsqueezy/webhook`
   - Events: `order_created`, `subscription_created`
4. Add keys to backend environment:
   ```env
   LEMONSQUEEZY_API_KEY=...
   LEMONSQUEEZY_STORE_ID=...
   LEMONSQUEEZY_VARIANT_ID_SINGLE=...
   LEMONSQUEEZY_VARIANT_ID_PRO=...
   LEMONSQUEEZY_WEBHOOK_SECRET=...
   ```

---

## 📄 License
MIT License. Built for modern financial workflows.
