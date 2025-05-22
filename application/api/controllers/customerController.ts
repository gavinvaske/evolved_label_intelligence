import { Router, Request, Response } from 'express';
const router = Router();
import { SERVER_ERROR, CREATED_SUCCESSFULLY, SUCCESS, BAD_REQUEST } from '../enums/httpStatusCodes.ts';
import { verifyBearerToken } from '../middleware/authorize.ts';
import { CustomerModel } from '../models/customer.ts';
import { SearchQuery, SearchResult } from '@shared/types/http.ts';
import { getSortOption } from '../services/mongooseService.ts';
import { SortOption } from '@shared/types/mongoose.ts';
import { DEFAULT_SORT_OPTIONS } from '../constants/mongoose.ts';
import { ICreditTerm, ICustomer } from '@shared/types/models.ts';

router.use(verifyBearerToken);

router.get('/search', async (request: Request<{}, {}, {}, SearchQuery>, response: Response) => {
  try {
    const { query, pageIndex, limit, sortField, sortDirection } = request.query as SearchQuery;

    if (!pageIndex || !limit) return response.status(BAD_REQUEST).send('Invalid page index or limit');
    if (sortDirection?.length && sortDirection !== '1' && sortDirection !== '-1') return response.status(BAD_REQUEST).send('Invalid sort direction');

    const pageNumber = parseInt(pageIndex, 10);
    const pageSize = parseInt(limit, 10);
    const numDocsToSkip = pageNumber * pageSize;
    const sortOptions: SortOption = getSortOption(sortField, sortDirection);

    const textSearch = query && query.length
      ? {
        $or: [
          { customerId: { $regex: query, $options: 'i' } },
          { name: { $regex: query, $options: 'i' } },
          { notes: { $regex: query, $options: 'i' } }
        ],
      }
      : {};

      const pipeline = [
        {
          $lookup: {
            from: 'creditterms',
            localField: 'creditTerms',
            foreignField: '_id',
            as: 'creditTerms',
          },
        },
        {
          $unwind: {
            path: '$creditterms',
            preserveNullAndEmptyArrays: true, // In case material is not populated
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

    const results = await CustomerModel.aggregate<any>(pipeline);
    const totalDocumentCount = results[0]?.totalCount[0]?.count || 0; // Extract total count
    const customers = results[0]?.paginatedResults || [];
    const totalPages = Math.ceil(totalDocumentCount / pageSize);

    const paginationResponse: SearchResult<ICustomer> = {
      totalResults: totalDocumentCount,
      totalPages,
      currentPageIndex: (query && query.length) ? 0 : pageNumber,
      results: customers,
      pageSize,
    }

    return response.json(paginationResponse)

  } catch (error) {
    console.error('Failed to search for customers: ', error);
    return response.status(SERVER_ERROR).send(error.message);
  }
})

router.get('/', async (_, response) => {
  try {
    const customers = await CustomerModel.find().exec();

    return response.json(customers);
  } catch (error) {
    console.error('Error fetching customers: ', error.message);

    return response.status(SERVER_ERROR).send(error.message);
  }
});

router.delete('/:mongooseId', async (request, response) => {
  try {
    const customer = await CustomerModel.deleteById(request.params.mongooseId, request.user._id)

    return response.status(SUCCESS).json(customer);
  } catch (error) {
    console.error('Failed to delete customer: ', error.message);

    return response.status(SERVER_ERROR).send(error.message);
  }
});

router.post('/', async (request, response) => {
  try {
    const customer = await CustomerModel.create(request.body);
    return response.status(CREATED_SUCCESSFULLY).json(customer);
  } catch (error) {
    console.log('Error creating customer: ', error.message);
    return response.status(SERVER_ERROR).send(error.message);
  }
});

router.patch('/:mongooseId', async (request, response) => {
  try {
    const updatedCustomer = await CustomerModel.findOneAndUpdate(
      { _id: request.params.mongooseId },
      { $set: request.body },
      { runValidators: true, new: true }
    ).exec();

    return response.json(updatedCustomer);
  } catch (error) {
    console.error('Failed to update customer: ', error.message);

    response
      .status(SERVER_ERROR)
      .send(error.message);
  }
});

router.get('/:mongooseId', async (request, response) => {
  try {
    const customer = await CustomerModel.findById(request.params.mongooseId)
      .populate<{ creditTerms: ICreditTerm[] }>('creditTerms')
      .orFail(new Error(`Customer not found using ID '${request.params.mongooseId}'`))
      .exec();

    return response.json(customer);
  } catch (error) {
    console.error('Error searching for customer: ', error.message);

    return response.status(SERVER_ERROR).send(error.message);
  }
});

export default router;