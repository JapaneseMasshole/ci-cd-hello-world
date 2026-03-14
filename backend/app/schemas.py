"""Pydantic schemas."""

from datetime import datetime
from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    username: str
    password: str


class UserResponse(BaseModel):
    id: int
    username: str

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class ContactCreate(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    phone: str
    city: str
    prefecture: str
    postal_code: str


class ContactResponse(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: str
    phone: str
    city: str
    prefecture: str
    postal_code: str
    created_at: datetime

    class Config:
        from_attributes = True
