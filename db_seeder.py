import pandas as pd
from pymongo import MongoClient
from dotenv import load_dotenv
import os

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = "vivachefsassessment"
COLLECTION_NAME = "recipes"

# Load the CSV
df = pd.read_csv("full_stack_project_grocery_list.csv")


df["Dish name"] = df["Dish name"].ffill() # previous names propagated forward

df.fillna("", inplace=True)


print(df.head())

# Group by dish name
grouped = df.groupby("Dish name")

# Build MongoDB documents
recipe_docs = []
for dish, group in grouped:
    ingredients = []
    for _, row in group.iterrows():
        name = row["Ingredients"].strip()
        quantity = row["Quantity"]
        unit = row["Unit of Measure"].strip()

        # Determine if it's a spice (no quantity/unit)
        is_spice = str(quantity).strip() == "" and unit == ""

        ingredient_entry = {
            "name": name.strip().lower(),
            "quantity": float(quantity) if not is_spice and str(quantity).strip() != "" else None,
            "unit": unit if not is_spice else None,
            "isSpice": is_spice
        }
        ingredients.append(ingredient_entry)
    print(dish)
    recipe_doc = {
        "name": dish.strip(),
        "servings": 8,               # Per assignment spec
        "ingredients": ingredients,
        "addedByLLM": False          # CSV-based data
    }

    recipe_docs.append(recipe_doc)

# print(recipe_docs[:2])

# Insert into MongoDB
client = MongoClient(MONGO_URI)
db = client[DB_NAME]
collection = db[COLLECTION_NAME]

collection.delete_many({})  # Optional: clean before insert
collection.insert_many(recipe_docs)

print(f"Inserted {len(recipe_docs)} recipes into MongoDB.")
