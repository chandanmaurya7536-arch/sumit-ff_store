import { initializeApp, cert, getApps } from "firebase-admin/app";
import {
  getFirestore,
  Timestamp
} from "firebase-admin/firestore";

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
    })
  });
}

const db = getFirestore();

export default async function handler(req, res) {

  // Only GET request allowed
  if (req.method !== "GET") {
    return res.status(405).json({
      success: false,
      error: "Method Not Allowed"
    });
  }

  // Secure Cron
  const authHeader = req.headers.authorization;

  if (
    !process.env.CRON_SECRET ||
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return res.status(401).json({
      success: false,
      error: "Unauthorized"
    });
  }

  try {

    // 3 hours
    const THREE_HOURS = 3 * 60 * 60 * 1000;

    const cutoff = Date.now() - THREE_HOURS;

    // Get pending orders
    const snapshot = await db
      .collection("orders")
      .where("status", "==", "pending")
      .get();

    let rejected = 0;

    for (const docSnap of snapshot.docs) {

      const order = docSnap.data();

      if (!order.createdAt) continue;

      const createdTime = order.createdAt.toMillis();

      // Not older than 3 hours
      if (createdTime > cutoff) continue;

      // Re-check before rejecting
      await db.runTransaction(async (transaction) => {

        const orderRef = db
          .collection("orders")
          .doc(docSnap.id);

        const freshSnap = await transaction.get(orderRef);

        if (!freshSnap.exists) return;

        const freshOrder = freshSnap.data();

        // Already approved/rejected/delivered
        if (
          String(freshOrder.status || "").toLowerCase() !== "pending"
        ) {
          return;
        }

        // Reject automatically
        transaction.update(orderRef, {
          status: "rejected",
          rejectedAt: Timestamp.now(),
          rejectionReason:
            "Payment was not approved within 3 hours."
        });

        rejected++;
      });
    }

    return res.status(200).json({
      success: true,
      message: "Auto-reject check completed.",
      checked: snapshot.size,
      rejected: rejected,
      checkedAt: new Date().toISOString()
    });

  } catch (error) {

    console.error("AUTO REJECT ERROR:", error);

    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}