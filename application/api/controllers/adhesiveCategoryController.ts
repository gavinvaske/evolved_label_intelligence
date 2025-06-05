import { Router, Request, Response, RequestHandler } from 'express';
import { verifyBearerToken } from '../middleware/authorize.ts';
import { AdhesiveCategoryModel } from '../models/adhesiveCategory.ts';
import { BAD_REQUEST, CREATED_SUCCESSFULLY, SUCCESS } from '../enums/httpStatusCodes.ts';
import { SearchQuery, SearchResult } from '@shared/types/http.ts';
import { SortOption } from '@shared/types/mongoose.ts';
import { getSortOption } from '../services/mongooseService.ts';
import { DEFAULT_SORT_OPTIONS } from '../constants/mongoose.ts';
import { IAdhesiveCategory } from '@shared/types/models.ts';
import { SearchHandler } from '@api/types/express.ts';

const router = Router();
router.use(verifyBearerToken);

router.get('/search', (async (request: Request<{}, {}, {}, SearchQuery>, response: Response) => {
  const { query, pageIndex, limit, sortField, sortDirection } = request.query;

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
        { name: { $regex: query, $options: 'i' } }
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

  const results = await AdhesiveCategoryModel.aggregate<any>(pipeline);
  const totalDocumentCount = results[0]?.totalCount[0]?.count || 0;
  const adhesiveCategories = results[0]?.paginatedResults || [];
  const totalPages = Math.ceil(totalDocumentCount / pageSize);

  const paginationResponse: SearchResult<IAdhesiveCategory> = {
    totalResults: totalDocumentCount,
    totalPages,
    currentPageIndex: (query && query.length) ? 0 : pageNumber,
    results: adhesiveCategories,
    pageSize,
  }

  response.json(paginationResponse);
}) as SearchHandler);

router.delete('/:mongooseId', (async (request: Request, response: Response) => {
  const deletedAdhesiveCategory = await AdhesiveCategoryModel.deleteById(request.params.mongooseId, request.user._id)

  response.status(SUCCESS).json(deletedAdhesiveCategory);
}) as RequestHandler);

router.get('/', (async (_: Request, response: Response) => {
  const adhesiveCategories = await AdhesiveCategoryModel.find().exec();

  response.json(adhesiveCategories);
}) as RequestHandler);

router.patch('/:mongooseId', (async (request: Request, response: Response) => {
  const updatedAdhesiveCategory = await AdhesiveCategoryModel.findOneAndUpdate(
    { _id: request.params.mongooseId },
    { $set: request.body },
    { runValidators: true, new: true }
  ).exec();

  response.json(updatedAdhesiveCategory);
}) as RequestHandler);

router.post('/', (async (request: Request, response: Response) => {
  const savedAdhesiveCategory = await AdhesiveCategoryModel.create(request.body);

  response.status(CREATED_SUCCESSFULLY).send(savedAdhesiveCategory);
}) as RequestHandler);

router.get('/:mongooseId', (async (request: Request, response: Response) => {
  const adhesiveCategory = await AdhesiveCategoryModel.findById(request.params.mongooseId);

  response.json(adhesiveCategory);
}) as RequestHandler);


export default router;