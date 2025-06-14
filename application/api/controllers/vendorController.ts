import { Router, Request, RequestHandler, Response } from 'express';
import { VendorModel } from '../models/vendor.ts';
import { verifyBearerToken } from '../middleware/authorize.ts';
import { BAD_REQUEST, CREATED_SUCCESSFULLY, SUCCESS } from '../enums/httpStatusCodes.ts';
import { SearchQuery, SearchResult } from '@shared/types/http.ts';
import { SortOption } from '@shared/types/mongoose.ts';
import { getSortOption } from '../services/mongooseService.ts';
import { DEFAULT_SORT_OPTIONS } from '../constants/mongoose.ts';
import { IVendor } from '@shared/types/models.ts';
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
        { name: { $regex: query, $options: 'i' } },
        { notes: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
        { primaryContactName: { $regex: query, $options: 'i' } },
        { primaryContactEmail: { $regex: query, $options: 'i' } },
        { mfgSpecNumber: { $regex: query, $options: 'i' } },
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

  const results = await VendorModel.aggregate<any>(pipeline);
  const totalDocumentCount = results[0]?.totalCount[0]?.count || 0; // Extract total count
  const vendors = results[0]?.paginatedResults || [];
  const totalPages = Math.ceil(totalDocumentCount / pageSize);

  const paginationResponse: SearchResult<IVendor> = {
    totalResults: totalDocumentCount,
    totalPages,
    currentPageIndex: (query && query.length) ? 0 : pageNumber,
    results: vendors,
    pageSize,
  }

  response.json(paginationResponse);
}) as SearchHandler);

router.post('/', (async (request: Request, response: Response) => {
  const vendor = await VendorModel.create(request.body);

  response.status(CREATED_SUCCESSFULLY).json(vendor);
}) as RequestHandler);

router.patch('/:mongooseId', (async (request: Request, response: Response) => {
  const updatedVendor = await VendorModel.findOneAndUpdate(
    { _id: request.params.mongooseId },
    { $set: request.body },
    { runValidators: true, new: true }
  ).exec();

  response.json(updatedVendor);
}) as RequestHandler);

router.delete('/:mongooseId', (async (request: Request, response: Response) => {
  const deletedVendor = await VendorModel.deleteById(request.params.mongooseId, request.user._id).exec();

  response.status(SUCCESS).json(deletedVendor);
}) as RequestHandler);

router.get('/:mongooseId', (async (request: Request, response: Response) => {
  const vendors = await VendorModel.findById(request.params.mongooseId)

  response.json(vendors);
}) as RequestHandler);

export default router;