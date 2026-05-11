export class InvocaError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode?: number
  ) {
    super(message);
    this.name = "InvocaError";
  }
}

export class InvocaAuthError extends InvocaError {
  constructor(message = "Authentication failed. Check your API key.") {
    super(message, "AUTH_ERROR", 401);
    this.name = "InvocaAuthError";
  }
}

export class InvocaNotFoundError extends InvocaError {
  constructor(resource: string, id: string) {
    super(`${resource} with id "${id}" not found`, "NOT_FOUND", 404);
    this.name = "InvocaNotFoundError";
  }
}
