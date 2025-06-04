import { ErrorRequestHandler, Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { BAD_REQUEST, CONFLICT, SERVER_ERROR } from './enums/httpStatusCodes';

export const errorHandler: ErrorRequestHandler = (error, req: Request, res: Response, next: NextFunction) => {
  console.error(error);

  // Default status code and message
  let status = SERVER_ERROR;
  let errors: string[] = [];

  // Handle Mongoose bad ObjectId (e.g., /:id with malformed ID)
  if (error instanceof mongoose.Error.CastError) {
    status = BAD_REQUEST;
    errors.push(`Invalid ${error.path}: ${error.value}`);
  }

  // Handle Mongoose validation errors (e.g., required fields missing)
  else if (error instanceof mongoose.Error.ValidationError) {
    status = BAD_REQUEST;
    errors = Object.values(error.errors).map(e => e.message);
  }

  // Handle duplicate key errors (e.g., unique fields)
  else if (error.code === 11000) {
    status = CONFLICT;
    const fields = Object.keys(error.keyValue || {}).join(', ');
    errors.push(`Duplicate value for field(s): ${fields}`);
  }

  const response = {
    error: errors.length === 1 ? errors[0] : undefined,
    errors: errors.length > 1 ? errors : undefined,
  }

  // Send JSON response with structured error format
  res.status(status).json(response);
};
