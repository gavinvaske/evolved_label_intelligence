import { Router, Request, Response } from 'express';
const router = Router();
import { MaterialModel } from '../models/material.ts';
import { verifyBearerToken } from '../middleware/authorize.ts';
import { VendorModel } from '../models/vendor.ts';
import { MaterialCategoryModel } from '../models/materialCategory.ts';

import * as materialInventoryService from '../services/materialInventoryService.ts';
import * as mongooseService from '../services/mongooseService.ts';

const SHOW_ALL_MATERIALS_ENDPOINT = '/materials';
import { BAD_REQUEST, SERVER_ERROR, SUCCESS } from '../enums/httpStatusCodes.ts';
import { SearchQuery, SearchResult } from '@shared/types/http.ts';
import { SortOption } from '@shared/types/mongoose.ts';
import { DEFAULT_SORT_OPTIONS } from '../constants/mongoose.ts';
import { IMaterial } from '@shared/types/models.ts';

router.use(verifyBearerToken);

router.get('/search', async (request: Request<{}, {}, {}, SearchQuery>, response: Response) => {
  try {
    const { query, pageIndex, limit, sortField, sortDirection } = request.query as SearchQuery;

    if (!pageIndex || !limit) return response.status(BAD_REQUEST).send('Invalid page index or limit');
    if (sortDirection?.length && sortDirection !== '1' && sortDirection !== '-1') return response.status(BAD_REQUEST).send('Invalid sort direction');

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

    return response.json(paginationResponse)

  } catch (error) {
    console.error('Failed to search for materials: ', error);
    return response.status(SERVER_ERROR).send(error.message);
  }
})

router.delete('/:mongooseId', async (request, response) => {
  try {
    const deletedMaterial = await MaterialModel.deleteById(request.params.mongooseId, request.user._id)

    return response.status(SUCCESS).json(deletedMaterial);
  } catch (error) {
    console.error('Failed to delete material: ', error);

    return response.status(SERVER_ERROR).send(error.message);
  }
});

router.patch('/:mongooseId', async (request, response) => {
  try {
    const updatedMaterial = await MaterialModel.findOneAndUpdate(
      { _id: request.params.mongooseId },
      { $set: request.body },
      { runValidators: true, new: true }
    ).exec();

    return response.json(updatedMaterial);
  } catch (error) {
    console.error('Failed to update material: ', error);

    response
      .status(SERVER_ERROR)
      .send(error.message);
  }
});

router.get('/form', async (request, response) => {
  const vendors = await VendorModel.find().exec();
  const materialCategories = await MaterialCategoryModel.find().exec();

  return response.render('createMaterial', { vendors, materialCategories });
});

router.post('/', async (request, response) => {
  try {
    const material = await MaterialModel.create(request.body);

    return response.json(material);
  } catch (error) {
    console.log('Error creating material: ', error);
    return response.status(SERVER_ERROR).send(error.message);
  }
});

router.get('/update/:id', async (request, response) => {
  try {
    const material = await MaterialModel.findById(request.params.id);
    const vendors = await VendorModel.find().exec();
    const materialCategories = await MaterialCategoryModel.find().exec();

    return response.render('updateMaterial', {
      material,
      vendors,
      materialCategories
    });
  } catch (error) {
    console.log(error);
    request.flash('errors', [error.message]);

    return response.redirect('back');
  }
});

router.get('/recalculate-inventory', async (_: Request, response: Response) => {
  try {
    await materialInventoryService.populateMaterialInventories();

    return response.sendStatus(SUCCESS)
  } catch (error) {
    console.log('Error populating material inventories.', error);
    return response.status(SERVER_ERROR).send(error.message);
  }
});

router.get('/:mongooseId', async (request, response) => {
  try {
    const material = await MaterialModel.findById(request.params.mongooseId);

    return response.json(material);
  } catch (error) {
    console.error('Error searching for material: ', error);

    return response
      .status(SERVER_ERROR)
      .send(error.message);
  }
});

router.get('/', async (_: Request, response: Response) => {
  try {
    const materials = await MaterialModel.find()
      .populate('vendor')
      .populate('materialCategory')
      .populate('adhesiveCategory')
      .populate('linerType')
      .exec();

    return response.json(materials);
  } catch (error) {
    console.error('Error searching for materials: ', error);

    return response
      .status(SERVER_ERROR)
      .send(error.message);
  }
});

export default router;