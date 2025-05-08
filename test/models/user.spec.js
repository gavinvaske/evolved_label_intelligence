import Chance from 'chance';
import { UserModel } from '../../application/api/models/user.ts';
import * as testDataGenerator from '../../test-utils/testDataGenerator.ts';
import { AVAILABLE_AUTH_ROLES } from '../../application/api/enums/authRolesEnum.ts';
import * as databaseService from '../../application/api/services/databaseService';
import mongoose from 'mongoose';

const chance = Chance();
const PASSWORD_MIN_LENGTH = 8;

describe('validation', () => {
    let userAttributes;

    beforeEach(() => {
        userAttributes = testDataGenerator.mockData.User();
    });

    it('should have the correct indexes', async () => {
        const indexMetaData = UserModel.schema.indexes();
        const expectedIndexes = ['email'];

        console.log('indexMetaData: ', indexMetaData);

        const isEveryExpectedIndexActuallyAnIndex = expectedIndexes.every((expectedIndex) => {
            return indexMetaData.some((metaData) => {
                const index = Object.keys(metaData[0])[0];
                if (index === expectedIndex) return true;
            });
        });

        expect(isEveryExpectedIndexActuallyAnIndex).toBe(true);
    });

    it('should succeed when required attributes are defined', () => {
        const user = new UserModel(userAttributes);

        const error = user.validateSync();

        expect(error).toBe(undefined);
    });

    it('should throw an error if unknown attribute is provided', () => {
        const unknownAttribute = chance.string();
        userAttributes[unknownAttribute] = chance.string();

        expect(() => new UserModel(userAttributes)).toThrow();
    });

    describe('non-successful validation', () => {
        it('should not validate incorrectly formatted emails', () => {
            userAttributes.email = chance.string();
            const user = new UserModel(userAttributes);

            const error = user.validateSync();

            expect(error).not.toBe(undefined);
        });

        it('should fail validation if password is too short', () => {
            const shortPasswordLength = PASSWORD_MIN_LENGTH - 1;
            userAttributes.password = chance.string({ max: shortPasswordLength });
            const user = new UserModel(userAttributes);

            const error = user.validateSync();

            expect(error).not.toBe(undefined);
        });
    });

    describe('attribute: firstName', () => {
        it('should trim whitespace', () => {
            const firstName = chance.word();
            userAttributes.firstName = ' ' + firstName + ' ';
            const user = new UserModel(userAttributes);

            const error = user.validateSync();

            expect(error).toBe(undefined);
            expect(user.firstName).toBe(firstName);
        });

        it('should be required', () => {
            delete userAttributes.firstName;
            const user = new UserModel(userAttributes);

            const error = user.validateSync();

            expect(error).not.toBe(undefined);
        });
    });

    describe('attribute: lastName', () => {
        it('should trim whitespace', () => {
            const lastName = chance.word();
            userAttributes.lastName = ' ' + lastName + ' ';
            const user = new UserModel(userAttributes);

            const error = user.validateSync();

            expect(error).toBe(undefined);
            expect(user.lastName).toBe(lastName);
        });

        it('should be required', () => {
            delete userAttributes.lastName;
            const user = new UserModel(userAttributes);

            const error = user.validateSync();

            expect(error).not.toBe(undefined);
        });
    });

    describe('attribute: jobRole', () => {
        it('should trim whitespace', () => {
            const jobRole = chance.word();
            userAttributes.jobRole = ' ' + jobRole + ' ';
            const user = new UserModel(userAttributes);

            const error = user.validateSync();

            expect(error).toBe(undefined);
            expect(user.jobRole).toBe(jobRole);
        });
    });

    describe('attribute: phoneNumber', () => {
        it('should not fail if phoneNumber is valid', () => {
            userAttributes.phoneNumber = chance.phone();
            const user = new UserModel(userAttributes);

            const error = user.validateSync();

            expect(error).toBe(undefined);
        });
        it('should trim whitespace', () => {
            const phoneNumber = chance.phone();
            userAttributes.phoneNumber = ' ' + phoneNumber + ' ';
            const user = new UserModel(userAttributes);

            user.validateSync();

            expect(user.phoneNumber).toBe(phoneNumber);
        });

        it('should fail if phone is invalid', () => {
            const invalidPhoneNumber = chance.word();
            userAttributes.phoneNumber = invalidPhoneNumber;
            const user = new UserModel(userAttributes);

            const error = user.validateSync();

            expect(error).not.toBe(undefined);
        });
    });

    describe('attribute: birthDate', () => {
        it('should not fail if date is valid', () => {
            const birthDate = chance.date({ string: true });
            userAttributes.birthDate = birthDate;
            const user = new UserModel(userAttributes);

            const error = user.validateSync();

            expect(error).toBe(undefined);
        });

        it('should trim whitespace', () => {
            const birthDate = chance.date({ string: true });
            userAttributes.birthDate = '  ' + birthDate + ' ';
            const user = new UserModel(userAttributes);

            user.validateSync();

            expect(new Date(user.birthDate).getTime() === new Date(birthDate).getTime()).toBeTruthy();
        });

        it('should be required', () => {
            delete userAttributes.birthDate;
            const user = new UserModel(userAttributes);

            const error = user.validateSync();

            expect(error).not.toBe(undefined);
        });
    });

    describe('attribute: authRoles', () => {
        it('should exist', () => {
            const user = new UserModel(userAttributes);

            expect(user.authRoles).toBeDefined();
        });

        it('should not fail validation if authRoles are from allow-list', () => {
            userAttributes.authRoles = [chance.pickone(AVAILABLE_AUTH_ROLES), chance.pickone(AVAILABLE_AUTH_ROLES)];
            const user = new UserModel(userAttributes);

            const error = user.validateSync();

            expect(error).toBe(undefined);
        });

        it('should FAIL validation if at least one role is unknown', () => {
            const unknownRole = chance.string();
            const validRole = chance.pickone(AVAILABLE_AUTH_ROLES);
            userAttributes.authRoles = [
                validRole,
                unknownRole,
                validRole
            ];
            const user = new UserModel(userAttributes);

            const error = user.validateSync();

            expect(error).toBeDefined();
        });

        it('should not fail validation if roles is empty', () => {
            userAttributes.authRoles = [];
            const user = new UserModel(userAttributes);

            const error = user.validateSync();

            expect(error).toBe(undefined);
        });

        it('should default to empty list', () => {
            delete userAttributes.authRoles;
            const user = new UserModel(userAttributes);

            const error = user.validateSync();

            expect(error).toBe(undefined);
            expect(user.authRoles).toEqual([]);
        });
    });

    describe('verify database interactions', () => {
        beforeEach(async () => {
            await mongoose.syncIndexes(); // Fixes: https://github.com/gavinvaske/the_recipe_book/issues/370
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

        it('should have a "createdAt" attribute once object is saved', async () => {
            const user = new UserModel(userAttributes);
            let savedUser = await user.save({ validateBeforeSave: false });

            expect(savedUser.createdAt).toBeDefined();
            expect(savedUser.updatedAt).toBeDefined();
        });

        it('should have a unique "email"', async () => {
            const email = chance.email();
            const user1 = new UserModel({
                ...testDataGenerator.mockData.User(),
                email
            });
            const user2 = new UserModel({
                ...testDataGenerator.mockData.User(),
                email
            });

            let errorMessage;
      
            try {
                await user1.save();
                await user2.save();
            } catch (error) {
                errorMessage = error.message;
            }

            expect(errorMessage).toBeDefined();
            expect(errorMessage).toContain('duplicate key');
        });
    });
});