import { ErrorRequestHandler, Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { BAD_REQUEST, CONFLICT, SERVER_ERROR } from './enums/httpStatusCodes';

interface ErrorResponse {
  error: string | undefined;
  errors: string[] | undefined;
  status: number;
}

const createErrorResponse = (status: number, message?: string, errors?: string[]): ErrorResponse => ({
  error: message,
  errors,
  status
});

export const errorHandler: ErrorRequestHandler = (error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error details:', {
    name: error.name,
    message: error.message,
    stack: error.stack
  });

  // Default error response
  let response: ErrorResponse = createErrorResponse(
    SERVER_ERROR,
    'An unexpected error occurred'
  );

  // Handle basic Error instances
  if (error instanceof Error && !(error instanceof mongoose.Error)) {
    response = createErrorResponse(
      SERVER_ERROR,
      error.message
    );
  }

  // Handle Mongoose bad ObjectId (e.g., /:id with malformed ID)
  else if (error instanceof mongoose.Error.CastError) {
    response = createErrorResponse(
      BAD_REQUEST,
      undefined,
      [`Invalid ${error.path}: ${error.value}`]
    );
  }

  // Handle Mongoose validation errors (e.g., required fields missing)
  else if (error instanceof mongoose.Error.ValidationError) {
    const validationErrors = Object.values(error.errors).map(e => e.message);
    response = createErrorResponse(
      BAD_REQUEST,
      undefined,
      validationErrors
    );
  }

  // Handle duplicate key errors (e.g., unique fields)
  else if (error.code === 11000) {
    const fields = Object.keys(error.keyValue || {}).join(', ');
    response = createErrorResponse(
      CONFLICT,
      undefined,
      [`Duplicate value for field(s): ${fields}`]
    );
  }

  // Handle custom errors with status codes
  else if ('status' in error && typeof error.status === 'number') {
    response = createErrorResponse(
      error.status,
      error.message
    );
  }

  // Send JSON response with structured error format
  res.status(response.status).json({
    error: response.error,
    errors: response.errors
  });
};

