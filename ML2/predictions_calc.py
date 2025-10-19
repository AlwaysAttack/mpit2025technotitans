import pandas as pd

# Загружаем файл с результатами
df = pd.read_csv("predictions.csv")

# Подсчитываем количество по каждому типу
counts = df["is_done"].value_counts()

done_count = counts.get("done", 0)
cancel_count = counts.get("cancel", 0)

print(f"✅ Принятых заказов: {done_count}")
print(f"❌ Отказанных заказов: {cancel_count}")
print(f"Всего записей: {len(df)}")

# Дополнительно можно посчитать процент
done_pct = (done_count / len(df) * 100) if len(df) > 0 else 0
cancel_pct = (cancel_count / len(df) * 100) if len(df) > 0 else 0

print(f"\n📊 Доля принятых: {done_pct:.1f}%")
print(f"📊 Доля отказов: {cancel_pct:.1f}%")
