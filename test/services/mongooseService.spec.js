import Chance from 'chance';
import * as mongooseService from '../../application/api/services/mongooseService.ts';

const chance = Chance();

function getOneMongooseError(errorType) {
    return {
        [chance.word()]: {
            'name': errorType,
            'message': chance.string(),
            'properties': {
                'message': chance.string(),
                'type': chance.string(),
                'path': chance.word(),
                'value': chance.word()
            },
            'kind': chance.string(),
            'path': chance.word(),
            'value': chance.word()
        }
    };
}

describe('mongooseService test cases', () => {
    describe('parseHumanReadableMessages()', () => {
        let error;

        beforeEach(() => {
            error = {
                'errors': {
                    ...getOneMongooseError('ValidatorError')
                },
                '_message': chance.string(),
                'name': chance.word(),
                'message': chance.string()
            };
        });

        it('should return an unknown error', () => {
            const humanReadableErrorMessages = mongooseService.parseHumanReadableMessages(undefined);
    
            expect(humanReadableErrorMessages.length).toBe(1);
            expect(humanReadableErrorMessages[0]).toBe('Uh oh, an unknown error occurred, please contact the IT department.');
        });
    
        it('should return a human readable error message if validation error', () => {
            const {errors} = error;
            const key = Object.keys(errors)[0];
            const humanReadableErrorMessages = mongooseService.parseHumanReadableMessages(error);
    
            expect(humanReadableErrorMessages.length).toBe(1);
            expect(humanReadableErrorMessages[0]).toBe(errors[key]['message']);
        });
    
        it('should return a human readable error message if NON validation error', () => {
            error.errors = {
                ...getOneMongooseError(chance.word())
            };
            const key = Object.keys(error.errors)[0];
            const {errors} = error;
            const humanReadableErrorMessages = mongooseService.parseHumanReadableMessages(error);
    
            expect(humanReadableErrorMessages.length).toBe(1);
            expect(humanReadableErrorMessages[0]).toBe(`'${errors[key]['name']}': ${errors[key]['message']}`);
        });
    });

    describe('getObjectIds()', () => {
        let objects;

        it('should return an empty array an empty array is passed in', () => {
            objects = [];
            const emptyArray = [];

            const actualObjectIds = mongooseService.getObjectIds(objects);

            expect(actualObjectIds).toEqual(emptyArray);
        });

        it('should return an array of each objects _id attribute', () => {
            const object1 = {_id: chance.string()};
            const object2 = {_id: chance.string()};
            const object3 = {_id: chance.string()};
            objects = [object1, object2, object3];
            const expectedObjectIds = [object1._id, object2._id, object3._id];

            const actualObjectIds = mongooseService.getObjectIds(objects);

            expect(actualObjectIds).toEqual(expectedObjectIds);
        });
    });

    describe('Function: getSortOption()', () => {
        let validSortOption;

        beforeEach(() => {
            validSortOption = chance.word();
        });

        it('should return an empty object when sort option is not defined', () => {
            const sortOption = undefined;
            const expectedSortOption = {};

            const actualSortOption = mongooseService.getSortOption(sortOption);

            expect(actualSortOption).toEqual(expectedSortOption);
        });

        it('should return an empty object when sort direction is not defined', () => {
            const sortOption = validSortOption;
            const sortDirection = undefined;
            const expectedSortOption = {};

            const actualSortOption = mongooseService.getSortOption(sortOption, sortDirection);

            expect(actualSortOption).toEqual(expectedSortOption);
        });

        it('should convert the sort direction from a string to the integer 1 or -1', () => {
            const sortOption = validSortOption;
            const sortDirection = String(chance.pickone([1, -1]));
            const expectedSortOption = { [sortOption]: parseInt(sortDirection) };
         
            const actualSortOption = mongooseService.getSortOption(sortOption, sortDirection);
         
            expect(actualSortOption).toEqual(expectedSortOption);
        });
    });
});