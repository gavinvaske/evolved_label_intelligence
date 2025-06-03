import { Router, Request, Response, RequestHandler } from 'express';
const router = Router();
import { BAD_REQUEST, CREATED_SUCCESSFULLY, SERVER_ERROR, SUCCESS } from '../enums/httpStatusCodes.ts';
import { verifyBearerToken } from '../middleware/authorize.ts';
import { IMaterialLengthAdjustment } from '@shared/types/models.ts';
import { MaterialLengthAdjustmentModel } from '../models/materialLengthAdjustment.ts';
import { SearchQuery, SearchResult } from '../../_types/shared/http.ts';
import { DEFAULT_SORT_OPTIONS } from '../constants/mongoose.ts';
import { SortOption } from '../../_types/shared/mongoose.ts';
import { getSortOption } from '../services/mongooseService.ts';
import { SearchHandler } from '@api/types/express.ts';

router.use(verifyBearerToken);

router.post('/batch', (async (request: Request, response: Response) => {
  try {
    const { ids } = request.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      response.status(400).json({ error: "'ids' is invalid" });
      return;
    }

    const orders = await MaterialLengthAdjustmentModel
      .find({ _id: { $in: ids } })
      .populate('material')
      .exec();

    response.json(orders);
  } catch (error) {
    console.error('Failed to fetch materialLengthAdjustments by ids', error);
    response.status(BAD_REQUEST).send(error.message);
  }
}) as RequestHandler);

router.post('/', (async (request: Request, response: Response) => {
  try {
    const savedMaterialLengthAdjustment = await MaterialLengthAdjustmentModel.create(request.body);

    response.status(CREATED_SUCCESSFULLY).send(savedMaterialLengthAdjustment);
  } catch (error) {
    console.error('Error creating materialLengthAdjustment: ', error);
    response.status(SERVER_ERROR).send(error.message);
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
          { notes: { $regex: query, $options: 'i' } },
          { 'material.name': { $regex: query, $options: 'i' } },
          { 'material.materialId': { $regex: query, $options: 'i' } },
        ],
      }
      : {};

    const pipeline = [
      {
        $lookup: {
          from: 'materials',       // The collection for the Material model
          localField: 'material',  // Field referencing the Material
          foreignField: '_id',     // Field in Material for matching
          as: 'material',
        },
      },
      {
        $unwind: {
          path: '$material',
          preserveNullAndEmptyArrays: true, // In case material is not populated
        },
      },
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
            {
              $project: {
                ...Object.fromEntries(Object.keys(MaterialLengthAdjustmentModel.schema.paths).map(key => [key, `$${key}`])),
                material: '$material',
              },
            },
          ],
          totalCount: [
            { $count: 'count' },
          ],
        },
      },
    ];

    const results = await MaterialLengthAdjustmentModel.aggregate<any>(pipeline);
    const totalDocumentCount = results[0]?.totalCount[0]?.count || 0; // Extract total count
    const materialLengthAdjustments = results[0]?.paginatedResults || [];
    const totalPages = Math.ceil(totalDocumentCount / pageSize);

    const paginationResponse: SearchResult<IMaterialLengthAdjustment> = {
      totalResults: totalDocumentCount,
      totalPages,
      currentPageIndex: (query && query.length) ? 0 : pageNumber,
      results: materialLengthAdjustments,
      pageSize,
    }

    response.json(paginationResponse);
  } catch (error) {
    console.error('Error during material-length-adjustment search:', error);
    response.status(500).send(error.message);
  }
}) as SearchHandler);

router.get('/:mongooseId', (async (request: Request, response: Response) => {
  try {
    const materialLengthAdjustment = await MaterialLengthAdjustmentModel.findById(request.params.mongooseId);

    response.json(materialLengthAdjustment);
  } catch (error) {
    console.error('Error searching for materialLengthAdjustment: ', error);
    response.status(SERVER_ERROR).send(error.message);
  }
}) as RequestHandler);

router.patch('/:mongooseId', (async (request: Request, response: Response) => {
  try {
    const updatedMaterialLengthAdjustment = await MaterialLengthAdjustmentModel.findOneAndUpdate(
      { _id: request.params.mongooseId },
      { $set: request.body },
      { runValidators: true, new: true }
    ).exec();

    response.json(updatedMaterialLengthAdjustment);
  } catch (error) {
    console.error('Failed to update materialLengthAdjustment: ', error);
    response.status(SERVER_ERROR).send(error.message);
  }
}) as RequestHandler);

router.delete('/:mongooseId', (async (request: Request, response: Response) => {
  try {
    const deletedMaterialLengthAdjustment = await MaterialLengthAdjustmentModel.deleteById(request.params.mongooseId, request.user._id);

    response.status(SUCCESS).json(deletedMaterialLengthAdjustment);
  } catch (error) {
    console.error('Failed to delete materialLengthAdjustment: ', error);
    response.status(SERVER_ERROR).send(error.message);
  }
}) as RequestHandler);

export default router;