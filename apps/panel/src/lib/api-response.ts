import { NextResponse } from "next/server";

export class ApiResponse<T> {
  constructor(
    public data: T,
    public status: number,
    public message: string,
  ) {}

  toResponse() {
    return NextResponse.json({
      data: this.data,
      status: this.status,
      message: this.message,
    });
  }
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any,
  ) {
    super(message);
  }

  toResponse() {
    return NextResponse.json(
      {
        error: this.message,
        data: this.data,
        code: this.status,
      },
      { status: this.status },
    );
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message: string, data?: any) {
    super(message, 401, data);
  }
}

export class BadRequestError extends ApiError {
  constructor(message: string, data?: any) {
    super(message, 400, data);
  }
}
