import axios from "axios";
import Global_API_BASE from "./GlobalConstants";

const BASE_URL = Global_API_BASE + "/api/gallery";

export const uploadImage = async (formData: FormData) => {
  const response = await axios.post(`${BASE_URL}/upload`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const getGallery = async () => {
  const response = await axios.get(BASE_URL);
  return response.data;
};
