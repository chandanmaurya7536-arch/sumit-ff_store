SUMIT FF STORE — SECOND-SITE PAYMENT / WEBHOOK PATCH

This is a MERGE PATCH, not a complete website. Copy the files into the matching places in your
existing repository; do not delete the rest of your project.

Files:
- index.html, script.js, buy.html, payment.js -> repository root (replace these files)
- site-config.js -> repository root (new file)
- assets/qr2.png -> existing assets/ folder (new file)
- api/set-webhook.js -> replace the existing API route at api/set-webhook.js

Payment config:
- First host sumit-ffstore-rust.vercel.app -> assets/qr.png + sumitchaudhary90910@oksbi
- Second host sumit-ffstore-five.vercel.app -> assets/qr2.png + amirkhan9518@naviaxis
- Future QR: replace assets/qr2.png with a valid PNG, preserving its file name.
- Future UPI change: edit site-config.js only.

Vercel Environment Variables — set separately in EACH Vercel project:
1) BOT_TOKEN = that project's own Telegram bot token (must be different between projects)
2) CHAT_ID = that project's own destination chat/group ID
3) TELEGRAM_WEBHOOK_URL
   First project: https://sumit-ffstore-rust.vercel.app/api/telegram-webhook
   Second project: https://sumit-ffstore-five.vercel.app/api/telegram-webhook
4) FIREBASE_PROJECT_ID = sumit-ff-store
5) FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY = same intended Firebase Admin service account values in both projects
6) TELEGRAM_WEBHOOK_SECRET is optional. If set, use the same value in that project's webhook setup and Telegram will now be configured with that secret.

Important:
- Frontend settings are selected by request hostname. If the second site later uses a custom domain, add that hostname to SECOND_SITE_HOSTS in site-config.js.
- The two websites can share the Firebase project, but Firestore/Auth or rules changes affect both. Order records are in the same "orders" collection.
- Deploying this patch is not performed by this ZIP; merge it and deploy through your existing Vercel/GitHub workflow.
- buy.html/payment.js are a legacy standalone page in the uploaded files. Their QR/UPI selection is now domain-aware, but their existing form has phone/UTR lookups that do not match its HTML inputs. That pre-existing form issue is deliberately not changed in this payment-only patch.
