"""${message}

Revision ID: ${up_revision}
Revises: ${down_revision | comma,n}
Create Date: ${create_date}

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import pgvector  # Need this if we use vector types in migrations directly? usually sa.types is enough if configured

# revision identifiers, used by Alembic.
revision: str = ${repr(up_revision)}
down_revision: Union[str, None] = ${repr(down_revision)}
branch_labels: Union[str, Sequence[str], None] = ${repr(branch_labels)}
depends_on: Union[str, Sequence[str], None] = ${repr(depends_on)}


def upgrade() -> None:
    # Enable pgvector extension if it's the first migration (checking down_revision might be flaky if user reorders)
    # Better to just do it in the first migration manually or conditionally
    # op.execute("CREATE EXTENSION IF NOT EXISTS vector")
    ${upgrades if upgrades else "pass"}


def downgrade() -> None:
    ${downgrades if downgrades else "pass"}
