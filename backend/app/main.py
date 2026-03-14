"""FastAPI application."""

from contextlib import asynccontextmanager
from fastapi import Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware

from .auth import get_current_user, get_password_hash, create_access_token, verify_password
from .database import init_db, get_db
from .models import User, Contact
from .schemas import (
    UserCreate,
    UserResponse,
    Token,
    ContactCreate,
    ContactResponse,
)
from .prefectures import PREFECTURES

from fastapi import FastAPI
from sqlalchemy.orm import Session


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(title="Address Book API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Auth routes
@app.post("/api/auth/register", response_model=UserResponse)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.username == user_in.username).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered",
        )
    user = User(
        username=user_in.username,
        hashed_password=get_password_hash(user_in.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@app.post("/api/auth/login", response_model=Token)
def login(user_in: UserCreate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == user_in.username).first()
    if not user or not verify_password(user_in.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
        )
    token = create_access_token(data={"sub": user.username})
    return Token(access_token=token)


# Prefectures (public)
@app.get("/api/prefectures")
def get_prefectures():
    return PREFECTURES


# Contact routes (auth required)
@app.get("/api/contacts", response_model=list[ContactResponse])
def list_contacts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    contacts = db.query(Contact).filter(Contact.user_id == current_user.id).all()
    return contacts


@app.post("/api/contacts", response_model=ContactResponse, status_code=status.HTTP_201_CREATED)
def create_contact(
    contact_in: ContactCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    contact = Contact(
        user_id=current_user.id,
        first_name=contact_in.first_name,
        last_name=contact_in.last_name,
        email=contact_in.email,
        phone=contact_in.phone,
        city=contact_in.city,
        prefecture=contact_in.prefecture,
        postal_code=contact_in.postal_code,
    )
    db.add(contact)
    db.commit()
    db.refresh(contact)
    return contact


@app.delete("/api/contacts/{contact_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_contact(
    contact_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    contact = (
        db.query(Contact)
        .filter(Contact.id == contact_id, Contact.user_id == current_user.id)
        .first()
    )
    if not contact:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Contact not found")
    db.delete(contact)
    db.commit()
    return None
