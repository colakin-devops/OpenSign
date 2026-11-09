# OpenSign `.env.prod` Configuration & Setup Guide

This guide provides step-by-step instructions to configure every variable in `.env.prod`, including how to generate a **Google App Password** for SMTP email delivery and how to configure a dedicated **Supabase Storage Bucket** for document uploads.

---

## Part 1: How to Generate and Configure Google App Password (SMTP)

OpenSign requires an email provider to send invitation links, OTPs, password reset emails, and completed document notifications. You can use Gmail or Google Workspace with a **Google App Password**.

### Prerequisites
- A Google Account or Google Workspace account.
- **2-Step Verification (2FA)** MUST be turned on for this Google account. Google does not allow App Passwords without 2-Step Verification.

### Step-by-Step Instructions:

1. **Log in to Google Account**:
   - Open your browser and go to [https://myaccount.google.com/](https://myaccount.google.com/).

2. **Verify 2-Step Verification**:
   - Click on the **Security** tab in the left-hand navigation menu.
   - Under the *"How you sign in to Google"* section, check **2-Step Verification**.
   - If it is turned off, click it and follow the on-screen steps to enable 2FA (e.g., via SMS or Authenticator App).

3. **Navigate to App Passwords**:
   - In the search bar at the very top of Google Account, type **`App passwords`** and click the result.
   - Alternatively, go directly to: [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords).
   - Enter your account password if prompted.

4. **Generate the App Password**:
   - In the **App name** field, type an identifier (e.g., `OpenSign` or `dex-sign`).
   - Click **Create**.

5. **Copy the 16-Character Password**:
   - A modal window will display a 16-character code (formatted like `xxxx xxxx xxxx xxxx`).
   - Copy this 16-character code immediately. *(You will not be able to see it again after closing the modal).*

6. **Place in `.env.prod`**:
   Add or update the SMTP section in your `.env.prod` file:

   ```env
   SMTP_ENABLE=true
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=465
   SMTP_USERNAME=teamcolakin@gmail.com
   SMTP_USER_EMAIL=teamcolakin@gmail.com
   SMTP_PASS='cciw wppf qcrg pzjv'
   ```

> [!IMPORTANT]
> - Put `SMTP_PASS` in single quotes if it contains spaces: `'cciw wppf qcrg pzjv'`.
> - Include **`SMTP_USERNAME`** in addition to `SMTP_USER_EMAIL` with your full Gmail address, as OpenSign checks `process.env.SMTP_USERNAME` when enabling transporter authentication.
> - Use port `465` for secure SSL email delivery with Gmail SMTP.

---

## Part 2: Step-by-Step Guide for All `.env.prod` Credentials

Below is the complete breakdown of all sections in `.env.prod`:

```
1. Frontend Configuration
2. Backend ExpressJS Configuration
3. Document Storage Configuration (Dedicated Supabase Bucket)
4. Email Delivery (SMTP / Google App Password)
5. Digital Signing Certificate (PFX / P12)
```

---

### 1. Frontend Configuration

| Variable | Description | Your Value | Notes |
| :--- | :--- | :--- | :--- |
| `PUBLIC_URL` | Base URL where users access the OpenSign web app in their browser. | `https://dex-sign.colakin.com/` | Must include `https://` and trailing slash `/`. |
| `GENERATE_SOURCEMAP` | Whether React builds source maps. | `false` | Keep `false` in production to reduce bundle size and memory usage. |
| `REACT_APP_SERVERURL` | Public API URL accessible from the client's browser. | `https://dex-sign.colakin.com/api/app` | Must match your public domain pointing to the `/api/app` endpoint. |
| `REACT_APP_APPID` | Client application identifier. | `dex-signature` | A unique string. **Must match `APP_ID`**. |
| `REACT_APP_GTM` | Google Tag Manager Container ID. | `GTM-123N7LD` or leave empty | If using Google Analytics/GTM, put your container ID. Otherwise leave empty. |

---

### 2. Backend ExpressJS Configuration

| Variable | Description | Your Value | Notes |
| :--- | :--- | :--- | :--- |
| `APP_ID` | Backend app identifier. | `dex-signature` | Must match `REACT_APP_APPID`. |
| `appName` | Application display name shown in system emails. | `dex-sign` | Display name for your organization. |
| `MASTER_KEY` | Secret administrative master key for Parse Server backend. | `3bd26302c480ad9612493a0d7c9143fc` | High-security secret random string. |
| `MONGODB_URI` | MongoDB database connection URI. | `mongodb://mongo:27017/opensign` | When using Docker Compose, use `mongo` as the container host. |
| `PARSE_MOUNT` | Route mount path for Parse Server APIs. | `/app` | Keep default `/app`. Do not change. |
| `SERVER_URL` | Internal API URL accessed by NodeJS backend services. | `https://dex-sign.colakin.com/api/app` | Matches `REACT_APP_SERVERURL`. |

---

### 3. Document Storage Configuration (Dedicated Supabase Bucket)

OpenSign is configured to store all uploaded PDF files and signed contracts directly in your dedicated **Supabase Storage Bucket** (`hrms-documents`).

```env
# Dedicated Supabase storage bucket for uploading documents
SUPABASE_URL=https://ufcsvmicwkhvdeglrexy.supabase.co
SUPABASE_STORAGE_BUCKET=hrms-documents
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVmY3N2bWljd2todmRlZ2xyZXh5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MzY4NzA3MiwiZXhwIjoyMTA5MjYzMDcyfQ.LfwASaYVfAPl4tSv27dLiPWtQRCoHuSe32nEiiWHgVE
SUPABASE_PUBLISHABLE_KEY=sb_publishable_HycyoY_yeQVpExaNM4l9Rw_y8PYD2GN
USE_LOCAL=false
```

#### How Each Supabase Variable Works:
1. **`SUPABASE_URL`**: Your Supabase project URL (e.g., `https://ufcsvmicwkhvdeglrexy.supabase.co`).
2. **`SUPABASE_STORAGE_BUCKET`**: The storage bucket where PDFs and contracts are stored (e.g., `hrms-documents`).
3. **`SUPABASE_SERVICE_ROLE_KEY`**: The secret service role key (bypasses Row-Level Security, allowing OpenSign server to upload, sign, download, and delete files securely).
4. **`SUPABASE_PUBLISHABLE_KEY`**: The public anon/publishable key for your Supabase project.
5. **`USE_LOCAL`**: Set to `false` so OpenSign routes all files to Supabase instead of local disk.

#### Supabase S3 Compatibility (Fallback):
If running the pre-built DockerHub image without rebuilding, OpenSign uses Supabase's native S3-compatible gateway with these mapped values:
```env
DO_SPACE=hrms-documents
DO_ENDPOINT=ufcsvmicwkhvdeglrexy.supabase.co/storage/v1/s3
DO_BASEURL=https://ufcsvmicwkhvdeglrexy.supabase.co/storage/v1/object/public/hrms-documents
DO_REGION=us-east-1
```
*(To obtain S3 Access Keys in Supabase: In Supabase Dashboard, go to **Project Settings -> Storage -> S3 Access Keys -> Generate new credentials**).*

---

### 4. Email Configuration (Google App Password)

```env
SMTP_ENABLE=true
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USERNAME=teamcolakin@gmail.com
SMTP_USER_EMAIL=teamcolakin@gmail.com
SMTP_PASS='cciw wppf qcrg pzjv'
```

---

### 5. Document Signing Certificate Configuration (PFX / P12)

OpenSign cryptographically signs completed PDFs with a digital PKCS#12 (`.pfx` or `.p12`) certificate.

#### Variables:
- `PFX_BASE64`: The full base64-encoded string of the `.pfx` file (on a single line or quoted).
- `PASS_PHRASE`: The passphrase used when generating or exporting the PFX file.

#### Quick Setup:
##### Option A: Use the Included Dev Certificate (Ready in Repository)
The repository contains a pre-generated certificate in `cert/local-dev_base64_pfx`:
```bash
cat cert/local-dev_base64_pfx
```
Set in `.env.prod`:
```env
PFX_BASE64='<paste content from cert/local-dev_base64_pfx>'
PASS_PHRASE=password
```

##### Option B: Generate a Custom Self-Signed Certificate
```bash
openssl req -x509 -newkey rsa:2048 -keyout cert/opensign.key -out cert/opensign.crt -days 3650 -nodes -subj "/CN=dex-sign Document Signer/O=Colakin"
openssl pkcs12 -export -out cert/opensign.pfx -inkey cert/opensign.key -in cert/opensign.crt -password pass:YourStrongPassphrase123
base64 -w 0 cert/opensign.pfx
```
Set `PFX_BASE64` to the base64 output and `PASS_PHRASE` to `YourStrongPassphrase123`.

---

## Complete `.env.prod` File Reference

```env
# Frontend config ************************************************************************************************************************************************************************************************
PUBLIC_URL=https://dex-sign.colakin.com/
GENERATE_SOURCEMAP=false
REACT_APP_SERVERURL=https://dex-sign.colakin.com/api/app
REACT_APP_APPID=dex-signature
REACT_APP_GTM=GTM-123N7LD

# Backend ExpressJS config ****************************************************************************************************************************************************************************************
APP_ID=dex-signature
appName=dex-sign
MASTER_KEY=3bd26302c480ad9612493a0d7c9143fc
MONGODB_URI=mongodb://mongo:27017/opensign
PARSE_MOUNT=/app
SERVER_URL=https://dex-sign.colakin.com/api/app

# Storage config (Supabase Storage) ******************************************************************************************************************************************************************************
SUPABASE_URL=https://ufcsvmicwkhvdeglrexy.supabase.co
SUPABASE_STORAGE_BUCKET=hrms-documents
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVmY3N2bWljd2todmRlZ2xyZXh5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MzY4NzA3MiwiZXhwIjoyMTA5MjYzMDcyfQ.LfwASaYVfAPl4tSv27dLiPWtQRCoHuSe32nEiiWHgVE
SUPABASE_PUBLISHABLE_KEY=sb_publishable_HycyoY_yeQVpExaNM4l9Rw_y8PYD2GN
USE_LOCAL=false

# Supabase S3 Compatibility (Fallback mapping for S3 clients)
DO_SPACE=hrms-documents
DO_ENDPOINT=ufcsvmicwkhvdeglrexy.supabase.co/storage/v1/s3
DO_BASEURL=https://ufcsvmicwkhvdeglrexy.supabase.co/storage/v1/object/public/hrms-documents
DO_REGION=us-east-1
DO_ACCESS_KEY_ID=
DO_SECRET_ACCESS_KEY=

# Email SMTP Config (Google App Password) ************************************************************************************************************************************************************************
SMTP_ENABLE=true
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USERNAME=teamcolakin@gmail.com
SMTP_USER_EMAIL=teamcolakin@gmail.com
SMTP_PASS='cciw wppf qcrg pzjv'

# Base64 encoded PFX or p12 document signing certificate file *********************************************************************************************************************
PFX_BASE64=
PASS_PHRASE=
```
