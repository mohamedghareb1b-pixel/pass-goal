import { createClient } from "@supabase/supabase-js";
import type { ImageStorage } from "@/application/use-cases/CompressAndStoreImage";

const BUCKET = "article-images";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export class SupabaseImageStorage implements ImageStorage {
  async upload(path: string, buffer: Buffer, contentType: string): Promise<{ url: string }> {
    const { error } = await supabase.storage.from(BUCKET).upload(path, buffer, {
      contentType,
      upsert: true,
    });
    if (error) throw error;

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return { url: data.publicUrl };
  }
}
