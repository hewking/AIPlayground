class LLMException(Exception):
    """Base exception for LLM operations"""
    pass

class APIKeyNotFoundError(LLMException):
    """Raised when API key is missing"""
    pass

class ModelNotAvailableError(LLMException):
    """Raised when model is not available"""
    pass 