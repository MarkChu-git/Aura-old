"""Add Google Auth fields to User model

Revision ID: google_auth_001
Revises: pwd_reset_001
Create Date: 2026-01-07

"""

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "google_auth_001"
down_revision = "pwd_reset_001"
branch_labels = None
depends_on = None


def upgrade():
    # Make hashed_password nullable for Google auth users
    op.alter_column(
        "users", "hashed_password", existing_type=sa.String(), nullable=True
    )

    # Add Google authentication fields
    op.add_column("users", sa.Column("google_sub", sa.String(), nullable=True))
    op.add_column("users", sa.Column("name", sa.String(), nullable=True))
    op.add_column("users", sa.Column("picture_url", sa.String(), nullable=True))

    # Create unique index on google_sub
    op.create_index(op.f("ix_users_google_sub"), "users", ["google_sub"], unique=True)


def downgrade():
    # Remove indexes and columns
    op.drop_index(op.f("ix_users_google_sub"), table_name="users")
    op.drop_column("users", "picture_url")
    op.drop_column("users", "name")
    op.drop_column("users", "google_sub")

    # Restore hashed_password NOT NULL constraint
    op.alter_column(
        "users", "hashed_password", existing_type=sa.String(), nullable=False
    )
