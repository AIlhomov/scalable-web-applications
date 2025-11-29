from fastapi import FastAPI, Request
import joblib
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.linear_model import LinearRegression
from sklearn.pipeline import Pipeline
import os

server = FastAPI()

# Load or initialize model
MODEL_PATH = "model.joblib"

if os.path.exists(MODEL_PATH):
    model = joblib.load(MODEL_PATH)
else:
    # Initialize with a default model
    model = None


@server.post("/inference-api/predict")
async def predict(request: Request):
    if model is None:
        return {"error": "Model not trained yet"}, 400
    
    data = await request.json()

    input_data = pd.DataFrame({
        'exercise': [data.get("exercise")],
        'code': [data.get("code")]
    })

    prediction = model.predict(input_data)[0]

    return {"prediction": prediction}


@server.post("/inference-api/train")
async def train(request: Request):
    global model
    
    data = await request.json()
    
    # Convert input data to DataFrame
    df = pd.DataFrame(data)
    
    # Create preprocessor
    preprocessor = ColumnTransformer(
        transformers=[
            ('code', CountVectorizer(ngram_range=(1, 3)), 'code'),
            ('exercise', 'passthrough', ['exercise'])
        ]
    )
    
    # Create pipeline
    pipeline = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('regressor', LinearRegression())
    ])
    
    # Train the model
    X = df[['exercise', 'code']]
    y = df['grade']
    
    pipeline.fit(X, y)
    
    # Save the model
    joblib.dump(pipeline, MODEL_PATH)
    
    # Update the global model variable
    model = pipeline
    
    return {"status": "Model trained successfully"}
