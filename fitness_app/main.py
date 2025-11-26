
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.orm import declarative_base, sessionmaker, Session

DATABASE_URL = "sqlite:///./fitness_app.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
Base = declarative_base()

class MealRequest(Base):
    __tablename__ = "meal_requests"
    id = Column(Integer, primary_key=True, index=True)
    calories = Column(Integer, nullable=False)
    meals_per_day = Column(Integer, nullable=False)
    diet_type = Column(String, default="balanced")
    goal = Column(String, default="lose")

Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try: yield db
    finally: db.close()

class MealPlanRequest(BaseModel):
    calories: int
    meals_per_day: int = 3
    diet_type: str = "balanced"
    goal: str = "lose"

class Meal(BaseModel):
    name: str
    calories: int

class MealPlanResponse(BaseModel):
    total_calories: int
    meals: List[Meal]
    goal: str
    diet_type: str

app = FastAPI(title="Bruce Lee Fitness App API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], allow_credentials=True,
    allow_methods=["*"], allow_headers=["*"],
)

MEAL_TEMPLATES = {
    "balanced": [
        "Oatmeal with berries",
        "Grilled chicken salad",
        "Salmon, rice & veggies",
        "Greek yogurt & nuts",
        "Turkey wrap with veggies",
    ],
    "keto": [
        "Egg scramble with cheese",
        "Cobb salad (no croutons)",
        "Steak & broccoli with butter",
        "Avocado & tuna bowl",
        "Zucchini noodles with pesto",
    ],
    "vegan": [
        "Tofu scramble & veggies",
        "Quinoa & chickpea bowl",
        "Lentil curry & cauliflower rice",
        "Oats with almond milk & seeds",
        "Black bean & veggie tacos",
    ],
}

@app.post("/api/meal-plan", response_model=MealPlanResponse)
def generate_meal_plan(payload: MealPlanRequest, db: Session = Depends(get_db)):
    db_req = MealRequest(
        calories=payload.calories,
        meals_per_day=payload.meals_per_day,
        diet_type=payload.diet_type,
        goal=payload.goal,
    )
    db.add(db_req)
    db.commit()
    db.refresh(db_req)

    templates = MEAL_TEMPLATES.get(payload.diet_type.lower(), MEAL_TEMPLATES["balanced"])
    per_meal = max(200, payload.calories // payload.meals_per_day)

    meals = []
    for i in range(payload.meals_per_day):
        name = templates[i % len(templates)]
        meals.append(Meal(name=name, calories=per_meal))

    return MealPlanResponse(
        total_calories=payload.calories,
        meals=meals,
        goal=payload.goal,
        diet_type=payload.diet_type,
    )
