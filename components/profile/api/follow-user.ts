import axios from "axios";
import { toast } from "@/components/ui/use-toast";

export const followUser = async (user_id: string, session_owner_id: string) => {
  if (!session_owner_id) {
    throw new Error("Please sign in to follow other users");
  }

  try {
    const {data} = await axios.put("/api/users/follow", {
      user_id,
      session_owner_id,
    });

    return data;
  } catch (error: any) {
    return error.message;
  }
};