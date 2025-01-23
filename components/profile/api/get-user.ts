import axios, { AxiosError } from "axios";
import { IUser } from "../types";

export const getUser = async (id: string | undefined): Promise<IUser> => {
  if (!id) {
    throw new Error("User ID is required");
  }

  try {
    const { data } = await axios.get<IUser>(`/api/users/${id}`, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!data) {
      throw new Error('User not found');
    }

    return data;
  } catch (error) {
    if (error instanceof AxiosError) {
      switch (error.response?.status) {
        case 401:
          throw new Error('Please log in to continue');
        case 404:
          throw new Error('User not found');
        case 500:
          throw new Error('Server error occurred while fetching user');
        default:
          throw new Error(error.response?.data?.error || 'Failed to fetch user');
      }
    }
    throw new Error('An unexpected error occurred');
  }
};