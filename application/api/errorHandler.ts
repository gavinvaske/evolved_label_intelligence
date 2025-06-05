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

  else if (error instanceof mongoose.Error.ValidationError) {
    const validationErrors = Object.values(error.errors).map(e => convertMongooseErrorToHumanReadable(e as mongoose.Error.ValidatorError));
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

const convertMongooseErrorToHumanReadable = (error: mongoose.Error.ValidatorError | mongoose.Error.CastError) => {
  // Handle CastError inside a ValidationError
  if (error instanceof mongoose.Error.CastError) {
    return `${error.path} must be a ${error.kind}`;
  }

  // Required field
  if (error.kind === 'required') {
    return `${error.path} is required`;
  }

  // String length validators
  if (error.kind === 'minlength') {
    return `${error.path} is too short`;
  }

  if (error.kind === 'maxlength') {
    return `${error.path} is too long`;
  }

  // Enum validator
  if (error.kind === 'enum' && 'enumValues' in error && Array.isArray((error as any).enumValues)) {
    return `${error.path} must be one of: ${(error as any).enumValues.join(', ')}`;
  }

  // Custom validator message
  if (error instanceof mongoose.Error.ValidatorError) {
    return `${error.path} ${error.message}`
  }

  // Catch-all for other types inside ValidationError
  // @ts-ignore
  return `${error.path ? error.path : 'One or more fields'} is invalid`;
}
