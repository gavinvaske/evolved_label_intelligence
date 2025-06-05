import { Router, Request, Response, RequestHandler } from 'express';
import { MaterialModel } from '../models/material.ts';
import { verifyBearerToken } from '../middleware/authorize.ts';
import * as materialInventoryService from '../services/materialInventoryService.ts';
import * as mongooseService from '../services/mongooseService.ts';

import { BAD_REQUEST, SUCCESS } from '../enums/httpStatusCodes.ts';
import { SearchQuery, SearchResult } from '@shared/types/http.ts';
import { SortOption } from '@shared/types/mongoose.ts';
import { DEFAULT_SORT_OPTIONS } from '../constants/mongoose.ts';
import { IMaterial } from '@shared/types/models.ts';
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
  const sortOptions: SortOption = mongooseService.getSortOption(sortField, sortDirection);

  const textSearch = query && query.length
    ? {
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { materialId: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { 'vendor.name': { $regex: query, $options: 'i' } },
        { 'adhesiveCategory.name': { $regex: query, $options: 'i' } }
      ],
    }
    : {};

  const pipeline = [
    {
      $lookup: {
        from: 'vendors',
        localField: 'vendor',
        foreignField: '_id',
        as: 'vendor',
      },
    },
    {
      $lookup: {
        from: 'materialcategories',
        localField: 'materialCategory',
        foreignField: '_id',
        as: 'materialCategory',
      },
    },
    {
      $lookup: {
        from: 'adhesivecategories',
        localField: 'adhesiveCategory',
        foreignField: '_id',
        as: 'adhesiveCategory',
      },
    },
    {
      $lookup: {
        from: 'linertypes',
        localField: 'linerType',
        foreignField: '_id',
        as: 'linerType',
      },
    },
    {
      $unwind: {
        path: '$vendor',
        preserveNullAndEmptyArrays: true, // In case material is not populated
      },
    },
    {
      $unwind: {
        path: '$materialCategory',
        preserveNullAndEmptyArrays: true, // In case materialCategory is not populated
      },
    },
    {
      $unwind: {
        path: '$adhesiveCategory',
        preserveNullAndEmptyArrays: true, // In case adhesiveCategory is not populated
      },
    },
    {
      $unwind: {
        path: '$linerType',
        preserveNullAndEmptyArrays: true, // In case linerType is not populated
      },
    },
    // Text search
    {
      $match: {
        ...textSearch,
      },
    },
    // Pagination and sorting
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

  const results = await MaterialModel.aggregate<any>(pipeline);
  const totalDocumentCount = results[0]?.totalCount[0]?.count || 0; // Extract total count
  const materials = results[0]?.paginatedResults || [];
  const totalPages = Math.ceil(totalDocumentCount / pageSize);

  const paginationResponse: SearchResult<IMaterial> = {
    totalResults: totalDocumentCount,
    totalPages,
    currentPageIndex: (query && query.length) ? 0 : pageNumber,
    results: materials,
    pageSize,
  }

  response.json(paginationResponse);
}) as SearchHandler);

router.delete('/:mongooseId', (async (request: Request, response: Response) => {
  const deletedMaterial = await MaterialModel.deleteById(request.params.mongooseId, request.user._id)

  response.status(SUCCESS).json(deletedMaterial);
}) as RequestHandler);

router.patch('/:mongooseId', (async (request: Request, response: Response) => {
  const updatedMaterial = await MaterialModel.findOneAndUpdate(
    { _id: request.params.mongooseId },
    { $set: request.body },
    { runValidators: true, new: true }
  ).exec();

  response.json(updatedMaterial);
}) as RequestHandler);

router.post('/', (async (request: Request, response: Response) => {
  const material = await MaterialModel.create(request.body);

  response.json(material);
}) as RequestHandler);

router.get('/recalculate-inventory', (async (_: Request, response: Response) => {
  await materialInventoryService.populateMaterialInventories();

  response.sendStatus(SUCCESS);
}) as RequestHandler);

router.get('/', (async (_: Request, response: Response) => {
  const materials = await MaterialModel.find()
    .populate('vendor')
    .populate('materialCategory')
    .populate('adhesiveCategory')
    .populate('linerType')
    .exec();

  response.json(materials);
}) as RequestHandler);

router.get('/:mongooseId', (async (request: Request, response: Response) => {
  const material = await MaterialModel.findById(request.params.mongooseId);

  response.json(material);
}) as RequestHandler);

export default router;