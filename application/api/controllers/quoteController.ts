import { Router, Request, Response, RequestHandler } from 'express';
import { verifyBearerToken } from '../middleware/authorize.ts';
import * as quoteService from '../services/quoteService.ts';
import { QuoteModel } from '../models/quote.ts';
import { DESCENDING } from '../enums/mongooseSortMethods.ts';
import { SERVER_ERROR } from '../enums/httpStatusCodes.ts';

const router = Router();
router.use(verifyBearerToken);

const BAD_REQUEST_STATUS = 400;

router.post('/', (async (request: Request, response: Response) => {
  const labelQuantities = request.body.labelQuantities;
  delete request.body.labelQuantities;
  const quoteInputs = request.body;

  try {
    const quotes = await quoteService.createQuotes(labelQuantities, quoteInputs);
    response.send(quotes);
  } catch (error) {
    console.log('Error creating quotes: ', error);
    response.status(BAD_REQUEST_STATUS).send(error.message);
  }
}) as RequestHandler);

router.get('/', (async (_: Request, response: Response) => {
  try {
    const quotes = await QuoteModel.find().sort({ updatedAt: DESCENDING }).exec();

    response.json(quotes);
  } catch (error) {
    console.error('Error loading quotes', error);
    response.status(SERVER_ERROR).send(error.message);
  }
}) as RequestHandler);

export default router;