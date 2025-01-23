import { supabase } from "@/lib/supabase-client";
import { createId } from "@paralleldrive/cuid2";
import axios from "axios";

export const postMedia = async ({
  files,
  tweet_id,
  message_id,
}: {
  files: File[];
  tweet_id?: string;
  message_id?: string;
}) => {
  try {
    const uploadPromises = files.map(async (file) => {
      const isImage = file.type.startsWith("image/");
      const folder = isImage ? "images" : "videos";
      const mediaType = isImage ? "image" : "video";

      const fileExtension = file.name.split(".").pop(); // Extract file extension
      const uniqueId = createId();
      const mediaPath = `${folder}/media-${uniqueId}.${fileExtension}`; // Full path for storage

      // Upload file to Supabase storage
      const { error } = await supabase.storage
        .from("media")
        .upload(mediaPath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        console.error("Error uploading file:", error.message);
        throw new Error(`Failed to upload ${mediaType}`);
      }

      // Get public URL for the uploaded file
      const { data: publicUrl } = supabase.storage
        .from("media")
        .getPublicUrl(mediaPath);

      if (!publicUrl) {
        throw new Error(`Failed to generate public URL for ${mediaType}`);
      }

      // Prepare media metadata
      const media = {
        ...(tweet_id && { tweet_id }),
        ...(message_id && { message_id }),
        media_url: publicUrl.publicUrl,
        media_type: mediaType,
        media_path: mediaPath,
      };

      await axios.post("/api/media", { media });
    });

    await Promise.all(uploadPromises);

    return true;
  } catch (error: any) {
    if (error.response) {
      console.error("Response error:", error.response.data);
    } else if (error.request) {
      console.error("Request error:", error.request);
    } else {
      console.error("Error:", error.message);
    }

    throw new Error("Media upload failed");
  }
};
