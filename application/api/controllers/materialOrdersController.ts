import { Router, Request, Response, RequestHandler } from 'express';
import { MaterialOrderModel } from '../models/materialOrder.ts';
import { IMaterialOrder } from '@shared/types/models.ts';
import { verifyBearerToken } from '../middleware/authorize.ts';
import { CREATED_SUCCESSFULLY, BAD_REQUEST, SERVER_ERROR, SUCCESS } from '../enums/httpStatusCodes.ts';
import { SortOption } from '@shared/types/mongoose.ts';
import { SearchQuery, SearchResult } from '@shared/types/http.ts';
import { DEFAULT_SORT_OPTIONS } from '../constants/mongoose.ts';
import { getSortOption } from '../services/mongooseService.ts';
import { SearchHandler } from '@api/types/express.ts';

const router = Router();
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
          { notes: { $regex: query, $options: 'i' } },
          { purchaseOrderNumber: { $regex: query, $options: 'i' } },
          { 'material.name': { $regex: query, $options: 'i' } },
          { 'material.materialId': { $regex: query, $options: 'i' } },
          { 'vendor.name': { $regex: query, $options: 'i' } },
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
        $lookup: {
          from: 'vendors',       // The collection for the Material model
          localField: 'vendor',  // Field referencing the Material
          foreignField: '_id',     // Field in Material for matching
          as: 'vendor',
        },
      },
      {
        $unwind: {
          path: '$material',
          preserveNullAndEmptyArrays: true, // In case material is not populated
        },
      },
      {
        $unwind: {
          path: '$vendor',
          preserveNullAndEmptyArrays: true, // In case vendor is not populated
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
                ...Object.fromEntries(Object.keys(MaterialOrderModel.schema.paths).map(key => [key, `$${key}`])),
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

    const results = await MaterialOrderModel.aggregate<any>(pipeline);
    const totalDocumentCount = results[0]?.totalCount[0]?.count || 0; // Extract total count
    const materialOrders = results[0]?.paginatedResults || [];
    const totalPages = Math.ceil(totalDocumentCount / pageSize);

    const paginationResponse: SearchResult<IMaterialOrder> = {
      totalResults: totalDocumentCount,
      totalPages,
      currentPageIndex: (query && query.length) ? 0 : pageNumber,
      results: materialOrders,
      pageSize,
    }

    response.json(paginationResponse);

  } catch (error) {
    console.error('Failed to search for materialOrders: ', error);
    response.status(SERVER_ERROR).send(error.message);
  }
}) as SearchHandler);

router.delete('/:mongooseId', (async (request: Request, response: Response) => {
  try {
    const deletedMaterialOrder = await MaterialOrderModel.deleteById(request.params.mongooseId, request.user._id);

    response.status(SUCCESS).json(deletedMaterialOrder);
  } catch (error) {
    console.error('Failed to delete materialOrder: ', error);
    response.status(SERVER_ERROR).send(error.message);
  }
}) as RequestHandler);

router.patch('/:mongooseId', (async (request: Request, response: Response) => {
  try {
    const updatedMaterialOrder = await MaterialOrderModel.findOneAndUpdate(
      { _id: request.params.mongooseId },
      { $set: request.body },
      { runValidators: true, new: true }
    ).exec();

    response.json(updatedMaterialOrder);
  } catch (error) {
    console.error('Failed to update materialOrder: ', error);
    response.status(SERVER_ERROR).send(error.message);
  }
}) as RequestHandler);

router.post('/', (async (request: Request, response: Response) => {
  try {
    const savedMaterialOrder = await MaterialOrderModel.create(request.body);

    response.status(CREATED_SUCCESSFULLY).json(savedMaterialOrder);
  } catch (error) {
    console.error('Failed to create materialOrder', error);
    response.status(BAD_REQUEST).send(error.message);
  }
}) as RequestHandler);

router.post('/batch', (async (request: Request, response: Response) => {
  try {
    const { ids } = request.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      response.status(400).json({ error: "Invalid order IDs" });
      return;
    }

    const orders = await MaterialOrderModel.find({ _id: { $in: ids } });

    response.json(orders);
  } catch (error) {
    console.error('Failed to fetch materialOrders by ids', error);
    response.status(BAD_REQUEST).send(error.message);
  }
}) as RequestHandler);

router.get('/:mongooseId', (async (request: Request, response: Response) => {
  try {
    const materialOrder = await MaterialOrderModel.findById(request.params.mongooseId);

    response.json(materialOrder);
  } catch (error) {
    console.error('Error searching for materialOrder: ', error);
    response.status(SERVER_ERROR).send(error.message);
  }
}) as RequestHandler);

export default router;