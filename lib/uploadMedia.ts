import { supabase } from "@/lib/supabase-client";
import { createId } from "@paralleldrive/cuid2";

interface UploadMediaOptions {
  file: File;
  type: 'message' | 'group-icon';
  groupId: string;
}

export const uploadMedia = async ({ 
  file, 
  type, 
  groupId 
}: UploadMediaOptions): Promise<string> => {
  try {
    const isImage = file.type.startsWith("image/");
    const folder = type === 'message' ? 'chat' : 'groups';
    const mediaType = isImage ? "image" : "file";

    const fileExtension = file.name.split(".").pop();
    const uniqueId = createId();
    const mediaPath = `${folder}/${groupId}/${mediaType}-${uniqueId}.${fileExtension}`;

    const { error: uploadError } = await supabase.storage
      .from("media")
      .upload(mediaPath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("Error uploading file:", uploadError.message);
      throw new Error(`Failed to upload ${mediaType}`);
    }

    const { data: publicUrl } = supabase.storage
      .from("media")
      .getPublicUrl(mediaPath);

    if (!publicUrl) {
      throw new Error(`Failed to generate public URL for ${mediaType}`);
    }

    return publicUrl.publicUrl;
  } catch (error: any) {
    console.error("Upload error:", error);
    throw new Error("Media upload failed");
  }
};