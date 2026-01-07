"""Add language column to users

Revision ID: add_user_language
Revises: 
Create Date: 2026-01-07

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'add_user_language'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # Add language column to users table
    op.add_column('users', sa.Column('language', sa.String(), nullable=True))
    # Set default value for existing users
    op.execute("UPDATE users SET language = 'en' WHERE language IS NULL")
    # Make column non-nullable after setting defaults
    op.alter_column('users', 'language', nullable=False, server_default='en')


def downgrade():
    # Remove language column
    op.drop_column('users', 'language')
