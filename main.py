from fastapi import FastAPI
from pydantic import BaseModel
from llm import llm_answer
from fastapi.middleware.cors import CORSMiddleware

app=FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class QueryRequest(BaseModel):
    question:str

class QueryResponse(BaseModel):
    answer:str

@app.post("/ask",response_model=QueryResponse)
def ask_ques(payload: QueryRequest):
    
    questions=payload.question
    crops = ["wheat", "tomato", "tomatoes", "pepper", "peppers",
             "maize", "corn", "sugarcane", "rice"]

    intent_keywords = ["harvest", "ready", "readiness", "maturity", "mature",
                       "ripeness", "ripe", "moisture", "brix", "firmness"]

    is_crop = any(crop in questions for crop in crops)
    is_harvest_intent = any(k in questions for k in intent_keywords)

    if is_crop or is_harvest_intent:
        ans = llm_answer(payload.question)

    else:
        ans="Right now I'm a simple demo. I can answer basic harvest questions about wheat and tomatoes. Try asking, for example: 'When is wheat ready to harvest?' "
    

    return QueryResponse(answer=ans)

































'''
@app.post("/ans",response_model=QueryResponse)
def ask_ques(payload: QueryRequest):
    
    questions=payload.question.lower()
    if "wheat" in questions:
        ans="Wheat is usually ready to harvest when the grains are hard, the crop turns golden-yellow, and the moisture content is around 18–20%"
    elif "harvest" and "tomatoes" in questions:
        ans="Tomatoes are typically ready to harvest when they reach a uniform red color for that variety and are slightly soft to the touch."
    else:
        ans="Right now I'm a simple demo. I can answer basic harvest questions about wheat and tomatoes. Try asking, for example: 'When is wheat ready to harvest?' "
    

    return QueryResponse(answer=ans)
'''




