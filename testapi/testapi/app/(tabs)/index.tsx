import React, { useState } from "react";
import { View, Text, Button } from "react-native";
import axios from "axios";

export default function App() {
  const [result, setResult] = useState(null);

  const handlePredict = async () => {
    const sample = {
      driver_rating: 4.9,
      platform: "ios",
      carmodel: "Toyota",
      carname: "Camry",
      driver_id: 123,
      user_id: 456,
      order_timestamp: "2025-10-19 12:30:00",
      tender_timestamp: "2025-10-19 12:30:15",
      driver_reg_date: "2023-01-01",
      distance_in_meters: 3400,
      duration_in_seconds: 420,
      pickup_in_meters: 500,
      pickup_in_seconds: 60,
      price_start_local: 100,
      price_bid_local: 120,
    };

    try {
      const response = await axios.post("http://192.168.0.11:8000/predict", sample);

      // ✅ Выводим JSON-ответ в терминал
      console.log("Ответ от API:", response.data);

      // сохраняем в state для отображения на экране
      setResult(response.data);
    } catch (error) {
      console.error("Ошибка при обращении к API:", error);
    }
  };

  return (
    <View style={{ padding: 150 }}>
      <Button title="Сделать предсказание" onPress={handlePredict} />
      {result && (
        <Text style={{ marginTop: 20 }}>
          Вероятность: {result.probability.toFixed(3)}{"\n"}
          Принятие заказа: {result.prediction ? "Да" : "Нет"}
        </Text>
      )}
    </View>
  );
}
