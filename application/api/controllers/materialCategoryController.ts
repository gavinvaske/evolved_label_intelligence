import { Router, Request, Response } from 'express';
const router = Router();
import { verifyBearerToken } from '../middleware/authorize.ts';
import { MaterialCategoryModel } from '../models/materialCategory.ts';
import { BAD_REQUEST, CREATED_SUCCESSFULLY, SERVER_ERROR, SUCCESS } from '../enums/httpStatusCodes.ts';
import { SearchQuery, SearchResult } from '@shared/types/http.ts';
import { SortOption } from '@shared/types/mongoose.ts';
import { getSortOption } from '../services/mongooseService.ts';
import { DEFAULT_SORT_OPTIONS } from '../constants/mongoose.ts';
import { IMaterialCategory } from '@shared/types/models.ts';

router.use(verifyBearerToken);

const SHOW_ALL_MATERIAL_CATEGORIES_ENDPOINT = '/material-categories';

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

    const results = await MaterialCategoryModel.aggregate<any>(pipeline);
    const totalDocumentCount = results[0]?.totalCount[0]?.count || 0; // Extract total count
    const materialCategories = results[0]?.paginatedResults || [];
    const totalPages = Math.ceil(totalDocumentCount / pageSize);

    const paginationResponse: SearchResult<IMaterialCategory> = {
      totalResults: totalDocumentCount,
      totalPages,
      currentPageIndex: (query && query.length) ? 0 : pageNumber,
      results: materialCategories,
      pageSize,
    }

    return response.json(paginationResponse)

  } catch (error) {
    console.error('Error during materialCategories search:', error);
    return response.status(SERVER_ERROR).send(error);
  }
});

router.get('/form', (_, response) => {
  response.render('createMaterialCategory.ejs');
});

router.get('/form/:id', async (request, response) => {
  try {
    const materialCategory = await MaterialCategoryModel.findById(request.params.id);

    return response.render('updateMaterialCategory', { materialCategory });
  } catch (error) {
    console.log(error);
    request.flash('errors', [error.message]);

    return response.status(SERVER_ERROR).redirect('back');
  }
});

router.post('/', async (request, response) => {
  try {
      const materialCategory = await MaterialCategoryModel.create(request.body);

      return response
          .status(CREATED_SUCCESSFULLY)
          .json(materialCategory);
  } catch (error) {
      console.error('Failed to create materialCategory: ', error);
      return response
          .status(SERVER_ERROR)
          .send(error.message);
  }
});

router.post('/form/:id', async (request, response) => {
  try {
    await MaterialCategoryModel.findByIdAndUpdate(request.params.id, request.body, { runValidators: true }).exec();

    return response.redirect(SHOW_ALL_MATERIAL_CATEGORIES_ENDPOINT);
  } catch (error) {
    console.log(error);
    request.flash('errors', [error.message]);

    return response.status(SERVER_ERROR).redirect('back');
  }
});

router.post('/form', async (request, response) => {
  try {
    await MaterialCategoryModel.create(request.body);
  } catch (error) {
    console.log(error);
    request.flash('errors', ['Unable to save the Material Category, the following error(s) occurred:', error.message]);
    return;
  }
  request.flash('alerts', ['Material Category created successfully']);

  return response.redirect(SHOW_ALL_MATERIAL_CATEGORIES_ENDPOINT);
});

router.delete('/:mongooseId', async (request, response) => {
  const { mongooseId } = request.params;

  try {
    await MaterialCategoryModel.findByIdAndDelete(mongooseId);

    return response.sendStatus(SUCCESS);
  } catch (error) {
    console.log(error);
    return response.status(SERVER_ERROR).send(error.message);
  }
});

router.get('/:mongooseId', async (request, response) => {
  try {
    const materialCategory = await MaterialCategoryModel.findById(request.params.mongooseId);

    return response.json(materialCategory);
  } catch (error) {
    console.error('Error searching for materialCategory: ', error);

    return response
      .status(SERVER_ERROR)
      .send(error.message);
  }
});

router.patch('/:mongooseId', async (request, response) => {
  try {
      const updatedMaterialCategory = await MaterialCategoryModel.findOneAndUpdate(
          { _id: request.params.mongooseId }, 
          { $set: request.body }, 
          { runValidators: true, new: true }
      ).exec();

      return response.json(updatedMaterialCategory);
  } catch (error) {
      console.error('Failed to update materialCategory: ', error);

      response
          .status(SERVER_ERROR)
          .send(error.message);
  }
});

export default router;