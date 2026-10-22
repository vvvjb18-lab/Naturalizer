export const SITE_NAME = "Naturalizer";

export const CAROUSELL_LISTING_URL =
  "https://www.carousell.com.hk/p/naturalizer-%E6%B8%9B%E4%BD%8Eai%E6%AA%A2%E6%B8%AC%E7%8E%87-%E9%99%8D%E4%BD%8Eai%E7%8E%87-%E5%8E%BBai-%E4%BA%BA%E9%A1%9E%E5%8C%96-%E8%87%AA%E7%84%B6%E5%8C%96-%E4%B8%AD%E8%8B%B1%E9%9B%99%E8%AA%9E%E5%AD%B8%E8%A1%93%E8%AB%96%E6%96%87%E6%9C%8D%E5%8B%99-1469557127/";

export const CAROUSELL_SELLER_URL =
  "https://www.carousell.com.hk/u/naturalizerplatform/";

export const WHATSAPP_URL = "https://wa.me/message/PUGACWL2T5PXE1";
export const WHATSAPP_PHONE = "85260408422";

export function whatsAppUrl(text?: string) {
  if (!text) return WHATSAPP_URL;
  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(text)}`;
}

export const SELLER_HANDLE = "@naturalizerplatform";
