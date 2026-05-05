import { cookies } from "next/headers";

type FlashType = "success" | "error" | "info";

interface FlashData {
  message: string;
  type: FlashType;
}

export async function setFlash(message: string, type: FlashType = "success") {
  const cookieStore = await cookies();
  cookieStore.set("flash", JSON.stringify({ message, type }), {
    maxAge: 30,
    httpOnly: false,
    path: "/",
  });
}

export async function getFlash(): Promise<FlashData | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get("flash")?.value;
  if (!raw) return null;
  try {
    return JSON.parse(raw) as FlashData;
  } catch {
    return null;
  }
}
