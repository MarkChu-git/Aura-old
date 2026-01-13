"""add title_status to conversations

Revision ID: b6b6fb8b984a
Revises: 81b53ab252e4
Create Date: 2026-01-11 09:08:04.678513

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b6b6fb8b984a'
down_revision: Union[str, None] = '81b53ab252e4'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add title_status column with a default value to handle existing rows
    op.add_column('conversations', sa.Column('title_status', sa.String(), server_default='initial', nullable=False))


def downgrade() -> None:
    op.drop_column('conversations', 'title_status')
