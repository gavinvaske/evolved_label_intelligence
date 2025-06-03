import { Router, Request, Response, RequestHandler } from 'express';
const router = Router();
import { LinerTypeModel } from '../models/linerType.ts';
import { verifyBearerToken } from '../middleware/authorize.ts';
import { BAD_REQUEST, CREATED_SUCCESSFULLY, SERVER_ERROR, SUCCESS } from '../enums/httpStatusCodes.ts';
import { SearchQuery, SearchResult } from '@shared/types/http.ts';
import { SortOption } from '@shared/types/mongoose.ts';
import { getSortOption } from '../services/mongooseService.ts';
import { DEFAULT_SORT_OPTIONS } from '../constants/mongoose.ts';
import { ILinerType } from '@shared/types/models.ts';
import { SearchHandler } from '@api/types/express.ts';

router.use(verifyBearerToken);

router.get('/search', (async (request: Request<{}, {}, {}, SearchQuery>, response: Response) => {
  try {
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

    const results = await LinerTypeModel.aggregate<any>(pipeline);
    const totalDocumentCount = results[0]?.totalCount[0]?.count || 0; // Extract total count
    const linerTypes = results[0]?.paginatedResults || [];
    const totalPages = Math.ceil(totalDocumentCount / pageSize);

    const paginationResponse: SearchResult<ILinerType> = {
      totalResults: totalDocumentCount,
      totalPages,
      currentPageIndex: (query && query.length) ? 0 : pageNumber,
      results: linerTypes,
      pageSize,
    }

    response.json(paginationResponse);
  } catch (error) {
    console.error('Error during linerTypes search:', error);
    response.status(500).send(error);
  }
}) as SearchHandler);

router.delete('/:mongooseId', (async (request: Request, response: Response) => {
  try {
    const deletedLinerType = await LinerTypeModel.deleteById(request.params.mongooseId, request.user._id)

    response.status(SUCCESS).json(deletedLinerType);
  } catch (error) {
    console.error('Failed to delete LinerType: ', error);

    response.status(SERVER_ERROR).send(error.message);
  }
}) as RequestHandler);

router.patch('/:mongooseId', (async (request: Request, response: Response) => {
  try {
    const updatedLinerType = await LinerTypeModel.findOneAndUpdate(
      { _id: request.params.mongooseId },
      { $set: request.body },
      { runValidators: true, new: true }
    ).exec();

    response.json(updatedLinerType);
  } catch (error) {
    console.log('Failed to update LinerType: ', error);
    response.status(SERVER_ERROR).send(error.message);
  }
}) as RequestHandler);

router.post('/', (async (request: Request, response: Response) => {
  try {
    const linerType = await LinerTypeModel.create(request.body);

    response.status(CREATED_SUCCESSFULLY).json(linerType);
  } catch (error) {
    console.error('Failed to create LinerType: ', error);
    response.status(SERVER_ERROR).send(error.message);
  }
}) as RequestHandler);

router.get('/:mongooseId', (async (request: Request, response: Response) => {
  try {
    const linerType = await LinerTypeModel.findById(request.params.mongooseId);
    response.json(linerType);
  } catch (error) {
    console.error('Error searching for linerType: ', error);
    response.status(SERVER_ERROR).send(error.message);
  }
}) as RequestHandler);

export default router;