import axios from "axios";

const BASE_URL = "https://bmytsqa7b3.ap-south-1.awsapprunner.com/api/gallery";

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
