# Import all models here to ensure they are registered with Base metadata
from app.db.session import Base
from app.db.models.input import Input
from app.db.models.job import Job
from app.db.models.result import Result
from app.db.models.recommendation import Recommendation
from app.db.models.sku import SKU
from app.db.models.sku_embedding import SKUEmbedding
from app.db.models.taxonomy import Taxonomy
from app.db.models.feedback import Feedback
from app.db.models.user import User
from app.db.models.conversation import Conversation, Message
