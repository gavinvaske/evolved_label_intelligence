import { Router, Request, Response } from 'express';
const router = Router();
import { UserModel } from '../models/user.ts';
import { hasAnyRole, verifyBearerToken } from '../middleware/authorize.ts';
import { upload } from '../middleware/upload.ts';
import fs from 'fs';
import { BAD_REQUEST, SERVER_ERROR, SUCCESS } from '../enums/httpStatusCodes.ts';
import { SearchQuery, SearchResult } from '@shared/types/http.ts';
import { IUser } from '@shared/types/models.ts';
import { DEFAULT_SORT_OPTIONS } from '../constants/mongoose.ts';
import { SortOption } from '@shared/types/mongoose.ts';
import { getSortOption } from '../services/mongooseService.ts';
import { AVAILABLE_AUTH_ROLES } from '../enums/authRolesEnum.ts';

function deleteFileFromFileSystem(path) {
  fs.unlinkSync(path);
}

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
          { email: { $regex: query, $options: 'i' } },
          { firstName: { $regex: query, $options: 'i' } },
          { lastName: { $regex: query, $options: 'i' } },
          { jobRole: { $regex: query, $options: 'i' } },
          { phoneNumber: { $regex: query, $options: 'i' } },
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

    const results = await UserModel.aggregate<any>(pipeline);
    const totalDocumentCount = results[0]?.totalCount[0]?.count || 0; // Extract total count
    const materialOrders = results[0]?.paginatedResults || [];
    const totalPages = Math.ceil(totalDocumentCount / pageSize);

    const paginationResponse: SearchResult<IUser> = {
      totalResults: totalDocumentCount,
      totalPages,
      currentPageIndex: (query && query.length) ? 0 : pageNumber,
      results: materialOrders,
      pageSize,
    }

    return response.json(paginationResponse)
  } catch (error) {
    console.error('Failed to search for users: ', error);
    return response.status(SERVER_ERROR).send(error.message);
  }
})

router.patch('/me', verifyBearerToken, async (request: Request, response: Response) => {
  try {
    if (!request.user._id) throw new Error('User not logged in');

    const newUserValues = {
      email: request.body.email || undefined,
      firstName: request.body.firstName || undefined,
      lastName: request.body.lastName || undefined,
      jobRole: request.body.jobRole || undefined,
      birthDate: request.body.birthDate || '',
      phoneNumber: request.body.phoneNumber || undefined
    }

    await UserModel.findOneAndUpdate(
      { _id: request.user._id },
      { $set: newUserValues },
      { runValidators: true }
    );

    return response.sendStatus(SUCCESS);
  } catch (error) {
    console.error('Error updating user: ', error);
    return response.status(SERVER_ERROR).send(error.message)
  }
});

router.get('/', verifyBearerToken, async (_, response: Response) => {
  try {
    const users = await UserModel.find().exec();

    return response.json(users);
  } catch (error) {
    console.error('Error fetching users: ', error);

    return response
      .status(SERVER_ERROR)
      .send(error.message);
  }
});

router.post('/me/profile-picture', verifyBearerToken, upload.single('image'), async (request: Request, response: Response) => {
  const maxImageSizeInBytes = 800000;
  let imageFilePath;

  try {
    if (!request.file) {
      return response.sendStatus(SUCCESS);
    }

    imageFilePath = request.file.path;
    const base64EncodedImage = fs.readFileSync(imageFilePath);

    if (request.file.size >= maxImageSizeInBytes) {
      return response.status(BAD_REQUEST).send(`File size is too big! Please use an image that is ${(maxImageSizeInBytes / 1000).toFixed(0)} KB or less`)
    }

    const user = await UserModel.findById(request.user._id);

    if (!user) throw new Error('User not found')

    user.profilePicture = { /* TODO @Gavin: remove this from the request? */
      data: base64EncodedImage,
      contentType: request.file.mimetype
    };

    await user.save();

    return response.sendStatus(SUCCESS);
  } catch (error) {
    console.error('Failed to upload profile picture:', error)

    return response.status(SERVER_ERROR).send(error.message)
  } finally {
    deleteFileFromFileSystem(imageFilePath);
  }
});

router.put('/:mongooseId/auth-roles', hasAnyRole(['SUPER_ADMIN']), async (request: Request, response: Response) => {
  const { mongooseId } = request.params;

  if (!mongooseId) return response.sendStatus(BAD_REQUEST)
  try {
    const uniqueAuthRoles = [...new Set(request.body.authRoles as string[] | undefined)];
    uniqueAuthRoles.sort()

    if (!uniqueAuthRoles.every((authRole) => AVAILABLE_AUTH_ROLES.includes(authRole))) {
      return response.status(BAD_REQUEST).send('Invalid auth roles provided');
    }

    await UserModel.findOneAndUpdate(
      { _id: mongooseId },
      { authRoles: uniqueAuthRoles }
    );
    return response.sendStatus(SUCCESS)
  } catch (error) {
    return response.status(SERVER_ERROR).send(error.message)
  }

})

export default router;