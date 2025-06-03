import { Router, Request, Response, RequestHandler } from 'express';
const router = Router();
import { verifyBearerToken } from '../middleware/authorize.ts';
import { DieModel } from '../models/die.ts';
import { IDie } from '@shared/types/models.ts';
import { BAD_REQUEST, CREATED_SUCCESSFULLY, NOT_FOUND, SERVER_ERROR, SUCCESS } from '../enums/httpStatusCodes.ts';
import { SearchQuery, SearchResult } from '@shared/types/http.ts';
import { SortOption } from '@shared/types/mongoose.ts';
import { getSortOption } from '../services/mongooseService.ts';
import { DEFAULT_SORT_OPTIONS } from '../constants/mongoose.ts';
import { SearchHandler } from '@api/types/express.ts';


router.use(verifyBearerToken);

router.post('/', (async (request: Request, response: Response) => {
  try {
    await DieModel.create(request.body);

    response.status(CREATED_SUCCESSFULLY).send();
  } catch (error) {
    console.error('Failed to create die:', error.message);
    response.status(SERVER_ERROR).send(error.message);
  }
}) as RequestHandler);

router.patch('/:mongooseId', (async (request: Request, response: Response) => {
  try {
    const updatedDie = await DieModel.findByIdAndUpdate(
      { _id: request.params.mongooseId },
      { $set: request.body },
      { runValidators: true, new: true }
    ).orFail(new Error(`Die not found using ID '${request.params.mongooseId}'`)).exec();

    response.json(updatedDie);
  } catch (error) {
    console.error('Failed to update die:', error.message);
    response.status(BAD_REQUEST).send(error.message);
  }
}) as RequestHandler);

router.delete('/:mongooseId', (async (request: Request, response: Response) => {
  try {
    const deletedDie = await DieModel.deleteById(request.params.mongooseId, request.user._id)

    response.status(SUCCESS).json(deletedDie);
  } catch (error) {
    console.error('Failed to delete die: ', error);
    response.status(SERVER_ERROR).send(error);
  }
}) as RequestHandler);

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
          { dieNumber: { $regex: query, $options: 'i' } },
          { shape: { $regex: query, $options: 'i' } },
          { notes: { $regex: query, $options: 'i' } },
          { vendor: { $regex: query, $options: 'i' } },
          { vendor: { $regex: query, $options: 'i' } },
          { liner: { $regex: query, $options: 'i' } },
          { serialNumber: { $regex: query, $options: 'i' } }
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

    const results = await DieModel.aggregate<any>(pipeline);
    const totalDocumentCount = results[0]?.totalCount[0]?.count || 0; // Extract total count
    const dies = results[0]?.paginatedResults || [];
    const totalPages = Math.ceil(totalDocumentCount / pageSize);

    const paginationResponse: SearchResult<IDie> = {
      totalResults: totalDocumentCount,
      totalPages,
      currentPageIndex: (query && query.length) ? 0 : pageNumber,
      results: dies,
      pageSize,
    }

    response.json(paginationResponse);
  } catch (error) {
    console.error('Error during material-length-adjustment search:', error);
    response.status(500).send(error);
  }
}) as SearchHandler);

router.get('/:mongooseId', (async (request: Request, response: Response) => {
  try {
    const die = await DieModel.findById(request.params.mongooseId)
      .orFail(new Error(`Die not found using ID '${request.params.mongooseId}'`))
      .exec();

    if (!die) {
      response.status(NOT_FOUND).send('Die not found');
      return;
    }

    response.json(die);
  } catch (error) {
    console.error('Error fetching die: ', error.message);
    response.status(SERVER_ERROR).send(error.message);
  }
}) as RequestHandler);

export default router;