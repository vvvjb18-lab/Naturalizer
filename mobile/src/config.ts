export const API_BASE_URL = (
  process.env.EXPO_PUBLIC_API_BASE_URL ??
  "https://naturalizerplatform.vercel.app"
).replace(/\/$/, "");

export const APP_VERSION = "1.0.0";
