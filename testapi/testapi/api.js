import axios from "axios";

// Замени IP на свой (из ipconfig)
const API_URL = "http://192.168.0.11:8000/predict";

export async function getPrediction(orderData) {
  try {
    const response = await axios.post(API_URL, orderData);
    return response.data;
  } catch (error) {
    console.error("Ошибка при обращении к API:", error);
    throw error;
  }
}
