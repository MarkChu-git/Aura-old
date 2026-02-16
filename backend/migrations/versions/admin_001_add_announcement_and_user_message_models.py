"""add_announcement_and_user_message_models

Revision ID: admin_001
Revises: pwd_reset_001
Create Date: 2026-01-25

"""

from alembic import op
import sqlalchemy as sa

revision = "admin_001"
down_revision = "b6b6fb8b984a"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "announcements",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("is_active", sa.Boolean(), server_default="true", nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=True,
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_announcements_id"),
        "announcements",
        ["id"],
        unique=False,
    )

    op.create_table(
        "user_messages",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("is_read", sa.Boolean(), server_default="false", nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=True,
        ),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_user_messages_id"),
        "user_messages",
        ["id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_user_messages_user_id"),
        "user_messages",
        ["user_id"],
        unique=False,
    )


def downgrade():
    op.drop_index(op.f("ix_user_messages_user_id"), table_name="user_messages")
    op.drop_index(op.f("ix_user_messages_id"), table_name="user_messages")
    op.drop_table("user_messages")

    op.drop_index(op.f("ix_announcements_id"), table_name="announcements")
    op.drop_table("announcements")
