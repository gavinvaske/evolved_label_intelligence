import * as userService from '../../application/api/services/userService.ts';
import * as databaseService from '../../application/api/services/databaseService';
import { UserModel } from '../../application/api/models/user.ts';
import jwt from 'jsonwebtoken';
import Chance from 'chance';
import * as testDataGenerator from '../../test-utils/testDataGenerator.ts';

const chance = Chance();

jest.mock('jsonwebtoken');

describe('userService', () => {
    let jwtToken;
    let jwtSecret;
    let userAttributes;

    beforeEach(() => {
        jest.resetAllMocks();
        userAttributes = {
            email: chance.email(),
            password: chance.string({min: 8})
        };
        jwtToken = chance.string();
        jwtSecret = chance.string();
    });

    beforeAll(async () => {
        await databaseService.connectToTestMongoDatabase();
    });

    afterEach(async () => {
        await databaseService.clearDatabase();
    });

    afterAll(async () => {
        await databaseService.closeDatabase();
    });

    it('should save user to database', async () => {
        userAttributes = testDataGenerator.mockData.User();
        const {_id} = await userService.createUser(userAttributes);
    
        const userFromDatabase = await UserModel.findById(_id);
    
        expect(userFromDatabase.email).toBe(userAttributes.email.toUpperCase());
        expect(userFromDatabase.password).toBe(userAttributes.password);
    });


    it('should not login user if jwtToken is undefined', () => {
        jwtToken = undefined;

        const isLoggedIn = userService.isUserLoggedIn(jwtToken, jwtSecret);

        expect(isLoggedIn).toBeFalsy();
    });

    it('should not login user if jwtToken does not verify', () => {
        jwt.verify.mockImplementation(() => {
            throw new Error();
        });

        const isLoggedIn = userService.isUserLoggedIn(jwtToken, jwtSecret);

        expect(isLoggedIn).toBeFalsy();
    });

    it('should login user if jwtToken is valid', () => {
        const user = {};
        jwt.verify.mockReturnValue(user);

        const isLoggedIn = userService.isUserLoggedIn(jwtToken, jwtSecret);

        expect(isLoggedIn).toBeTruthy();
    });

    describe('getUserInitials()', () => {
        it('should return an empty string if user is not defined', () => {
            const undefinedUser = undefined;
            const expectedUserCredentials = '';

            const actualUserCredentials = userService.getUserInitials(undefinedUser);

            expect(actualUserCredentials).toBe(expectedUserCredentials);
        });

        it('should return an empty string if users firstName and lastName is not defined', () => {
            userAttributes.firstName = undefined;
            userAttributes.lastName = null;
            const user = UserModel(userAttributes);
            const expectedUserCredentials = '';

            const actualUserCredentials = userService.getUserInitials(user);

            expect(actualUserCredentials).toBe(expectedUserCredentials);
        });

        it('should return a single character if their fullName is only a single word', () => {
            const firstName = chance.word().toLowerCase();
            userAttributes.firstName = firstName;
            const user = UserModel(userAttributes);
            const expectedUserCredentials = userAttributes.firstName[0].toUpperCase();

            const actualUserCredentials = userService.getUserInitials(user);

            expect(actualUserCredentials).toBe(expectedUserCredentials);
        });

        it('should return the first character of their first and last name', () => {
            const firstName = chance.word().toLowerCase();
            const lastName = chance.word().toLowerCase();
            userAttributes.firstName = firstName;
            userAttributes.lastName = lastName;
            const user = UserModel(userAttributes);
            const expectedUserCredentials = firstName[0].toUpperCase() + lastName[0].toUpperCase();

            const actualUserCredentials = userService.getUserInitials(user);

            expect(actualUserCredentials).toBe(expectedUserCredentials);
        });
    });

    describe('getProfilePictureUrl()', () => {
        it('should return an empty string if user does not exist', () => {
            const undefinedUser = undefined;
            const expectedProfilePictureUrl = '';

            const actualProfilePictureUrl = userService.getProfilePictureUrl(undefinedUser);

            expect(actualProfilePictureUrl).toBe(expectedProfilePictureUrl);
        });

        it('should return an empty string if profilePicture.data is not defined', () => {
            const invalidImageData = undefined;
            userAttributes.profilePicture = {
                contentType: chance.word(),
                data: invalidImageData
            };
            const user = UserModel(userAttributes);
            const expectedProfilePictureUrl = '';

            const actualProfilePictureUrl = userService.getProfilePictureUrl(user);

            expect(actualProfilePictureUrl).toBe(expectedProfilePictureUrl);
        });

        it('should return an empty string if profilePicture.contentType is not defined', () => {
            const invalidContentType = undefined;
            userAttributes.profilePicture = {
                contentType: invalidContentType,
                data: chance.word()
            };
            const user = UserModel(userAttributes);
            const expectedProfilePictureUrl = '';

            const actualProfilePictureUrl = userService.getProfilePictureUrl(user);

            expect(actualProfilePictureUrl).toBe(expectedProfilePictureUrl);
        });

        it('should return a correct url', () => {
            const contentType = chance.word();
            const data = chance.word();

            userAttributes.profilePicture = {
                contentType: contentType,
                data: data
            };
            const user = UserModel(userAttributes);
            const expectedProfilePictureUrl = `data:image/${user.profilePicture.contentType};base64,${user.profilePicture.data.toString('base64')}`;

            const actualProfilePictureUrl = userService.getProfilePictureUrl(user);

            expect(actualProfilePictureUrl).toBe(expectedProfilePictureUrl);
        });
    });
});