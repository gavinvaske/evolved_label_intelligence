import { Router, Request, Response, RequestHandler } from 'express';
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
import { SearchHandler } from '@api/types/express.ts';

const router = Router();

function deleteFileFromFileSystem(path) {
  fs.unlinkSync(path);
}

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

    response.json(paginationResponse);
  } catch (error) {
    console.error('Failed to search for users: ', error);
    response.status(SERVER_ERROR).send(error.message);
  }
}) as SearchHandler);

router.patch('/me', verifyBearerToken, (async (request: Request, response: Response) => {
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

    response.sendStatus(SUCCESS);
  } catch (error) {
    console.error('Error updating user: ', error);
    response.status(SERVER_ERROR).send(error.message)
  }
}) as RequestHandler);

router.get('/', verifyBearerToken, (async (_, response: Response) => {
  try {
    const users = await UserModel.find().exec();

    response.json(users);
  } catch (error) {
    console.error('Error fetching users: ', error);
    response.status(SERVER_ERROR).send(error.message);
  }
}) as RequestHandler);

router.post('/me/profile-picture', verifyBearerToken, upload.single('image'), (async (request: Request, response: Response) => {
  const maxImageSizeInBytes = 800000;
  let imageFilePath;

  try {
    if (!request.file) {
      response.sendStatus(SUCCESS);
      return;
    }

    imageFilePath = request.file.path;
    const base64EncodedImage = fs.readFileSync(imageFilePath);

    if (request.file.size >= maxImageSizeInBytes) {
      response.status(BAD_REQUEST).send(`File size is too big! Please use an image that is ${(maxImageSizeInBytes / 1000).toFixed(0)} KB or less`)
      return;
    }

    const user = await UserModel.findById(request.user._id);

    if (!user) throw new Error('User not found')

    user.profilePicture = { /* TODO @Gavin: remove this from the request? */
      data: base64EncodedImage,
      contentType: request.file.mimetype
    };

    await user.save();

    response.sendStatus(SUCCESS);
  } catch (error) {
    console.error('Failed to upload profile picture:', error)

    response.status(SERVER_ERROR).send(error.message)
  } finally {
    deleteFileFromFileSystem(imageFilePath);
  }
}) as RequestHandler);

router.put('/:mongooseId/auth-roles', hasAnyRole(['SUPER_ADMIN']), (async (request: Request, response: Response) => {
  const { mongooseId } = request.params;

  if (!mongooseId) {
    response.sendStatus(BAD_REQUEST);
    return;
  }

  try {
    const uniqueAuthRoles = [...new Set(request.body.authRoles as string[] | undefined)];
    uniqueAuthRoles.sort()

    if (!uniqueAuthRoles.every((authRole) => AVAILABLE_AUTH_ROLES.includes(authRole))) {
      response.status(BAD_REQUEST).send('Invalid auth roles provided');
      return;
    }

    await UserModel.findOneAndUpdate(
      { _id: mongooseId },
      { authRoles: uniqueAuthRoles }
    );
    response.sendStatus(SUCCESS)
  } catch (error) {
    response.status(SERVER_ERROR).send(error.message)
  }

}) as RequestHandler);

export default router;