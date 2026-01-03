import logging
import sys
from typing import Any
import json
from datetime import datetime
from contextvars import ContextVar

# Context Vars for traceability
request_id_context: ContextVar[str] = ContextVar("request_id", default=None)
job_id_context: ContextVar[str] = ContextVar("job_id", default=None)

class JSONFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        log_obj: dict[str, Any] = {
            "timestamp": datetime.utcnow().isoformat(),
            "level": record.levelname,
            "message": record.getMessage(),
            "logger": record.name,
        }
        
        # Add Context Vars
        req_id = request_id_context.get()
        if req_id:
            log_obj["request_id"] = req_id
            
        job_id = job_id_context.get()
        if job_id:
            log_obj["job_id"] = job_id
            
        # Legacy support if passed via extra
        if hasattr(record, "request_id") and not req_id:
             log_obj["request_id"] = record.request_id

        if record.exc_info:
            log_obj["exception"] = self.formatException(record.exc_info)
            
        return json.dumps(log_obj)

def setup_logging():
    root_logger = logging.getLogger()
    root_logger.setLevel(logging.INFO)
    
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(JSONFormatter())
    root_logger.addHandler(handler)
    
    # Quiet down some noisy libraries
    logging.getLogger("uvicorn.access").disabled = True # We might want to replace with our own middleware logging
