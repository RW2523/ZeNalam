from flask import Flask, request, jsonify
import joblib
import pandas as pd
from transformers import AutoImageProcessor, SiglipForImageClassification
from PIL import Image
import torch
import logging


logging.basicConfig(level=logging.INFO)
app = Flask(__name__)

# Load model and encoders
model = joblib.load("rf_model.pkl")
le_dict = joblib.load("label_encoders.pkl")

# Allowed values
allowed_values = {
    'Gender': ['Male', 'Female'],
    'Occupation': ['Software Engineer', 'Doctor', 'Sales Representative', 'Teacher', 'Scientist'],
    'BMI Category': ['Overweight', 'Normal', 'Obese'],
    'Blood Pressure': ['126/83', '125/80', '140/90', '131/86']
}

# Default input structure
default_input = {
    'Gender': 'Male',
    'Age': 28,
    'Occupation': 'Sales Representative',
    'Sleep Duration': 5.9,
    'Quality of Sleep': 4,
    'Physical Activity Level': 30,
    'Stress Level': 8,
    'BMI Category': 'Normal',
    'Blood Pressure': '128/83',
    'Heart Rate': 85,
    'Daily Steps': 2000
}

# Fields that must be set
ordered_fields = [
    'Gender', 'Occupation', 'BMI Category', 'Blood Pressure',
    'Age', 'Sleep Duration', 'Quality of Sleep', 'Physical Activity Level'
]

food_model_name = "prithivMLmods/Food-101-93M"
food_model = SiglipForImageClassification.from_pretrained(food_model_name)
food_processor = AutoImageProcessor.from_pretrained(food_model_name)

food_labels = {
    "0": "apple_pie", "1": "baby_back_ribs", "2": "baklava", "3": "beef_carpaccio", "4": "beef_tartare",
    "5": "beet_salad", "6": "beignets", "7": "bibimbap", "8": "bread_pudding", "9": "breakfast_burrito",
    "10": "bruschetta", "11": "caesar_salad", "12": "cannoli", "13": "caprese_salad", "14": "carrot_cake",
    "15": "ceviche", "16": "cheesecake", "17": "cheese_plate", "18": "chicken_curry", "19": "chicken_quesadilla",
    "20": "chicken_wings", "21": "chocolate_cake", "22": "chocolate_mousse", "23": "churros", "24": "clam_chowder",
    "25": "club_sandwich", "26": "crab_cakes", "27": "creme_brulee", "28": "croque_madame", "29": "cup_cakes",
    "30": "deviled_eggs", "31": "donuts", "32": "dumplings", "33": "edamame", "34": "eggs_benedict",
    "35": "escargots", "36": "falafel", "37": "filet_mignon", "38": "fish_and_chips", "39": "foie_gras",
    "40": "french_fries", "41": "french_onion_soup", "42": "french_toast", "43": "fried_calamari", "44": "fried_rice",
    "45": "frozen_yogurt", "46": "garlic_bread", "47": "gnocchi", "48": "greek_salad", "49": "grilled_cheese_sandwich",
    "50": "grilled_salmon", "51": "guacamole", "52": "gyoza", "53": "hamburger", "54": "hot_and_sour_soup",
    "55": "hot_dog", "56": "huevos_rancheros", "57": "hummus", "58": "ice_cream", "59": "lasagna",
    "60": "lobster_bisque", "61": "lobster_roll_sandwich", "62": "macaroni_and_cheese", "63": "macarons", "64": "miso_soup",
    "65": "mussels", "66": "nachos", "67": "omelette", "68": "onion_rings", "69": "oysters",
    "70": "pad_thai", "71": "paella", "72": "pancakes", "73": "panna_cotta", "74": "peking_duck",
    "75": "pho", "76": "pizza", "77": "pork_chop", "78": "poutine", "79": "prime_rib",
    "80": "pulled_pork_sandwich", "81": "ramen", "82": "ravioli", "83": "red_velvet_cake", "84": "risotto",
    "85": "samosa", "86": "sashimi", "87": "scallops", "88": "seaweed_salad", "89": "shrimp_and_grits",
    "90": "spaghetti_bolognese", "91": "spaghetti_carbonara", "92": "spring_rolls", "93": "steak", "94": "strawberry_shortcake",
    "95": "sushi", "96": "tacos", "97": "takoyaki", "98": "tiramisu", "99": "tuna_tartare", "100": "waffles"
}

@app.route("/food", methods=["POST"])
def predict_food():
    try:
        if 'image' not in request.files:
            return jsonify({"error": "No image provided"}), 400

        image_file = request.files['image']
        image = Image.open(image_file).convert("RGB")

        inputs = food_processor(images=image, return_tensors="pt")

        with torch.no_grad():
            outputs = food_model(**inputs)
            logits = outputs.logits
            probs = torch.nn.functional.softmax(logits, dim=1).squeeze().tolist()

        top_preds = {
            food_labels[str(i)]: round(probs[i], 3)
            for i in sorted(range(len(probs)), key=lambda x: probs[x], reverse=True)[:5]
        }

        logging.error(f"Food prediction : {str(top_preds)}")

        return jsonify(top_preds)

    except Exception as e:
        logging.error(f"Food prediction error: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route("/predict", methods=["POST", "GET"])
def predict():
    try:
        user_data = request.get_json()
        if not user_data:
            return jsonify({"error": "No input data provided"}), 400

        # Convert features list to named dict if necessary
        if 'features' in user_data:
            features = user_data['features']
            if len(features) != len(ordered_fields):
                return jsonify({
                    "error": f"Expected {len(ordered_fields)} features, got {len(features)}"
                }), 400
            for i, field in enumerate(ordered_fields):
                user_data[field] = features[i]

        # Construct full input dictionary using user-provided values or defaults
        full_input = {}
        for field in default_input:
            if field in user_data:
                full_input[field] = user_data[field]
            else:
                full_input[field] = default_input[field]

        # Build DataFrame
        df_input = pd.DataFrame([full_input])

        # Validate and encode categorical features
        for col in allowed_values:
            val = df_input[col][0]
            if val not in allowed_values[col]:
                return jsonify({
                    "error": f"Invalid value for {col}: '{val}'. Allowed: {allowed_values[col]}"
                }), 400
            df_input[col] = le_dict[col].transform([val])

        # Predict
        prediction = model.predict(df_input)
        decoded = le_dict['Sleep Disorder'].inverse_transform(prediction)
        safe_result = [
            "Unknown" if (isinstance(p, float) and pd.isna(p)) else str(p)
            for p in decoded
        ]
        return jsonify({"prediction": safe_result})

    except Exception as e:
        logging.exception("Predict error")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5002)
