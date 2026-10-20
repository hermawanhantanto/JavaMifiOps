export class AppError extends Error {
  public readonly statusCode: number;
  public readonly data?: unknown;

  constructor(message: string, statusCode: number = 400, data?: unknown) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.data = data;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Conflict: Resource already exists') {
    super(message, 409);
  }
}

export class BadRequestError extends AppError {
  constructor(message: string = 'Bad request', data?: unknown) {
    super(message, 400, data);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Email or password wrong', data?: unknown) {
    super(message, 401, data);
  }
}
