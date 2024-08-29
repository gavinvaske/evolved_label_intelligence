import { Router, Request, Response } from 'express';
const router = Router();
import bcrypt from 'bcryptjs';
import { UserModel } from '../models/user.ts';
import jwt from 'jsonwebtoken';
import { verifyBearerToken } from '../middleware/authorize.ts';
import { sendPasswordResetEmail } from '../services/emailService.ts';
import { upload } from '../middleware/upload.ts';
import fs from 'fs';
import path from 'path';
import { isUserLoggedIn } from '../services/userService.ts';
import { BAD_REQUEST, NOT_FOUND, SERVER_ERROR, SUCCESS } from '../enums/httpStatusCodes.ts';
import { fileURLToPath } from 'url';

const MONGODB_DUPLICATE_KEY_ERROR_CODE = 11000;
const MIN_PASSWORD_LENGTH = 8;
const BCRYPT_SALT_Rounds = 10;
const INVALID_USERNAME_PASSWORD_MESSAGE = 'Invalid username/password combination';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function deleteFileFromFileSystem(path) {
    fs.unlinkSync(path);
}

router.patch('/me', verifyBearerToken, async (request, response) => {
  try {
    if (!request.user._id) throw new Error('User not logged in');

    const newUserValues = {
      username: request.body.username || undefined,
      fullName: request.body.fullName || undefined,
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
  } catch(error) {
    console.error('Error updating user: ', error);
    return response.status(SERVER_ERROR).send(error.message)
  }
});

router.get('/', verifyBearerToken, async (_, response) => {
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

router.get('/logged-in-user-details', verifyBearerToken, async (request, response) => {
    const user = await UserModel.findById(request.user._id, 'email username fullName authRoles jobRole');

    return response.json(user);
});

router.get('/me/profile-picture', verifyBearerToken, async (request, response) => {
  try {
    const user = await UserModel.findById(request.user._id, 'profilePicture').lean();

    if (!user) throw new Error('User not found by ID')

    if (!user.profilePicture) return response.send('');

    const { contentType, data } = user.profilePicture

    if (!contentType || !data) return response.send('');

    const imageUrl = `data:image/${contentType};base64,${data.toString('base64')}`

    return response.send(imageUrl)
  } catch (error) {
    console.error('failed to fetch profile picture: ', error)
    return response.status(NOT_FOUND).send(error.message);
  }
});

router.delete('/me/profile-picture', verifyBearerToken, async (request: Request, response: Response) => {
  try {
    const user = await UserModel.findById(request.user._id);

    if (!user) throw new Error('User not found');

    user.profilePicture = null;

    await user.save();

    return response.sendStatus(SUCCESS);
  } catch(error) {
    console.error('Failed to delete profile picture', error)
    return response.sendStatus(NOT_FOUND);
  }
})

router.post('/me/profile-picture', verifyBearerToken, upload.single('image'), async (request, response) => {
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

        return response.sendStatus(SERVER_ERROR)
    } finally {
        deleteFileFromFileSystem(imageFilePath);
    }
});

router.get('/forgot-password', (request, response) => {
    response.render('forgotPassword');
});

router.post('/forgot-password', async (request, response) => {
    const {email} = request.body;

    const user = await UserModel.findOne({email}).lean();

    try {
      if (user) {
        const secret = process.env.JWT_SECRET + user.password;
        const payload = {
            email: user.email,
            id: user._id
        };
        const token = jwt.sign(payload, secret, {expiresIn: '15m'});
        const link = `${process.env.BASE_URL}/users/reset-password/${user._id}/${token}`;

        await sendPasswordResetEmail(email, link);
      }
    } catch(error) {
      console.error('Error in POST /forgot-password: ', error)
      return response.sendStatus(500)
    }

    return response.sendStatus(200);
});

router.get('/reset-password/:id/:token', async (request, response) => {
    const { id, token } = request.params;

    const user = await UserModel.findById(id);

    if (id !== user.id) {
        request.flash('errors', ['Invalid user ID']);
        return response.redirect('back');
    }

    const secret = process.env.JWT_SECRET + user.password;

    try {
        jwt.verify(token, secret);
        response.render('resetPassword', {
            email: user.email
        });
    } catch (error) {
        console.log(error);
        request.flash('errors', ['error occurred while attempting to verify your account, please try again.']);
        response.redirect('back');
    }
});

router.post('/reset-password/:id/:token', async (request, response) => {
    const {id, token} = request.params;
    const {password, repeatPassword} = request.body;

    const user = await UserModel.findById(id);

    if (id !== user.id) {
        request.flash('errors', ['Invalid user ID']);
        return response.redirect('back');
    }

    const secret = process.env.JWT_SECRET + user.password;

    try {
        jwt.verify(token, secret);

        if (password !== repeatPassword) {
            request.flash('errors', ['passwords do not match']);
            
            return response.redirect('back');
        }

        if (password.length < MIN_PASSWORD_LENGTH) {
            request.flash('errors', [`password must be at least ${MIN_PASSWORD_LENGTH} characters`]);
            
            return response.redirect('back');
        }

        const encryptedPassword = await bcrypt.hash(password, BCRYPT_SALT_Rounds);

        await UserModel.updateOne({
            _id: user.id, 
        }, {
            $set: {password: encryptedPassword}
        });
    
        response.clearCookie('jwtToken');
    
        request.flash('alerts', ['Password change was successful, please login']);
    
        return response.redirect('/users/login');
    } catch (error) {
        console.log(error);
        request.flash('errors', ['The URL you requested is no longer valid, please try again.']);
        response.redirect('back');
    }
});

router.get('/logout', verifyBearerToken, (request, response) => {
    response.clearCookie('jwtToken');

    return response.redirect('/');
});

router.get('/profile', verifyBearerToken, async (request, response) => {
    const user = await UserModel.findById(request.user.id);

    delete user.password;
    delete user.profilePicture;

    response.render('profile', {
        user
    });
});

router.get('/change-password', verifyBearerToken, (request, response) => {
    response.render('changePassword');
});

router.post('/change-password', verifyBearerToken, async (request, response) => {
    const {newPassword, repeatPassword} = request.body;

    if (newPassword !== repeatPassword) {
        request.flash('errors', ['passwords do not match']);
        
        return response.redirect('back');
    }

    if (newPassword.length < MIN_PASSWORD_LENGTH) {
        request.flash('errors', [`password must be at least ${MIN_PASSWORD_LENGTH} characters`]);
        
        return response.redirect('back');
    }

    const encryptedPassword = await bcrypt.hash(newPassword, BCRYPT_SALT_Rounds);
    
    const user = request.user;

    await UserModel.updateOne({
        _id: user.id, 
    }, {
        $set: { password: encryptedPassword }
    });

    response.clearCookie('jwtToken');

    request.flash('alerts', ['Password change was successful, please login']);

    return response.redirect('/users/login');
});

router.get('/login', (request, response) => {
    response.render('login');
});

// @deprecated (8-9-2024): Use /login from authController
router.post('/login', async (request, response) => {
    const {email, password} = request.body;

    const user = await UserModel.findOne({email}).lean();

    if (!user) {
        request.flash('errors', [INVALID_USERNAME_PASSWORD_MESSAGE]);

        return response.redirect('back');
    }

    const isPasswordCorrectForUser = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrectForUser) {
        request.flash('errors', [INVALID_USERNAME_PASSWORD_MESSAGE]);
        
        return response.redirect('back');
    }

    const jwtToken = jwt.sign({
        id: user._id,
        email: user.email,
        authRoles: user.authRoles || []
    }, process.env.JWT_SECRET, { expiresIn: '13h'});

    response.cookie('jwtToken', jwtToken, {
        httpOnly: true
    });

    return response.redirect('/users/profile');
});

router.get('/register', (request, response) => {
    if (isUserLoggedIn(request.cookies.jwtToken, process.env.JWT_SECRET)) {
        return response.redirect('/users/profile');
    }

    response.render('register');
});

router.post('/register', async (request, response) => {
    const {email, password: plainTextPassword, repeatPassword} = request.body;

    if (plainTextPassword !== repeatPassword) {
        request.flash('errors', ['passwords do not match']);
        
        return response.redirect('back');
    }

    if (plainTextPassword.length < MIN_PASSWORD_LENGTH) {
        request.flash('errors', [`password must be at least ${MIN_PASSWORD_LENGTH} characters`]);
        
        return response.redirect('back');
    }

    const encryptedPassword = await bcrypt.hash(plainTextPassword, BCRYPT_SALT_Rounds);

    try {
        await UserModel.create({
            email,
            password: encryptedPassword
        });
    } catch (error) {
        if (error.code === MONGODB_DUPLICATE_KEY_ERROR_CODE) {
            request.flash('errors', ['Username already exists']);
        
            return response.redirect('back');
        }
        console.log('Unknown error occurred while creating user: ', error);
        throw error;
    }

    request.flash('alerts', ['Registration was successful, please login']);

    return response.redirect('/users/login');
});

export default router;