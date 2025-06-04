import { RequestHandler } from 'express';
import { SearchQuery } from '@shared/types/http.ts';

export type SearchHandler = RequestHandler<{}, any, any, SearchQuery>;