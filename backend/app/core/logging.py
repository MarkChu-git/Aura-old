"""
Logging Configuration Module
----------------------------
This module configures the application's logging system. It sets up a JSON formatter
for structured logging and handles context variables (request_id, job_id) to ensure
traceability across async requests.

Author: Aura Team
Created: 2024-01-01
"""

import logging
import sys
from typing import Any, Optional
import json
from datetime import datetime
from contextvars import ContextVar

# Context Vars for traceability across async calls
request_id_context: ContextVar[Optional[str]] = ContextVar("request_id", default=None)
job_id_context: ContextVar[Optional[str]] = ContextVar("job_id", default=None)


class JSONFormatter(logging.Formatter):
    """
    Custom Logging Formatter that outputs logs in JSON format.
    
    This formatter automatically includes context variables like request_id and job_id
    if they are present in the current context. It ensures logs are machine-readable
    and suitable for log aggregation systems.
    """
    
    def format(self, record: logging.LogRecord) -> str:
        """
        Format the log record as a JSON string.

        Args:
            record (logging.LogRecord): The log record to format.

        Returns:
            str: JSON string representation of the log record.
        """
        log_obj: dict[str, Any] = {
            "timestamp": datetime.utcnow().isoformat(),
            "level": record.levelname,
            "message": record.getMessage(),
            "logger": record.name,
        }

        # Add Context Vars (Traceability)
        req_id = request_id_context.get()
        if req_id:
            log_obj["request_id"] = req_id

        job_id = job_id_context.get()
        if job_id:
            log_obj["job_id"] = job_id

        # Legacy support if passed via extra dict in logger call
        if hasattr(record, "request_id") and not req_id:
            log_obj["request_id"] = record.request_id

        # Include exception info if present
        if record.exc_info:
            log_obj["exception"] = self.formatException(record.exc_info)

        return json.dumps(log_obj)


def setup_logging():
    """
    Initialize the logging configuration.
    
    Sets the root logger level to INFO, attaches the JSONFormatter to stdout,
    and silences some noisy third-party libraries.
    """
    root_logger = logging.getLogger()
    root_logger.setLevel(logging.INFO)

    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(JSONFormatter())
    root_logger.addHandler(handler)

    # Quiet down some noisy libraries
    logging.getLogger("uvicorn.access").disabled = (
        True  # We might want to replace with our own middleware logging
    )
