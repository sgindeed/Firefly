from io import BytesIO
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from tensorflow import keras
from keras._tf_keras.keras.applications import VGG16
from keras._tf_keras.keras.applications.vgg16 import preprocess_input
from keras._tf_keras.keras.preprocessing import image
from PIL import Image
import numpy as np
import tensorflow as tf
import pickle
import base64
import json
import uvicorn
import requests
import httpx

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

try:
    with open('fs_model_v2.pkl', 'rb') as f:
        model = pickle.load(f)
except FileNotFoundError:
    raise RuntimeError("Model file 'fs_model_v2.pkl' not found.")
except Exception as e:
    raise RuntimeError(f"Error loading the model: {e}")

base_model = VGG16(weights='imagenet', include_top=False, input_shape=(224, 224, 3))
feature_extractor = base_model

def preprocess_and_extract(img_bytes):
    img = Image.open(BytesIO(img_bytes)).convert("RGB").resize((224, 224))
    img_array = image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0)
    img_array = preprocess_input(img_array)
    features = feature_extractor.predict(img_array)
    features = features.flatten()
    return features

def predict_fire_smoke(img_bytes):
    features = preprocess_and_extract(img_bytes)
    prediction = model.predict([features])[0]

    if prediction == 1:
        return "Fire"
    elif prediction == 2:
        return "Smoke"
    elif prediction == 0:
        return "Neutral"
async def send_backend_alert(alert_type):
    backend_url = "http://localhost:5000/api/detection-alert"
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(backend_url, json={"type": alert_type})
            response.raise_for_status()  # Raise an exception for bad status codes
            print(f"Alert sent to backend: {alert_type} - Status: {response.status_code}")
        except httpx.RequestError as e:
            print(f"Error sending alert to backend: {e}")
        except httpx.HTTPStatusError as e:
            print(f"Error response from backend: {e.response.status_code} - {e.response.text}")
@app.post("/predict/")
async def predict(request_data: dict):
    try:
        image_data = request_data.get('image_data')
        if not image_data:
            raise HTTPException(status_code=400, detail="Missing image_data in request")

        img_bytes = base64.b64decode(image_data)
        prediction = predict_fire_smoke(img_bytes)
        print(f"[FastAPI] Raw Prediction: {prediction}") 
        if prediction == "Fire":
            print("[FastAPI] Fire detected - Calling backend alert")
            await send_backend_alert("fire")
        elif prediction == "Smoke":
            print("[FastAPI] Smoke detected - Calling backend alert")
            await send_backend_alert("smoke")
        else:
            print("[FastAPI] Prediction: Neutral")
        return JSONResponse({"prediction": prediction})

    except base64.binascii.Error:
        raise HTTPException(status_code=400, detail="Invalid base64 encoded image data")
    except Exception as e:
        print(f"[FastAPI] Error in /predict/: {e}")
        raise HTTPException(status_code=500, detail=str(e))