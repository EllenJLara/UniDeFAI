import axios from "axios";

export const getUsers = async ({
  id,
  limit,
}: {
  id?: string;
  limit?: number;
}) => {
  try {
    const query = new URLSearchParams();
    
    if (id) query.append('id', id);
    if (limit) query.append('limit', limit.toString());

    const { data } = await axios.get(`/api/users?${query.toString()}`);

    return data;
  } catch (error: any) {
    return error.message;
  }
};
