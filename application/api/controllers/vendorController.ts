import express, { Request, Response } from 'express';
const router = express.Router();
import { VendorModel } from '../models/vendor.ts';
import { verifyBearerToken } from '../middleware/authorize.ts';
import { BAD_REQUEST, CREATED_SUCCESSFULLY, SERVER_ERROR, SUCCESS } from '../enums/httpStatusCodes.ts'; 
import { SearchQuery, SearchResult } from '@shared/types/http.ts';
import { SortOption } from '@shared/types/mongoose.ts';
import { getSortOption } from '../services/mongooseService.ts';
import { DEFAULT_SORT_OPTIONS } from '../constants/mongoose.ts';
import { IVendor } from '@shared/types/models.ts';

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
    const materialLengthAdjustments = results[0]?.paginatedResults || [];
    const totalPages = Math.ceil(totalDocumentCount / pageSize);

    const paginationResponse: SearchResult<IVendor> = {
      totalResults: totalDocumentCount,
      totalPages,
      currentPageIndex: (query && query.length) ? 0 : pageNumber,
      results: materialLengthAdjustments,
      pageSize,
    }

    return response.json(paginationResponse)
    
  } catch (error) {
    console.error('Error during material-length-adjustment search:', error);
    return response.status(500).send(error);
  }
});

router.post('/', async (request, response) => {
    try {
        const vendor = await VendorModel.create(request.body);
        return response.status(CREATED_SUCCESSFULLY).json(vendor);
    } catch (error) {
        console.log('Error creating vendor: ', error.message);
        return response.status(SERVER_ERROR).send(error.message);
    }
});

router.patch('/:mongooseId', async (request, response) => {
    try {
        const updatedVendor = await VendorModel.findOneAndUpdate(
            { _id: request.params.mongooseId }, 
            { $set: request.body }, 
            { runValidators: true, new: true }
        ).exec();

        return response.json(updatedVendor);
    } catch (error) {
        console.error('Failed to update vendor: ', error.message);

        response
            .status(SERVER_ERROR)
            .send(error.message);
    }
});

router.delete('/:mongooseId', async (request, response) => {
    try {
        const deletedAdhesiveCategory = await VendorModel.findByIdAndDelete(request.params.mongooseId).exec();
    
        return response.status(SUCCESS).json(deletedAdhesiveCategory);
    } catch (error) {
        console.error('Failed to delete vendor: ', error);

        return response.status(SERVER_ERROR).send(error.message);
    }
});

router.get('/:mongooseId', async (request, response) => {
  try {
      const vendors = await VendorModel.findById(request.params.mongooseId)
      return response.json(vendors);
  } catch (error) {
      console.error('Error fetching vendors: ', error);
      return response
          .status(SERVER_ERROR)
          .send(error.message);
  }
});

export default router;