export class ApiError extends Error {
  constructor(statusCode, message, errorCode = "ERROR") {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
  }

  static badRequest(message, errorCode = "BAD_REQUEST") {
    return new ApiError(400, message, errorCode);
  }

  static unauthorized(message = "Authentication required", errorCode = "UNAUTHORIZED") {
    return new ApiError(401, message, errorCode);
  }

  static forbidden(message = "You do not have permission to perform this action", errorCode = "FORBIDDEN") {
    return new ApiError(403, message, errorCode);
  }

  static notFound(message = "Resource not found", errorCode = "NOT_FOUND") {
    return new ApiError(404, message, errorCode);
  }

  static conflict(message, errorCode = "CONFLICT") {
    return new ApiError(409, message, errorCode);
  }

  static validation(message, errorCode = "VALIDATION_ERROR") {
    return new ApiError(422, message, errorCode);
  }
}
