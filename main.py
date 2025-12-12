from fastapi import FastAPI
from pydantic import BaseModel

app=FastAPI()

class QueryRequest(BaseModel):
    question:str

class QueryResponse(BaseModel):
    answer:str

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





