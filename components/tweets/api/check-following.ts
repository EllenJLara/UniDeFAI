import axios from "axios";

export const checkFollowing = async (userId: string, targetId: string) => {
  try {
    const { data } = await axios.get(`/api/users/following/check?userId=${userId}&targetId=${targetId}`);
    return data.isFollowing;
  } catch (error) {
    console.error("Error checking following status:", error);
    return false;
  }
};