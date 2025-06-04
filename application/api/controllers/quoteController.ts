import { Router, Request, Response, RequestHandler } from 'express';
import { verifyBearerToken } from '../middleware/authorize.ts';
import * as quoteService from '../services/quoteService.ts';
import { QuoteModel } from '../models/quote.ts';
import { DESCENDING } from '../enums/mongooseSortMethods.ts';

const router = Router();
router.use(verifyBearerToken);

router.post('/', (async (request: Request, response: Response) => {
  const labelQuantities = request.body.labelQuantities;
  delete request.body.labelQuantities;
  const quoteInputs = request.body;
  const quotes = await quoteService.createQuotes(labelQuantities, quoteInputs);

  response.send(quotes);
}) as RequestHandler);

router.get('/', (async (_: Request, response: Response) => {
  const quotes = await QuoteModel.find().sort({ updatedAt: DESCENDING }).exec();

  response.json(quotes);
}) as RequestHandler);

export default router;