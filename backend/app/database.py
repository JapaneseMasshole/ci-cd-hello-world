"""Database connection and session management."""

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

Base = declarative_base()

DATABASE_DIR = os.environ.get("DATABASE_DIR", "/app/data")
os.makedirs(DATABASE_DIR, exist_ok=True)
DATABASE_URL = f"sqlite:///{DATABASE_DIR}/addressbook.db"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def _migrate_add_street_addresses():
    """Add street_address_1 and street_address_2 columns if they don't exist."""
    from sqlalchemy import text
    with engine.connect() as conn:
        result = conn.execute(
            text("SELECT name FROM pragma_table_info('contacts') WHERE name IN ('street_address_1', 'street_address_2')")
        )
        existing = {row[0] for row in result}
        if "street_address_1" not in existing:
            conn.execute(text("ALTER TABLE contacts ADD COLUMN street_address_1 VARCHAR(256) NOT NULL DEFAULT ''"))
        if "street_address_2" not in existing:
            conn.execute(text("ALTER TABLE contacts ADD COLUMN street_address_2 VARCHAR(256) NOT NULL DEFAULT ''"))
        conn.commit()


def init_db():
    """Create all tables and run migrations."""
    from . import models  # noqa: F401 - register models with Base
    Base.metadata.create_all(bind=engine)
    _migrate_add_street_addresses()


def get_db():
    """Dependency for FastAPI routes."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
