# src/api/responses.py

from typing import Any, Tuple, Dict

def success_response(data: Any, message: str = "Success") -> Tuple[Dict[str, Any], int]:
    return {"message": message, "data": data}, 200

def error_response(message: str = "An error occurred", status_code: int = 400) -> Tuple[Dict[str, str], int]:
    return {"message": message}, status_code

def not_found_response(message: str = "Resource not found") -> Tuple[Dict[str, str], int]:
    return {"message": message}, 404

def validation_error_response(errors: Any) -> Tuple[Dict[str, Any], int]:
    return {"message": "Validation errors", "errors": errors}, 422