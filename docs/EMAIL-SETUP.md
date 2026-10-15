# Contact form email setup (Hostinger mailbox + Netlify Function)

The contact form posts to `/api/contact` (`netlify/functions/contact.mts`). The function validates the
enquiry and sends it **through the company's own Hostinger mailbox over SMTP** to `info@mmconstructionconsults.com`:

- **From:** `"Visitor Name via M.M. Construction Website" <info@mmconstructionconsults.com>`
- **Reply-To:** the visitor's email, so pressing Reply answers the visitor
- **Subject:** `New enquiry from {Name}: {Service}` (prefixed `[Possible spam]` when spam keywords are found)
- HTML table + plain-text version, with form type, all fields, source page and time in IST. No third-party branding.

Because Hostinger's own server sends the message for the domain, it passes SPF/DKIM/DMARC once the DNS
records below exist. **Until they exist, the form cannot deliver and will show visitors the phone/email fallback.**

## Current state (checked 14 Oct 2026)

| Item | Found | Needed |
| --- | --- | --- |
| DNS host | GoDaddy (`ns37/ns38.domaincontrol.com`) | — |
| MX records | **none** | Hostinger MX |
| SPF (TXT on `@`) | **none** | Hostinger SPF |
| DKIM | **none** | Hostinger DKIM (3 CNAMEs) |
| DMARC (`_dmarc`) | `v=DMARC1; p=quarantine; adkim=r; aspf=r; rua=mailto:dmarc_rua@onsecureserver.net;` | keep (it works once SPF/DKIM pass) |
| Website | `A @ 75.2.60.5`, `CNAME www → mm-construction-consults.netlify.app` (Netlify) | **do not change** |

## Step 1 — Create the mailbox in Hostinger

1. hPanel → **Emails** → add the domain `mmconstructionconsults.com` to your email plan.
2. Create the mailbox `info@mmconstructionconsults.com` with a strong password. This password is `SMTP_PASS`.
3. hPanel → Emails → **DNS / MX records** (or "Connect domain") shows the exact records for your account.
   Use the values hPanel shows if they differ from the defaults below.

## Step 2 — Add the DNS records at GoDaddy

GoDaddy → **My Products** → `mmconstructionconsults.com` → **DNS** → **Add New Record**. Leave the existing
`A` (Netlify) and `www` CNAME records alone.

| Type | Name | Value | Priority / TTL |
| --- | --- | --- | --- |
| MX | `@` | `mx1.hostinger.com` | 5 / 1 hour |
| MX | `@` | `mx2.hostinger.com` | 10 / 1 hour |
| TXT | `@` | `v=spf1 include:_spf.mail.hostinger.com ~all` | 1 hour |
| CNAME | `hostingermail-a._domainkey` | `hostingermail-a.dkim.mail.hostinger.com` | 1 hour |
| CNAME | `hostingermail-b._domainkey` | `hostingermail-b.dkim.mail.hostinger.com` | 1 hour |
| CNAME | `hostingermail-c._domainkey` | `hostingermail-c.dkim.mail.hostinger.com` | 1 hour |

- Only **one** SPF TXT record may exist on `@`. If GoDaddy already has one, edit it instead of adding a second.
- Keep the existing `_dmarc` record. Optionally change its `rua=` address to `mailto:info@mmconstructionconsults.com`
  to receive the reports yourself (the current address sends them to GoDaddy's monitoring service).
- Wait for hPanel → Emails to show the domain as **verified / connected** (minutes to a few hours).

## Step 3 — Add the environment variables in Netlify

Netlify → the site → **Site configuration** → **Environment variables** → **Add a variable** → **Add a single variable**.

| Key | Value | Secret? | Scopes | Deploy contexts |
| --- | --- | --- | --- | --- |
| `SMTP_HOST` | `smtp.hostinger.com` | no | Functions (or All) | Same value for all |
| `SMTP_PORT` | `465` | no | Functions (or All) | Same value for all |
| `SMTP_USER` | `info@mmconstructionconsults.com` | no | Functions | Same value for all |
| `SMTP_PASS` | the mailbox password | **yes** — tick *Contains secret values* | **Functions** must be included | **Production only** |
| `MAIL_TO` | `info@mmconstructionconsults.com` | no | Functions | Same value for all |
| `MAIL_FROM` | `info@mmconstructionconsults.com` | no | Functions | Same value for all |

- For `SMTP_PASS`: choose **Specific scopes** and make sure **Functions** is ticked; choose **Different value for
  each deploy context** and fill in **Production** only. Deploy previews then have no password and answer
  `500 not_configured`, which is intended (previews never send real email).
- `MAIL_FROM` must be the same mailbox as `SMTP_USER` (Hostinger rejects other senders).
- Do **not** put these in `netlify.toml` or in git: variables there are not available to Functions.

## Step 4 — Redeploy

Environment variables are read when a deploy is created. After saving them:
Netlify → **Deploys** → **Trigger deploy** → **Deploy site**. Wait for "Published".

## Step 5 — One live test (please confirm before sending)

1. Open <https://mmconstructionconsults.com/contact/> in a private window, fill the form with your own details
   (wait at least 3 seconds before sending), tick consent, press **Send Enquiry**.
2. You should land on `/thank-you/`.
3. In the `info@` inbox (webmail.hostinger.com) check: it is in **Inbox, not Spam**; the sender shows
   "Your Name via M.M. Construction Website"; **Reply** addresses your own email; the subject is
   `New enquiry from Your Name: <service>`.
4. Optional deliverability check: open the message → *Show original* (or headers) and confirm
   `spf=pass`, `dkim=pass`, `dmarc=pass`.

## Troubleshooting

| Visitor sees | Meaning | Fix |
| --- | --- | --- |
| "could not be delivered" (HTTP 500, `not_configured`) | One of the six variables is missing in this deploy | Add it (scope Functions), redeploy |
| "could not be delivered" (HTTP 502, `delivery_failed`) | SMTP login/connection failed | Check password, port 465, that the mailbox exists; see Netlify → Logs → Functions → `contact` |
| "Too many enquiries" (429) | 5 attempts per 10 minutes from one IP | Wait 10 minutes |
| Email lands in Spam | SPF/DKIM not yet published or propagated | Check Step 2 records with hPanel's DNS checker |

Function logs: Netlify → **Logs & metrics** → **Functions** → `contact` (logs never contain the password or the enquiry text).
