import { Router, Request, Response, response } from 'express';
import { UserModel } from '../models/user.ts';
import { BAD_REQUEST, CREATED_SUCCESSFULLY, FORBIDDEN, NOT_FOUND, SERVER_ERROR, SUCCESS, UNAUTHORIZED } from '../enums/httpStatusCodes.ts';
import { generateRefreshToken, generateAccessToken, TokenPayload, verifyBearerToken } from '../middleware/authorize.ts';
import { MongooseId } from "@shared/types/typeAliases.ts";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sendPasswordResetEmail } from '../services/emailService.ts';
import { User } from '../../react/_types/databasemodels/user.ts';
const router = Router();

const REFRESH_TOKEN_COOKIE_NAME = 'refresh-token'
const MIN_PASSWORD_LENGTH = 8;
const BCRYPT_SALT_ROUNDS = 10;
const MONGODB_DUPLICATE_KEY_ERROR_CODE = 11000;

 router.get('/logout', (_: Request, response: Response) => {
  response.clearCookie(REFRESH_TOKEN_COOKIE_NAME);

  return response.sendStatus(SUCCESS);
})

/* TODO: This type is a duplicate from the UI
    * Investigate various ways to share types between API and frontend (issue #348)
*/
export type UserAuth = {
  accessToken: string,
  authRoles: string[]
}

/* 
  At login, an HTTP only cookie is created which stores a user's refresh-token
  A user is given a plain text "accessToken" which has a short expiration time

  The user can use the access token to make secure requests to the server, but once
  that access token expires. They then need to call this endpoint, which uses the 
  refresh token that was stored in an HTTP only cookie, and if it's valid, and not expired
  as well, it generates a new accessToken that is sent back to the user
*/
router.get('/access-token', (request: Request, response: Response) => {
  const refreshTokenFromSecureCookie = request.cookies[REFRESH_TOKEN_COOKIE_NAME];

  if (!refreshTokenFromSecureCookie) {
    return response.status(FORBIDDEN).json({ error: 'Refresh token missing' });
  }

  try {
    const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;
    const payloadWithExtraStuff: any = jwt.verify(refreshTokenFromSecureCookie, refreshTokenSecret);
    
    const tokenPayload: TokenPayload = {
      email: payloadWithExtraStuff.email,
      _id: payloadWithExtraStuff._id,
      authRoles: payloadWithExtraStuff.authRoles,
    };

    const accessTokenSecret = process.env.JWT_SECRET as string;
    const accessToken = generateAccessToken(tokenPayload, accessTokenSecret);
    const userAuth: UserAuth = {
      accessToken,
      authRoles: payloadWithExtraStuff.authRoles,
    };

    return response.json(userAuth);
  } catch (error) {
    return response.status(FORBIDDEN).json({ error: 'Refresh token expired' });
  }
});

router.post('/login', async (request: Request, response: Response) => {
  const { email, password } = request.body;
  const invalidLoginMessage = 'Invalid email and/or password'

  try {
    const user = await UserModel.findOne({ email }).lean();

    if (!user) {
      return response.status(UNAUTHORIZED).send(invalidLoginMessage);
    }

    const isPasswordCorrectForUser = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrectForUser) {
      return response.status(UNAUTHORIZED).send(invalidLoginMessage);
    }

    const authRoles = user.authRoles || []

    const tokenPayload: TokenPayload = {
      _id: user._id as MongooseId,
      email: user.email as string,
      authRoles: authRoles
    }

    const accessTokenSecret = process.env.JWT_SECRET as string;
    const accessToken = generateAccessToken(tokenPayload, accessTokenSecret);

    const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET as string;
    const refreshToken = generateRefreshToken(tokenPayload, refreshTokenSecret);

    response.cookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
      httpOnly: true
    });

    try {
      /* Store user login date/time */
      await UserModel.updateOne({ _id: user._id }, {
        $set: { lastLoginDateTime: new Date() }
      })
    } catch (error) {
      console.error('Failed to save login info: ', error);
      // Do nothing else: aka allow login to proceed successfully
    }

    return response.status(SUCCESS).json({
      accessToken,
      authRoles: authRoles
    })

  } catch (error) {
    console.error(error);

    return response.status(SERVER_ERROR).send('An error was thrown during login, see logs for more details');
  }
})

