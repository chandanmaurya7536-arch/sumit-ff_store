
export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed"
    });
  }

  const token = process.env.BOT_TOKEN;

  if (!token) {
    return res.status(500).json({
      success: false,
      message: "BOT_TOKEN environment variable missing"
    });
  }

  const webhookUrl =
    "https://sumit-ffstore-rust.vercel.app/api/telegram-webhook";

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${token}/setWebhook`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ url: webhookUrl })
      }
    );

    const result = await response.json();

    return res.status(response.ok ? 200 : 502).json({
      success: response.ok && result.ok === true,
      telegram: result
    });
  } catch {
    return res.status(500).json({
      success: false,
      message: "Webhook setup failed"
    });
  }
}
