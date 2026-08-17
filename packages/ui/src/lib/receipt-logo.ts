export const FALLBACK_RECEIPT_LOGO = "/images/logo-yellow.png";

export async function resolveReceiptLogo(url?: string | null): Promise<string> {
  if (!url) return FALLBACK_RECEIPT_LOGO;
  try {
    const res = await fetch(url, { mode: "cors" });
    if (!res.ok) return FALLBACK_RECEIPT_LOGO;

    const buf = new Uint8Array(await res.arrayBuffer());

    let mime = "";
    if (
      buf[0] === 0x89 &&
      buf[1] === 0x50 &&
      buf[2] === 0x4e &&
      buf[3] === 0x47
    ) {
      mime = "image/png";
    } else if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
      mime = "image/jpeg";
    } else {
      return FALLBACK_RECEIPT_LOGO;
    }

    let binary = "";
    for (let i = 0; i < buf.length; i++) {
      binary += String.fromCharCode(buf[i]);
    }
    return `data:${mime};base64,${btoa(binary)}`;
  } catch {
    return FALLBACK_RECEIPT_LOGO;
  }
}
