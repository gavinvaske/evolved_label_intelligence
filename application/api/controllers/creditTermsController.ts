import { Router, Request, Response, RequestHandler } from 'express';
import { SUCCESS, BAD_REQUEST, CREATED_SUCCESSFULLY } from '../enums/httpStatusCodes.ts';
import { verifyBearerToken } from '../middleware/authorize.ts';
import { CreditTermModel } from '../models/creditTerm.ts';
import { SearchQuery, SearchResult } from '@shared/types/http.ts';
import { SortOption } from '@shared/types/mongoose.ts';
import { getSortOption } from '../services/mongooseService.ts';
import { DEFAULT_SORT_OPTIONS } from '../constants/mongoose.ts';
import { ICreditTerm } from '@shared/types/models.ts';
import { SearchHandler } from '@api/types/express.ts';

const router = Router();
router.use(verifyBearerToken);

router.get('/search', (async (request: Request<{}, {}, {}, SearchQuery>, response: Response) => {
  const { query, pageIndex, limit, sortField, sortDirection } = request.query as SearchQuery;

  if (!pageIndex || !limit) {
    response.status(BAD_REQUEST).send('Invalid page index or limit');
    return;
  }
  if (sortDirection?.length && sortDirection !== '1' && sortDirection !== '-1') {
    response.status(BAD_REQUEST).send('Invalid sort direction');
    return;
  }

  const pageNumber = parseInt(pageIndex, 10);
  const pageSize = parseInt(limit, 10);
  const numDocsToSkip = pageNumber * pageSize;
  const sortOptions: SortOption = getSortOption(sortField, sortDirection);

  const textSearch = query && query.length
    ? {
      $or: [
        { description: { $regex: query, $options: 'i' } },
      ],
    }
    : {};

  const pipeline = [
    {
      $match: {
        ...textSearch,
      },
    },
    {
      $facet: {
        paginatedResults: [
          { $sort: { ...sortOptions, ...DEFAULT_SORT_OPTIONS } },
          { $skip: numDocsToSkip },
          { $limit: pageSize },
        ],
        totalCount: [
          { $count: 'count' },
        ],
      },
    },
  ];

  const results = await CreditTermModel.aggregate<any>(pipeline);
  const totalDocumentCount = results[0]?.totalCount[0]?.count || 0; // Extract total count
  const creditTerms = results[0]?.paginatedResults || [];
  const totalPages = Math.ceil(totalDocumentCount / pageSize);

  const paginationResponse: SearchResult<ICreditTerm> = {
    totalResults: totalDocumentCount,
    totalPages,
    currentPageIndex: (query && query.length) ? 0 : pageNumber,
    results: creditTerms,
    pageSize,
  }

  response.json(paginationResponse);
}) as SearchHandler);

router.post('/', (async (request: Request, response: Response) => {
  const savedCreditTerm = await CreditTermModel.create(request.body);

  response.status(CREATED_SUCCESSFULLY).send(savedCreditTerm);
}) as RequestHandler);

router.delete('/:mongooseId', (async (request: Request, response: Response) => {
  const deletedCreditTerm = await CreditTermModel.deleteById(request.params.mongooseId, request.user._id)

  response.status(SUCCESS).json(deletedCreditTerm);
}) as RequestHandler);

router.patch('/:mongooseId', (async (request: Request, response: Response) => {
  const updatedCreditTerm = await CreditTermModel.findOneAndUpdate(
    { _id: request.params.mongooseId },
    { $set: request.body },
    { runValidators: true, new: true }
  ).exec();

  response.json(updatedCreditTerm);
}) as RequestHandler);

router.get('/:mongooseId', (async (request: Request, response: Response) => {
  const creditTerm = await CreditTermModel.findById(request.params.mongooseId);

  response.json(creditTerm);
}) as RequestHandler);

export default router;