router.post('/forgot-password', async (request, response) => {
  const { email } = request.body;

  try {
    /* For security purposes: The line below does nothing except add time complexity to making this request.  */
    await bcrypt.hash('foobar-foobar-foobar', BCRYPT_SALT_ROUNDS);

    const user = await UserModel.findOne({ email }).lean();

    if (!user) {
      throw new Error(`A user was not found with the email provided`)
    }

    const secret = process.env.JWT_SECRET + user.password;
    const payload = {
        email: user.email,
        id: user._id
    };
    const minutesUntilExpiration = 30;
    const token = jwt.sign(payload, secret, { expiresIn: `${minutesUntilExpiration}m` });
    const link = `${process.env.BASE_URL}/react-ui/change-password/${user._id}/${token}`;
    
    await sendPasswordResetEmail(email, link, minutesUntilExpiration);

  } catch(error) {
    console.error(`Password reset request for '${email}' resulted in an error: `, JSON.stringify(error))
    /* Don't return error HTTP status for security purposes. Any/All requests should result in 200 HTTP status */
  }

  return response.sendStatus(200);
});

export const validatePasswordsOrSendErrorResponse = (password: string, repeatPassword: string, response: Response) => {
  if (!password || !repeatPassword) {
    return response.status(BAD_REQUEST).send('Missing password or repeat password')
  }
  if (password !== repeatPassword) {
    return response.status(BAD_REQUEST).send('Passwords do not match')
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return response.status(BAD_REQUEST).send(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`)
  }
}

router.post('/change-password/:mongooseId/:token', async (request: Request, response: Response) => {
  const { mongooseId, token } = request.params;
  const { password, repeatPassword } = request.body;
  
  try {
    validatePasswordsOrSendErrorResponse(password, repeatPassword, response);

    /* For security purposes: The line below does nothing except add time complexity to making this request.  */
    await bcrypt.hash('foobar-foobar-foobar', BCRYPT_SALT_ROUNDS);

    const user: User = await UserModel.findById(mongooseId).lean();
    
    if (!user) {
      throw new Error('A user was not found with the email provided')
    }
    
    const secret = process.env.JWT_SECRET + user.password;

    jwt.verify(token, secret);  /* Throws if not valid */

    const encryptedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

    await UserModel.findOneAndUpdate(
      user._id, 
      { password: encryptedPassword }
    );
  } catch (error) {
    console.warn(`Change password request for mongooseId of '${mongooseId}' resulted in an error: `, error)

    return response.status(FORBIDDEN).send('Unable to change password. Your link may have expired, was incorrectly copied, or something else.')
  }

  return response.sendStatus(SUCCESS);
});

router.post('/register', async (request: Request, response: Response) => {
  const { firstName, lastName, birthDate, email, password: plainTextPassword, repeatPassword } = request.body;
  const genericErrorMessage = 'An error occurred during registration, see logs for more details';

  if (!email) {
    return response.status(BAD_REQUEST).send("Missing 'email' from request")
  }

  try {
    validatePasswordsOrSendErrorResponse(plainTextPassword, repeatPassword, response);

    const encryptedPassword = await bcrypt.hash(plainTextPassword, BCRYPT_SALT_ROUNDS);

    await UserModel.create({
        firstName,
        lastName,
        birthDate,
        email,
        password: encryptedPassword
    });
  } catch (error) {
    if (error.code === MONGODB_DUPLICATE_KEY_ERROR_CODE) {
      return response.status(BAD_REQUEST).send('Email already exists')
    }
    console.error(`Unable to register user with email ${email}: `, error);

    return response.status(SERVER_ERROR).send(genericErrorMessage);
  }

  return response.sendStatus(CREATED_SUCCESSFULLY);
});

router.get('/me', verifyBearerToken, async (request, response) => {
  try {
    const user = await UserModel.findById(request.user._id, 'email firstName lastName authRoles jobRole phoneNumber birthDate profilePicture').lean();

    return response.json(user);
  } catch (error) { 
    console.error(error);
    return response.sendStatus(NOT_FOUND)
  }
});


export default router;