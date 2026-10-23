
export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed"
    });
  }

  // Select webhook using ?site=1, ?site=2 or ?site=3
  const sites = {
    "1": {
      url: "https://sumit-ffstore-sand.vercel.app/api/telegram-webhook?site=1",
      tokenEnv: "BOT_TOKEN"
    },
    "2": {
      url: "https://sumit-ffstore-eight.vercel.app/api/telegram-webhook?site=2",
      tokenEnv: "BOT_TOKEN_SITE2"
    },
    "3": {
      url: process.env.SITE3_WEBHOOK_URL || "https://sumit-ffstore-po3o.vercel.app/api/telegram-webhook?site=3",
      tokenEnv: "BOT_TOKEN_SITE3"
    }
  };

  const site = String(req.query.site || "");
  const selected = sites[site];

  if (!selected) {
    return res.status(400).json({
      success: false,
      message: "Choose site=1, site=2 or site=3",
      options: [
        "/api/set-webhook?site=1",
        "/api/set-webhook?site=2",
        "/api/set-webhook?site=3"
      ]
    });
  }

  if (site === "3" &&
      selected.url.includes("YOUR-THIRD-DOMAIN")) {
    return res.status(400).json({
      success: false,
      message: "Add the third domain before setting its webhook"
    });
  }

  const token = process.env[selected.tokenEnv];

  if (!token) {
    return res.status(500).json({
      success: false,
      message: `${selected.tokenEnv} environment variable missing`
    });
  }

  const payload = { url: selected.url };

  if (process.env.TELEGRAM_WEBHOOK_SECRET) {
    payload.secret_token = process.env.TELEGRAM_WEBHOOK_SECRET;
  }

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${token}/setWebhook`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      }
    );

    const result = await response.json();

    return res.status(response.ok && result.ok ? 200 : 502).json({
      success: response.ok && result.ok === true,
      selectedSite: site,
      webhookUrl: selected.url,
      telegram: result
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Webhook setup failed"
    });
  }
}