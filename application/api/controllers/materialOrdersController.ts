import { Router, Request, Response } from 'express';
const router = Router();
import { MaterialOrderModel } from '../models/materialOrder.ts';
import { IMaterialOrder } from '@shared/types/models.ts';
import { MaterialModel } from '../models/material.ts';
import { VendorModel } from '../models/vendor.ts';
import { verifyBearerToken } from '../middleware/authorize.ts';
import { CREATED_SUCCESSFULLY, BAD_REQUEST, SERVER_ERROR, SUCCESS } from '../enums/httpStatusCodes.ts';
import { SortOption } from '@shared/types/mongoose.ts';
import { SearchQuery, SearchResult } from '@shared/types/http.ts';
import { DEFAULT_SORT_OPTIONS } from '../constants/mongoose.ts';
import { getSortOption } from '../services/mongooseService.ts';

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

    return response.json(paginationResponse)

  } catch (error) {
    console.error('Failed to search for materialOrders: ', error);
    return response.status(SERVER_ERROR).send(error.message);
  }
})

router.delete('/:mongooseId', async (request, response) => {
    try {
        const deletedMaterialOrder = await MaterialOrderModel.deleteById(request.params.mongooseId, request.user._id);

        return response.status(SUCCESS).json(deletedMaterialOrder);
    } catch (error) {
        console.error('Failed to delete materialOrder: ', error);

        return response.status(SERVER_ERROR).send(error.message);
    }
});

router.patch('/:mongooseId', async (request, response) => {
    try {
        const updatedMaterialOrder = await MaterialOrderModel.findOneAndUpdate(
            { _id: request.params.mongooseId }, 
            { $set: request.body }, 
            { runValidators: true, new: true }
        ).exec();

        return response.json(updatedMaterialOrder);
    } catch (error) {
        console.error('Failed to update materialOrder: ', error);

        response
            .status(SERVER_ERROR)
            .send(error.message);
    }
});

router.post('/', async (request, response) => {
    try {
        const savedMaterialOrder = await MaterialOrderModel.create(request.body);

        return response
            .status(CREATED_SUCCESSFULLY)
            .json(savedMaterialOrder);
    } catch (error) {
        console.error('Failed to create materialOrder', error);

        return response.status(BAD_REQUEST).send(error.message);
    }
});

router.post('/batch', async (request: Request, response: Response) => {
  try {
    const { ids } = request.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return response.status(400).json({ error: "Invalid order IDs" });
    }

    const orders = await MaterialOrderModel.find({ _id: { $in: ids } });

    return response.json(orders)
  } catch (error) {
    console.error('Failed to fetch materialOrders by ids', error);

    return response.status(BAD_REQUEST).send(error.message);
  }
})

// @deprecated
router.post('/create', async (request, response) => {
    try {
        await MaterialOrderModel.create(request.body);
    } catch (error) {
        console.log(`The request: ${JSON.stringify(request.body)} resulted in the following errors: ${JSON.stringify(error)}`);
        request.flash('errors', ['Unable to create the Material Order, the following error(s) occurred:', error.message]);
        return response.redirect('back');
    }

    request.flash('alerts', ['Material Order created successfully']);

    return response.redirect('/material-orders');
});

router.get('/update/:id', async (request, response) => {
    try {
        const vendors = await VendorModel.find().exec();
        const materials = await MaterialModel.find().exec();
        const materialOrder = await MaterialOrderModel
            .findById(request.params.id)
            .populate({path: 'author'})
            .populate({path: 'vendor'})
            .populate({path: 'material'})
            .exec();
        const user = request.user;

        return response.render('updateMaterialOrder', {
            vendors,
            materials,
            materialOrder,
            user
        });
    } catch (error) {
        console.log(error);
        request.flash('errors', [error.message]);

        return response.redirect('back');
    }
});

router.get('/:mongooseId', async (request, response) => {
    try {
        const materialOrder = await MaterialOrderModel.findById(request.params.mongooseId);
        
        return response.json(materialOrder);
    } catch (error) {
        console.error('Error searching for materialOrder: ', error);

        return response
            .status(SERVER_ERROR)
            .send(error.message);
    }
});

export default router;