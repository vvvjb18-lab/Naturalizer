import webpush from "web-push";

import {
  deletePushSubscription,
  listPushSubscriptions,
} from "./store";

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
  tag?: string;
}

export function isPushConfigured() {
  return Boolean(
    process.env.VAPID_PUBLIC_KEY &&
      process.env.VAPID_PRIVATE_KEY &&
      process.env.VAPID_SUBJECT
  );
}

export async function sendPushToAdmins(payload: PushPayload) {
  if (!isPushConfigured()) {
    return { sent: 0, failed: 0 };
  }

  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT as string,
    process.env.VAPID_PUBLIC_KEY as string,
    process.env.VAPID_PRIVATE_KEY as string
  );

  const subscriptions = await listPushSubscriptions();
  let sent = 0;
  let failed = 0;

  await Promise.all(
    subscriptions.map(async (subscription) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: subscription.p256dh,
              auth: subscription.auth,
            },
          },
          JSON.stringify({
            ...payload,
            icon: "/ops/icon-192.png",
            badge: "/ops/icon-192.png",
          }),
          { TTL: 60 * 60 }
        );
        sent += 1;
      } catch (error) {
        failed += 1;
        const statusCode = (error as { statusCode?: number }).statusCode;

        if (statusCode === 404 || statusCode === 410) {
          await deletePushSubscription(subscription.endpoint).catch(() => {});
        } else {
          console.error("Push notification failed", error);
        }
      }
    })
  );

  return { sent, failed };
}
