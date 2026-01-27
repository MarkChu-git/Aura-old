"""add_password_reset_tokens_table

Revision ID: pwd_reset_001
Revises: 7163403ca168
Create Date: 2026-01-06

"""

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "pwd_reset_001"
down_revision = "1b5ca8e129db"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "password_reset_tokens",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("token", sa.String(), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("used", sa.Boolean(), server_default="false", nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=True,
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_password_reset_tokens_id"),
        "password_reset_tokens",
        ["id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_password_reset_tokens_token"),
        "password_reset_tokens",
        ["token"],
        unique=True,
    )
    op.create_index(
        op.f("ix_password_reset_tokens_user_id"),
        "password_reset_tokens",
        ["user_id"],
        unique=False,
    )


def downgrade():
    op.drop_index(
        op.f("ix_password_reset_tokens_user_id"), table_name="password_reset_tokens"
    )
    op.drop_index(
        op.f("ix_password_reset_tokens_token"), table_name="password_reset_tokens"
    )
    op.drop_index(
        op.f("ix_password_reset_tokens_id"), table_name="password_reset_tokens"
    )
    op.drop_table("password_reset_tokens")
