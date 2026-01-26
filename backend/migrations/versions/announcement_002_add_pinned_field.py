"""add_pinned_field_to_announcements

Revision ID: announcement_002
Revises: admin_001
Create Date: 2026-01-26

"""

from alembic import op
import sqlalchemy as sa


revision = "announcement_002"
down_revision = "admin_001"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        "announcements",
        sa.Column("is_pinned", sa.Boolean(), server_default="false", nullable=True)
    )


def downgrade():
    op.drop_column("announcements", "is_pinned")
