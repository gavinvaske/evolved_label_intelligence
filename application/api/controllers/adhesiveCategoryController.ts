import { Router, Request, Response } from 'express';
const router = Router();
import { verifyBearerToken } from '../middleware/authorize.ts';
import { AdhesiveCategoryModel } from '../models/adhesiveCategory.ts';
import { BAD_REQUEST, CREATED_SUCCESSFULLY, SERVER_ERROR, SUCCESS } from '../enums/httpStatusCodes.ts';
import { SearchQuery, SearchResult } from '@shared/types/http.ts';
import { SortOption } from '@shared/types/mongoose.ts';
import { getSortOption } from '../services/mongooseService.ts';
import { DEFAULT_SORT_OPTIONS } from '../constants/mongoose.ts';
import { IAdhesiveCategory } from '@shared/types/models.ts';

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
    const totalDocumentCount = results[0]?.totalCount[0]?.count || 0; // Extract total count
    const adhesiveCategories = results[0]?.paginatedResults || [];
    const totalPages = Math.ceil(totalDocumentCount / pageSize);

    const paginationResponse: SearchResult<IAdhesiveCategory> = {
      totalResults: totalDocumentCount,
      totalPages,
      currentPageIndex: (query && query.length) ? 0 : pageNumber,
      results: adhesiveCategories,
      pageSize,
    }

    return response.json(paginationResponse)
    
  } catch (error) {
    console.error('Error during adhesiveCategory search:', error);
    return response.status(500).send(error);
  }
});

router.delete('/:mongooseId', async (request, response) => {
    try {
        const deletedAdhesiveCategory = await AdhesiveCategoryModel.deleteById(request.params.mongooseId, request.user._id)
    
        return response.status(SUCCESS).json(deletedAdhesiveCategory);
    } catch (error) {
        console.error('Failed to delete adhesiveCategory: ', error);

        return response.status(SERVER_ERROR).send(error.message);
    }
});

router.get('/', async (_, response) => {
    try {
        const adhesiveCategories = await AdhesiveCategoryModel.find().exec();

        return response.json(adhesiveCategories);
    } catch (error) {
        console.error('Error fetching adhesive category: ', error);
        return response
            .status(SERVER_ERROR)
            .send(error.message);
    }
});

router.patch('/:mongooseId', async (request, response) => {
    try {
        const updatedAdhesiveCategory = await AdhesiveCategoryModel.findOneAndUpdate(
            { _id: request.params.mongooseId }, 
            { $set: request.body }, 
            { runValidators: true, new: true }
        ).exec();

        return response.json(updatedAdhesiveCategory);
    } catch (error) {
        console.error('Failed to update adhesiveCategory: ', error);

        response
            .status(SERVER_ERROR)
            .send(error.message);
    }
});

router.post('/', async (request, response) => {
    let savedAdhesiveCategory;

    try {
        savedAdhesiveCategory = await AdhesiveCategoryModel.create(request.body);

        return response
            .status(CREATED_SUCCESSFULLY)
            .send(savedAdhesiveCategory);
    } catch (error) {
        console.error('Error creating adhesive category: ', error);
        return response
            .status(SERVER_ERROR)
            .send(error.message);
    }
});

router.get('/:mongooseId', async (request, response) => {
    try {
        const adhesiveCategory = await AdhesiveCategoryModel.findById(request.params.mongooseId);

        return response.json(adhesiveCategory);
    } catch (error) {
        console.error('Error searching for adhesiveCategory: ', error);

        return response
            .status(SERVER_ERROR)
            .send(error.message);
    }
});


export default router;