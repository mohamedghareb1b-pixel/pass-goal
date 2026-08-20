import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { compressAndStoreImage } from "@/application/use-cases/CompressAndStoreImage";
import { SupabaseImageStorage } from "@/infrastructure/storage/SupabaseImageStorage";

const storage = new SupabaseImageStorage();

// Every image uploaded from the admin goes through this route so WebP
// compression (brief section 12) is never optional or skippable.
export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const destPath = `uploads/${randomUUID()}`;

  try {
    const { url } = await compressAndStoreImage(buffer, destPath, storage);
    return NextResponse.json({ url });
  } catch (err) {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
