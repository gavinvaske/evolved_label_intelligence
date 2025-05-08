import Chance from 'chance';
import { TicketModel } from '../../application/api/models/newTicket';
import { CustomerModel } from '../../application/api/models/customer.ts';
import { WorkflowStepModel } from '../../application/api/models/WorkflowStep.ts';
import * as departmentsEnum from '../../application/api/enums/departmentsEnum.ts';
import * as databaseService from '../../application/api/services/databaseService';
import mongoose from 'mongoose';

import * as testDataGenerator from '../../test-utils/testDataGenerator.ts';

const chance = Chance();

function createObjectWithValueField(value) {
    return { value };
}

function verifyTimeFieldInSeconds(ticketAttributes, fieldName) {
    let ticket, error;
    
    ticketAttributes[fieldName] = chance.d100();
    ticket = new TicketModel(ticketAttributes);
    // Should be a number
    expect(ticket[fieldName]).toEqual(expect.any(Number));

    ticketAttributes[fieldName] = -1;
    ticket = new TicketModel(ticketAttributes);
    error = ticket.validateSync();
    // should not allow negative numbers
    expect(error).toBeDefined();

    ticketAttributes[fieldName] = 99.99;
    ticket = new TicketModel(ticketAttributes);
    error = ticket.validateSync();
    // should not allow floating point numbers
    expect(error).toBeDefined();

    delete ticketAttributes[fieldName];
    ticket = new TicketModel(ticketAttributes);
    // should defualt to 0
    expect(ticket[fieldName]).toEqual(0);
}

function verifyArrayContainsObjectsWhoseValueAttributeIsAPositiveInteger(ticketAttributes, attributeName) {
    delete ticketAttributes[attributeName];
    let ticket, objectValueField;

    // (1) should have a value field
    ticketAttributes[attributeName] = [ createObjectWithValueField(chance.d100()) ];
    ticket = new TicketModel(ticketAttributes);

    [ objectValueField ] = ticket[attributeName];

    expect(objectValueField.value).toBeDefined();
    expect(objectValueField.value).toBe(ticketAttributes[attributeName][0].value);

    // (2) should default value field to 0 when attribute is given an empty object in its array
    const emptyObject = {};
    ticketAttributes[attributeName] = [ emptyObject ];
    ticket = new TicketModel(ticketAttributes);

    [ objectValueField ] = ticket[attributeName];

    expect(objectValueField.value).toEqual(0);

    // (3) should fail validation if attribute[n].value is not a positive integer
    const negativeNumber = -1;
    const floatingPointNumber = 1.5;
    const invalidValue = chance.pickone([negativeNumber, floatingPointNumber]);
    ticketAttributes[attributeName] = [ createObjectWithValueField(invalidValue) ];
    ticket = new TicketModel(ticketAttributes);

    const error = ticket.validateSync();

    expect(error).toBeDefined();
}

function getRandomValidTicketDepartment() {
    return chance.pickone(Object.keys(departmentsEnum.departmentToStatusesMappingForTicketObjects));
}

function getRandomValidTicketDepartmentStatus(department) {
    const validDepartmentStatusesToChoseFrom = departmentsEnum.departmentToStatusesMappingForTicketObjects[department];

    return validDepartmentStatusesToChoseFrom.length > 0 
        ? chance.pickone(validDepartmentStatusesToChoseFrom) 
        : undefined;
}

describe('Ticket validation', () => {
    let ticketAttributes;

    beforeEach(() => {
        ticketAttributes = {
            customer: new mongoose.Types.ObjectId(),
            shipDate: chance.date(),
            totalStockLength: chance.d100(),
            totalFramesRan: chance.d100(),
            endingImpressions: chance.d100()
        };
    });

    it('should pass validation when all attributes are valid', () => {
        const ticket = new TicketModel(ticketAttributes);
        const error = ticket.validateSync();

        expect(error).toBe(undefined);
    });

    it('should have the correct indexes', async () => {
        const indexMetaData = TicketModel.schema.indexes();
        const expectedIndexes = ['ticketNumber'];

        console.log('indexMetaData: ', indexMetaData);

        const isEveryExpectedIndexActuallyAnIndex = expectedIndexes.every((expectedIndex) => {
            return indexMetaData.some((metaData) => {
                const index = Object.keys(metaData[0])[0];
                if (index === expectedIndex) return true;
            });
        });

        expect(isEveryExpectedIndexActuallyAnIndex).toBe(true);
    });

    describe('attribute: customer', () => {
        it('should be required', () => {
            delete ticketAttributes.customer;
            const ticket = new TicketModel(ticketAttributes);
            
            const error = ticket.validateSync();
            
            expect(error).toBeDefined();
        });

        it('should be a mongoose ObjectId', () => {
            const ticket = new TicketModel(ticketAttributes);

            expect(ticket.customer).toEqual(expect.any(mongoose.Types.ObjectId));
        });
    });

    describe('attribute: ticketNumber', () => {
        it('should be a number', () => {
            ticketAttributes.ticketNumber = chance.d100();
            const ticket = new TicketModel(ticketAttributes);
            
            expect(ticket.ticketNumber).toEqual(expect.any(Number));
        });
    });

    describe('attribute: shipDate', () => {
        it('should be a date', () => {
            ticketAttributes.shipDate = chance.date();
            const ticket = new TicketModel(ticketAttributes);
            
            expect(ticket.shipDate).toEqual(expect.any(Date));
        });

        it('should be required', () => {
            delete ticketAttributes.shipDate;
            const ticket = new TicketModel(ticketAttributes);

            const error = ticket.validateSync();
            
            expect(error).toBeDefined();
        });
    });

    describe('attribute: customerPo', () => {
        it('should be a string', () => {
            ticketAttributes.customerPo = chance.string();
            const ticket = new TicketModel(ticketAttributes);

            expect(ticket.customerPo).toEqual(expect.any(String));
        });

        it('should not be required', () => {
            delete ticketAttributes.customerPo;
            const ticket = new TicketModel(ticketAttributes);
            
            const error = ticket.validateSync();
            
            expect(error).toBeUndefined();
        });
    });

    describe('attribute: startingImpressions', () => {
        it('should be a number', () => {
            ticketAttributes.startingImpressions = chance.d100();
            const ticket = new TicketModel(ticketAttributes);

            expect(ticket.startingImpressions).toEqual(expect.any(Number));
        });

        it('should not be required', () => {
            delete ticketAttributes.startingImpressions;
            const ticket = new TicketModel(ticketAttributes);
            
            const error = ticket.validateSync();
            
            expect(error).toBeUndefined();
        });

        it('should be greater than or equal to 0', () => {
            ticketAttributes.startingImpressions = -1;
            const ticket = new TicketModel(ticketAttributes);
            
            const error = ticket.validateSync();
            
            expect(error).toBeDefined();
        });
    });

    describe('attribute: totalStockLength', () => {
        it('should be a number', () => {
            ticketAttributes.totalStockLength = chance.d100();
            const ticket = new TicketModel(ticketAttributes);
            
            expect(ticket.totalStockLength).toEqual(expect.any(Number));
        });

        it('should be required', () => {
            delete ticketAttributes.totalStockLength;
            const ticket = new TicketModel(ticketAttributes);

            const error = ticket.validateSync();
            
            expect(error).toBeDefined();
        });

        it('should be greater than or equal to 0', () => {
            ticketAttributes.totalStockLength = -1;
            const ticket = new TicketModel(ticketAttributes);
            
            const error = ticket.validateSync();
            
            expect(error).toBeDefined();
        });
    });

    describe('attribute: totalFramesRan', () => {
        it('should be a number', () => {
            ticketAttributes.totalFramesRan = chance.d100();
            const ticket = new TicketModel(ticketAttributes);
            
            expect(ticket.totalFramesRan).toEqual(expect.any(Number));
        });

        it('should be required', () => {
            delete ticketAttributes.totalFramesRan;
            const ticket = new TicketModel(ticketAttributes);
            
            const error = ticket.validateSync();
            
            expect(error).toBeDefined();
        });

        it('should be greater than or equal to 0', () => {
            ticketAttributes.totalFramesRan = -1;
            const ticket = new TicketModel(ticketAttributes);
            
            const error = ticket.validateSync();
            
            expect(error).toBeDefined();
        });
    });

    describe('attribute: endingImpressions', () => {
        it('should be a number', () => {
            ticketAttributes.endingImpressions = chance.d100();
            const ticket = new TicketModel(ticketAttributes);
            
            expect(ticket.endingImpressions).toEqual(expect.any(Number));
        });

        it('should be required', () => {
            delete ticketAttributes.endingImpressions;
            const ticket = new TicketModel(ticketAttributes);
            
            const error = ticket.validateSync();
            
            expect(error).toBeDefined();
        });

        it('should be greater than or equal to 0', () => {
            ticketAttributes.endingImpressions = -1;
            const ticket = new TicketModel(ticketAttributes);
            
            const error = ticket.validateSync();
            
            expect(error).toBeDefined();
        });
    });

    describe('attribute: printingOutsideRollWaste', () => {
        it('should be a number', () => {
            ticketAttributes.printingOutsideRollWaste = chance.d100();
            const ticket = new TicketModel(ticketAttributes);
            
            expect(ticket.printingOutsideRollWaste).toEqual(expect.any(Number));
        });

        it('should not be required', () => {
            delete ticketAttributes.printingOutsideRollWaste;
            const ticket = new TicketModel(ticketAttributes);

            const error = ticket.validateSync();
            
            expect(error).toBeUndefined();
        });

        it('should default to 0', () => {
            delete ticketAttributes.printingOutsideRollWaste;
            const ticket = new TicketModel(ticketAttributes);

            expect(ticket.printingOutsideRollWaste).toEqual(0);
        });

        it('should be greater than or equal to 0', () => {
            ticketAttributes.printingOutsideRollWaste = -1;
            const ticket = new TicketModel(ticketAttributes);
            
            const error = ticket.validateSync();
            
            expect(error).toBeDefined();
        });
    });

    describe('attribute: printingStockDefectWaste', () => {
        it('should be a number', () => {
            ticketAttributes.printingStockDefectWaste = chance.d100();
            const ticket = new TicketModel(ticketAttributes);
            
            expect(ticket.printingStockDefectWaste).toEqual(expect.any(Number));
        });

        it('should not be required', () => {
            delete ticketAttributes.printingStockDefectWaste;
            const ticket = new TicketModel(ticketAttributes);
            
            const error = ticket.validateSync();
            
            expect(error).toBeUndefined();
        });

        it('should default to 0', () => {
            delete ticketAttributes.printingStockDefectWaste;
            const ticket = new TicketModel(ticketAttributes);
            
            expect(ticket.printingStockDefectWaste).toEqual(0);
        });

        it('should be greater than or equal to 0', () => {
            ticketAttributes.printingStockDefectWaste = -1;
            const ticket = new TicketModel(ticketAttributes);
            
            const error = ticket.validateSync();
            
            expect(error).toBeDefined();
        });
    });

    describe('attribute: printingDefectWaste', () => {
        it('should be a number', () => {
            ticketAttributes.printingDefectWaste = chance.d100();
            const ticket = new TicketModel(ticketAttributes);
            
            expect(ticket.printingDefectWaste).toEqual(expect.any(Number));
        });

        it('should not be required', () => {
            delete ticketAttributes.printingDefectWaste;
            const ticket = new TicketModel(ticketAttributes);
            
            const error = ticket.validateSync();
            
            expect(error).toBeUndefined();
        });

        it('should default to 0', () => {
            delete ticketAttributes.printingDefectWaste;
            const ticket = new TicketModel(ticketAttributes);
            
            expect(ticket.printingDefectWaste).toEqual(0);
        });

        it('should be greater than or equal to 0', () => {
            ticketAttributes.printingDefectWaste = -1;
            const ticket = new TicketModel(ticketAttributes);

            const error = ticket.validateSync();

            expect(error).toBeDefined();
        });
    });

    describe('attribute: printingOperatorErrorStockWaste', () => {
        it('should be a number', () => {
            ticketAttributes.printingOperatorErrorStockWaste = chance.d100();
            const ticket = new TicketModel(ticketAttributes);

            expect(ticket.printingOperatorErrorStockWaste).toEqual(expect.any(Number));
        });

        it('should not be required', () => {
            delete ticketAttributes.printingOperatorErrorStockWaste;
            const ticket = new TicketModel(ticketAttributes);

            const error = ticket.validateSync();

            expect(error).toBeUndefined();
        });

        it('should default to 0', () => {
            delete ticketAttributes.printingOperatorErrorStockWaste;
            const ticket = new TicketModel(ticketAttributes);
            
            expect(ticket.printingOperatorErrorStockWaste).toEqual(0);
        });

        it('should be greater than or equal to 0', () => {
            ticketAttributes.printingOperatorErrorStockWaste = -1;
            const ticket = new TicketModel(ticketAttributes);

            const error = ticket.validateSync();
            
            expect(error).toBeDefined();
        });
    });

    describe('attribute: colorCalibrations', () => {
        it('should default to an empty array', () => {
            delete ticketAttributes.colorCalibrations;
            const ticket = new TicketModel(ticketAttributes);

            expect(ticket.colorCalibrations).toEqual([]);
        });

        it('should should be an array of objects which contain a positive integer value field', () => {
            verifyArrayContainsObjectsWhoseValueAttributeIsAPositiveInteger(ticketAttributes, 'colorCalibrations');
        });
    });

    describe('attribute: scalings', () => {
        it('should default to an empty array', () => {
            delete ticketAttributes.scalings;
            const ticket = new TicketModel(ticketAttributes);
            
            expect(ticket.scalings).toEqual([]);
        });

        it('should should be an array of objects which contain a positive integer value field', () => {
            verifyArrayContainsObjectsWhoseValueAttributeIsAPositiveInteger(ticketAttributes, 'scalings');
        });
    });

    describe('attribute: printCleaners', () => {
        it('should default to an empty array', () => {
            delete ticketAttributes.printCleaners;
            const ticket = new TicketModel(ticketAttributes);
            
            expect(ticket.printCleaners).toEqual([]);
        });

        it('should should be an array of objects which contain a positive integer value field', () => {
            verifyArrayContainsObjectsWhoseValueAttributeIsAPositiveInteger(ticketAttributes, 'printCleaners');
        });
    });

    describe('attribute: bcsCleaners', () => {
        it('should be a number', () => {
            ticketAttributes.bcsCleaners = chance.d100();
            const ticket = new TicketModel(ticketAttributes);

            expect(ticket.bcsCleaners).toEqual(expect.any(Number));
        });

        it('should not be required', () => {
            delete ticketAttributes.bcsCleaners;
            const ticket = new TicketModel(ticketAttributes);
            
            const error = ticket.validateSync();

            expect(error).toBeUndefined();
        });

        it('should default to 0', () => {
            delete ticketAttributes.bcsCleaners;
            const ticket = new TicketModel(ticketAttributes);
            
            expect(ticket.bcsCleaners).toEqual(0);
        });

        it('should be greater than or equal to 0', () => {
            ticketAttributes.bcsCleaners = -1;
            const ticket = new TicketModel(ticketAttributes);

            const error = ticket.validateSync();

            expect(error).toBeDefined();
        });

        it('should be a whole number', () => {
            ticketAttributes.bcsCleaners = chance.floating({ min: 0, max: 100 });
            const ticket = new TicketModel(ticketAttributes);

            const error = ticket.validateSync();

            expect(error).toBeDefined();
        });
    });

    describe('attribute: proofRunups', () => {
        it('should default to an empty array', () => {
            delete ticketAttributes.proofRunups;
            const ticket = new TicketModel(ticketAttributes);
            
            expect(ticket.proofRunups).toEqual([]);
        });

        it('should should be an array of objects which contain a positive integer value field', () => {
            verifyArrayContainsObjectsWhoseValueAttributeIsAPositiveInteger(ticketAttributes, 'proofRunups');
        });
    });

    describe('attribute: dieLineFrames', () => {
        it('should be a number', () => {
            ticketAttributes.dieLineFrames = chance.d100();
            const ticket = new TicketModel(ticketAttributes);

            const error = ticket.validateSync();

            expect(error).toBeUndefined();
        });

        it('should not be required', () => {
            delete ticketAttributes.dieLineFrames;
            const ticket = new TicketModel(ticketAttributes);

            const error = ticket.validateSync();
            
            expect(error).toBeUndefined();
        });

        it('should default to 0', () => {
            delete ticketAttributes.dieLineFrames;
            const ticket = new TicketModel(ticketAttributes);
            
            expect(ticket.dieLineFrames).toEqual(0);
        });

        it('should be greater than or equal to 0', () => {
            ticketAttributes.dieLineFrames = -1;
            const ticket = new TicketModel(ticketAttributes);
            
            const error = ticket.validateSync();
            
            expect(error).toBeDefined();
        });

        it('should be a whole number', () => {
            ticketAttributes.dieLineFrames = chance.floating({ min: 0, max: 100 });
            const ticket = new TicketModel(ticketAttributes);
            
            const error = ticket.validateSync();
            
            expect(error).toBeDefined();
        });
    });

    describe('attribute: extraDieCuttingFrames', () => {
        it('should be a number', () => {
            ticketAttributes.extraDieCuttingFrames = chance.d100();
            const ticket = new TicketModel(ticketAttributes);

            expect(ticket.extraDieCuttingFrames).toEqual(expect.any(Number));
        });

        it('should not be required', () => {
            delete ticketAttributes.extraDieCuttingFrames;
            const ticket = new TicketModel(ticketAttributes);

            const error = ticket.validateSync();

            expect(error).toBeUndefined();
        });

        it('should default to 0', () => {
            delete ticketAttributes.extraDieCuttingFrames;
            const ticket = new TicketModel(ticketAttributes);
            
            expect(ticket.extraDieCuttingFrames).toEqual(0);
        });

        it('should be greater than or equal to 0', () => {
            ticketAttributes.extraDieCuttingFrames = -1;
            const ticket = new TicketModel(ticketAttributes);

            const error = ticket.validateSync();

            expect(error).toBeDefined();
        });

        it('should be a whole number', () => {
            ticketAttributes.extraDieCuttingFrames = chance.floating({ min: 0, max: 100 });
            const ticket = new TicketModel(ticketAttributes);
            
            const error = ticket.validateSync();
            
            expect(error).toBeDefined();
        });
    });

    describe('attribute: newMaterialSplices', () => {
        it('should not be required', () => {
            delete ticketAttributes.newMaterialSplices;
            const ticket = new TicketModel(ticketAttributes);
            
            const error = ticket.validateSync();
            
            expect(error).toBeUndefined();
        });

        it('should be a field containing a positive integer representing a number of seconds', () => {
            verifyArrayContainsObjectsWhoseValueAttributeIsAPositiveInteger(ticketAttributes, 'newMaterialSplices');
        });
    });

    describe('attribute: existingMaterialSplices', () => {
        it('should default to an empty array', () => {
            delete ticketAttributes.existingMaterialSplices;
            const ticket = new TicketModel(ticketAttributes);
            
            expect(ticket.existingMaterialSplices).toEqual([]);
        });

        it('should should be an array of objects which contain a positive integer value field', () => {
            verifyArrayContainsObjectsWhoseValueAttributeIsAPositiveInteger(ticketAttributes, 'existingMaterialSplices');
        });
    });

    describe('attribute: materialWrapUps', () => {
        it('should default to an empty array', () => {
            delete ticketAttributes.materialWrapUps;
            const ticket = new TicketModel(ticketAttributes);
            
            expect(ticket.materialWrapUps).toEqual([]);
        });

        it('should should be an array of objects which contain a positive integer value field', () => {
            verifyArrayContainsObjectsWhoseValueAttributeIsAPositiveInteger(ticketAttributes, 'materialWrapUps');
        });
    });

    describe('attribute: webBreaks', () => {
        it('should default to an empty array', () => {
            delete ticketAttributes.webBreaks;
            const ticket = new TicketModel(ticketAttributes);

            expect(ticket.webBreaks).toEqual([]);
        });

        it('should should be an array of objects which contain a positive integer value field', () => {
            verifyArrayContainsObjectsWhoseValueAttributeIsAPositiveInteger(ticketAttributes, 'webBreaks');
        });
    });

    describe('attribute: newInkBuilds', () => {
        it('should default to an empty array', () => {
            delete ticketAttributes.newInkBuilds;
            const ticket = new TicketModel(ticketAttributes);
            
            expect(ticket.newInkBuilds).toEqual([]);
        });

        it('should should be an array of objects which contain a positive integer value field', () => {
            verifyArrayContainsObjectsWhoseValueAttributeIsAPositiveInteger(ticketAttributes, 'newInkBuilds');
        });
    });

    describe('attribute: imagePlacements', () => {
        it('should default to an empty array', () => {
            delete ticketAttributes.imagePlacements;
            const ticket = new TicketModel(ticketAttributes);
            
            expect(ticket.imagePlacements).toEqual([]);
        });

        it('should should be an array of objects which contain a positive integer value field', () => {
            verifyArrayContainsObjectsWhoseValueAttributeIsAPositiveInteger(ticketAttributes, 'imagePlacements');
        });
    });

    describe('attribute: colorSeperations', () => {
        it('should default to an empty array', () => {
            delete ticketAttributes.colorSeperations;
            const ticket = new TicketModel(ticketAttributes);
            
            expect(ticket.colorSeperations).toEqual([]);
        });

        it('should should be an array of objects which contain a positive integer value field', () => {
            verifyArrayContainsObjectsWhoseValueAttributeIsAPositiveInteger(ticketAttributes, 'colorSeperations');
        });
    });

    describe('attribute: trailingEdges', () => {
        it('should default to an empty array', () => {
            delete ticketAttributes.trailingEdges;
            const ticket = new TicketModel(ticketAttributes);
            
            expect(ticket.trailingEdges).toEqual([]);
        });

        it('should should be an array of objects which contain a positive integer value field', () => {
            verifyArrayContainsObjectsWhoseValueAttributeIsAPositiveInteger(ticketAttributes, 'trailingEdges');
        });
    });

    describe('attribute: leadingEdges', () => {
        it('should default to an empty array', () => {
            delete ticketAttributes.leadingEdges;
            const ticket = new TicketModel(ticketAttributes);
            
            expect(ticket.leadingEdges).toEqual([]);
        });

        it('should should be an array of objects which contain a positive integer value field', () => {
            verifyArrayContainsObjectsWhoseValueAttributeIsAPositiveInteger(ticketAttributes, 'leadingEdges');
        });
    });

    describe('attribute: printingJobComments', () => {
        it('should be a string', () => {
            ticketAttributes.printingJobComments = chance.string();
            const ticket = new TicketModel(ticketAttributes);
            
            expect(ticket.printingJobComments).toEqual(expect.any(String));
        });

        it('should not be required', () => {
            delete ticketAttributes.printingJobComments;
            const ticket = new TicketModel(ticketAttributes);
            
            const error = ticket.validateSync();
            
            expect(error).toBeUndefined();
        });

        it('should trim whitespace', () => {
            const jobComments = chance.string();
            ticketAttributes.printingJobComments = ` ${jobComments} `;
            
            const ticket = new TicketModel(ticketAttributes);
            
            expect(ticket.printingJobComments).toEqual(jobComments.trim());
        });
    });

    describe('attribute: jobSetup', () => {
        it('should not be required', () => {
            delete ticketAttributes.jobSetup;
            const ticket = new TicketModel(ticketAttributes);
            
            const error = ticket.validateSync();
            
            expect(error).toBeUndefined();
        });

        it('should have a time and feet fields that are numbers', () => {
            const time = chance.d100();
            const feet = chance.d100();
            ticketAttributes.jobSetup = { time, feet };
            
            const ticket = new TicketModel(ticketAttributes);
            
            expect(ticket.jobSetup.time).toEqual(time);
            expect(ticket.jobSetup.feet).toEqual(feet);
        });

        it('should fail validation if the time field is negative', () => {
            ticketAttributes.jobSetup = { time: -1, feet: chance.d100() };

            const ticket = new TicketModel(ticketAttributes);
            
            const error = ticket.validateSync();

            expect(error).toBeDefined();
        });
    });

    describe('attribute: jobRun', () => {
        it('should not be required', () => {
            delete ticketAttributes.jobRun;
            const ticket = new TicketModel(ticketAttributes);
            
            const error = ticket.validateSync();
            
            expect(error).toBeUndefined();
        });

        it('should have a time and feet fields that are numbers', () => {
            const time = chance.d100();
            const feet = chance.d100();
            ticketAttributes.jobRun = { time, feet };
            const ticket = new TicketModel(ticketAttributes);
            
            expect(ticket.jobRun.time).toEqual(time);
            expect(ticket.jobRun.feet).toEqual(feet);
        });

        it('should fail validation if the time field is negative', () => {
            const time = -1;
            const feet = chance.d100();
            ticketAttributes.jobRun = { time, feet };
            const ticket = new TicketModel(ticketAttributes);
            
            const error = ticket.validateSync();

            expect(error).toBeDefined();
        });

        it('should fail validation if the footage field is negative', () => {
            const time = chance.d100();
            const feet = -1;
            ticketAttributes.jobRun = { time, feet };
            const ticket = new TicketModel(ticketAttributes);

            const error = ticket.validateSync();

            expect(error).toBeDefined();
        });
    });

    describe('attribute: tearDownTime', () => {
        it('should not be required', () => {
            delete ticketAttributes.tearDownTime;
            const ticket = new TicketModel(ticketAttributes);

            const error = ticket.validateSync();

            expect(error).toBeUndefined();
        });

        it('should be a field containing a positive integer representing a number of seconds', () => {
            verifyTimeFieldInSeconds(ticketAttributes, 'tearDownTime');
        });
    });

    describe('attribute: dieCutterDown', () => {
        it('should not be required', () => {
            delete ticketAttributes.dieCutterDown;
            const ticket = new TicketModel(ticketAttributes);
            
            const error = ticket.validateSync();
            
            expect(error).toBeUndefined();
        });

        it('should be an object with a time, reason and footageLost fields', () => {
            const time = chance.d100();
            const reason = chance.string();
            const footageLost = chance.d100();
            ticketAttributes.dieCutterDown = { time, reason, footageLost };
            
            const ticket = new TicketModel(ticketAttributes);
            
            expect(ticket.dieCutterDown.time).toEqual(time);
            expect(ticket.dieCutterDown.reason).toEqual(reason);
            expect(ticket.dieCutterDown.footageLost).toEqual(footageLost);
        });

        it('should have a footageLost field that is a whole number', () => {
            const nonIntegerFootageLost = 1.50;
            ticketAttributes.dieCutterDown = {
                footageLost: nonIntegerFootageLost
            };
            const ticket = new TicketModel(ticketAttributes);
            
            const error = ticket.validateSync();
            
            expect(error).toBeDefined();
        });

        it('should not have a negative value for the footageLost field', () => {
            const negativeFootageLost = -1;
            ticketAttributes.dieCutterDown = {
                footageLost: negativeFootageLost
            };
            const ticket = new TicketModel(ticketAttributes);
            
            const error = ticket.validateSync();
            
            expect(error).toBeDefined();
        });
    });

    describe('attribute: cuttingOutsideRollWaste', () => {
        it('should be a number', () => {
            ticketAttributes.cuttingOutsideRollWaste = chance.d100();
            const ticket = new TicketModel(ticketAttributes);
            
            expect(ticket.cuttingOutsideRollWaste).toEqual(expect.any(Number));
        });

        it('should default to 0', () => {
            delete ticketAttributes.cuttingOutsideRollWaste;
            const ticket = new TicketModel(ticketAttributes);
            
            expect(ticket.cuttingOutsideRollWaste).toEqual(0);
        });

        it('should not be less than 0', () => {
            ticketAttributes.cuttingOutsideRollWaste = -1;
            const ticket = new TicketModel(ticketAttributes);

            const error = ticket.validateSync();

            expect(error).toBeDefined();
        });
    });

    describe('attribute: cuttingStockDefectWaste', () => {
        it('should be a number', () => {
            ticketAttributes.cuttingStockDefectWaste = chance.d100();
            const ticket = new TicketModel(ticketAttributes);
            
            expect(ticket.cuttingStockDefectWaste).toEqual(expect.any(Number));
        });

        it('should default to 0', () => {
            delete ticketAttributes.cuttingStockDefectWaste;
            const ticket = new TicketModel(ticketAttributes);

            expect(ticket.cuttingStockDefectWaste).toEqual(0);
        });

        it('should be greater than or equal to 0', () => {
            ticketAttributes.cuttingStockDefectWaste = -1;
            const ticket = new TicketModel(ticketAttributes);

            const error = ticket.validateSync();

            expect(error).toBeDefined();
        });
    });

    describe('attribute: cuttingDefectWaste', () => {
        it('should be a number', () => {
            ticketAttributes.cuttingDefectWaste = chance.d100();
            const ticket = new TicketModel(ticketAttributes);
            
            expect(ticket.cuttingDefectWaste).toEqual(expect.any(Number));
        });

        it('should default to 0', () => {
            delete ticketAttributes.cuttingDefectWaste;
            const ticket = new TicketModel(ticketAttributes);
            
            expect(ticket.cuttingDefectWaste).toEqual(0);
        });

        it('should be greater than or equal to 0', () => {
            ticketAttributes.cuttingDefectWaste = -1;
            const ticket = new TicketModel(ticketAttributes);
            
            const error = ticket.validateSync();
            
            expect(error).toBeDefined();
        });
    });

    describe('attribute: cuttingOperatorErrorStockWaste', () => {
        it('should be a number', () => {
            ticketAttributes.cuttingOperatorErrorStockWaste = chance.d100();
            const ticket = new TicketModel(ticketAttributes);
            
            expect(ticket.cuttingOperatorErrorStockWaste).toEqual(expect.any(Number));
        });

        it('should default to 0', () => {
            delete ticketAttributes.cuttingOperatorErrorStockWaste;
            const ticket = new TicketModel(ticketAttributes);
            
            expect(ticket.cuttingOperatorErrorStockWaste).toEqual(0);
        });

        it('should be greater than or equal to 0', () => {
            ticketAttributes.cuttingOperatorErrorStockWaste = -1;
            const ticket = new TicketModel(ticketAttributes);
            
            const error = ticket.validateSync();
            
            expect(error).toBeDefined();
        });
    });

    describe('attribute: cuttingJobComments', () => {
        it('should be a string', () => {
            ticketAttributes.cuttingJobComments = chance.string();
            const ticket = new TicketModel(ticketAttributes);
            
            expect(ticket.cuttingJobComments).toEqual(expect.any(String));
        });

        it('should not be required', () => {
            delete ticketAttributes.cuttingJobComments;
            const ticket = new TicketModel(ticketAttributes);
            
            const error = ticket.validateSync();
            
            expect(error).toBeUndefined();
        });

        it('should trim whitespace', () => {
            const jobComments = chance.string();
            ticketAttributes.cuttingJobComments = ` ${jobComments} `;
            
            const ticket = new TicketModel(ticketAttributes);
            
            expect(ticket.cuttingJobComments).toEqual(jobComments.trim());
        });
    });

    describe('attribute: rewindingDuration', () => {
        it('should not be required', () => {
            delete ticketAttributes.rewindingDuration;
            const ticket = new TicketModel(ticketAttributes);
            
            const error = ticket.validateSync();
            
            expect(error).toBeUndefined();
        });

        it('should be a number', () => {
            const rewindingDuration = chance.d100();
            ticketAttributes.rewindingDuration = rewindingDuration;
            const ticket = new TicketModel(ticketAttributes);
            
            expect(ticket.rewindingDuration).toEqual(rewindingDuration);
        });

        it('should be greater than or equal to 0', () => {
            ticketAttributes.rewindingDuration = -1;
            const ticket = new TicketModel(ticketAttributes);
            
            const error = ticket.validateSync();

            expect(error).toBeDefined();
        });

        it('should fail validation if attribute is not a whole number', () => {
            ticketAttributes.rewindingDuration = 932.43;
            const ticket = new TicketModel(ticketAttributes);
            
            const error = ticket.validateSync();
            
            expect(error).toBeDefined();
        });

        it('should default to 0 if attribute is not defined', () => {
            delete ticketAttributes.rewindingDuration;
            const ticket = new TicketModel(ticketAttributes);
            
            expect(ticket.rewindingDuration).toEqual(0);
        });
    });

    describe('attribute: windingJobComments', () => {
        it('should not be required', () => {
            delete ticketAttributes.windingJobComments;
            const ticket = new TicketModel(ticketAttributes);
            
            const error = ticket.validateSync();
            
            expect(error).toBeUndefined();
        });

        it('should be a string', () => {
            const windingJobComments = chance.string();
            ticketAttributes.windingJobComments = windingJobComments;
            const ticket = new TicketModel(ticketAttributes);
            
            expect(ticket.windingJobComments).toEqual(windingJobComments);
        });
    });

    describe('attribute: packagingDuration', () => {
        it ('should not be required', () => {
            delete ticketAttributes.packagingDuration;
            const ticket = new TicketModel(ticketAttributes);
            
            const error = ticket.validateSync();
            
            expect(error).toBeUndefined();
        });

        it('should be a field containing a positive integer representing a number of seconds', () => {
            verifyTimeFieldInSeconds(ticketAttributes, 'packagingDuration');
        });
    });

    describe('attribute: boxes', () => {
        it('should default to an empty array', () => {
            delete ticketAttributes.boxes;
            const ticket = new TicketModel(ticketAttributes);

            expect(ticket.boxes).toEqual([]);
        });

        it('should be an array of objects which contain the correct attributes', () => {
            const rollsPerBox = chance.d100();
            const boxSize = chance.d100();
            const quantityOfBoxes = chance.d100();
            const box = {rollsPerBox, boxSize, quantityOfBoxes};
            ticketAttributes.boxes = [box];

            const ticket = new TicketModel(ticketAttributes);
            const [box1] = ticket.boxes;
            
            expect(box1.rollsPerBox).toEqual(rollsPerBox);
            expect(box1.boxSize).toEqual(boxSize);
            expect(box1.quantityOfBoxes).toEqual(quantityOfBoxes);
        });

        it('should default rollsPerBox, boxSize, and quantityOfBoxes to 0', () => {
            const emtpyBox = {};
            ticketAttributes.boxes = [emtpyBox];
            const ticket = new TicketModel(ticketAttributes);
            const [box] = ticket.boxes;
            
            expect(box.rollsPerBox).toEqual(0);
            expect(box.boxSize).toEqual(0);
            expect(box.quantityOfBoxes).toEqual(0);
        });

        it('should fail validation boxes[n].rollsPerBox is negative', () => {
            ticketAttributes.boxes = [{rollsPerBox: -1, boxSize: chance.d100(), quantityOfBoxes: chance.d100() }];
            const ticket = new TicketModel(ticketAttributes);
            
            const error = ticket.validateSync();
            
            expect(error).toBeDefined();
        });

        it('should fail validation boxes[n].boxSize is negative', () => {
            ticketAttributes.boxes = [{rollsPerBox: chance.d100(), boxSize: -1, quantityOfBoxes: chance.d100() }];
            const ticket = new TicketModel(ticketAttributes);
            
            const error = ticket.validateSync();
            
            expect(error).toBeDefined();
        });

        it('should fail validation boxes[n].quantityOfBoxes is negative', () => {
            ticketAttributes.boxes = [{rollsPerBox: chance.d100(), boxSize: chance.d100(), quantityOfBoxes: -1 }];
            const ticket = new TicketModel(ticketAttributes);
            
            const error = ticket.validateSync();
            
            expect(error).toBeDefined();
        });
    });

    describe('attribute: totalRollsBoxed', () => {
        it('should not be required', () => {
            delete ticketAttributes.totalRollsBoxed;
            const ticket = new TicketModel(ticketAttributes);
            
            const error = ticket.validateSync();
            
            expect(error).toBeUndefined();
        });

        it('should be a calculated field', () => {
            const valueToIgnoreCompletely = chance.d100();
            ticketAttributes.totalRollsBoxed = valueToIgnoreCompletely;
            const boxes = [
                { rollsPerBox: chance.d100() },
                { rollsPerBox: chance.d100() },
                { rollsPerBox: chance.d100() }
            ];
            const expectedTotalRollsBoxed = boxes[0].rollsPerBox + boxes[1].rollsPerBox + boxes[2].rollsPerBox;
            ticketAttributes.boxes = boxes;
            const ticket = new TicketModel(ticketAttributes);
            
            expect(ticket.totalRollsBoxed).toEqual(expectedTotalRollsBoxed);
        });
    });
    
    describe('attribute: totalQtyBoxed', () => {
        it('should not be required', () => {
            delete ticketAttributes.totalQtyBoxed;
            const ticket = new TicketModel(ticketAttributes);
            
            const error = ticket.validateSync();

            expect(error).toBeUndefined();
        });

        it('should default to 0', () => {
            delete ticketAttributes.totalQtyBoxed;
            const ticket = new TicketModel(ticketAttributes);
            
            expect(ticket.totalQtyBoxed).toEqual(0);
        });

        it('should be greater than or equal to 0', () => {
            ticketAttributes.totalQtyBoxed = -1;
            const ticket = new TicketModel(ticketAttributes);
            
            const error = ticket.validateSync();
            
            expect(error).toBeDefined();
        });
    });

    describe('attribute: packagingJobComments', () => {
        it('should be a string', () => {
            ticketAttributes.packagingJobComments = chance.d100();
            const ticket = new TicketModel(ticketAttributes);
            
            expect(ticket.packagingJobComments).toEqual(expect.any(String));
        });

        it('should not be required', () => {
            delete ticketAttributes.packagingJobComments;
            const ticket = new TicketModel(ticketAttributes);
            
            const error = ticket.validateSync();
            
            expect(error).toBeUndefined();
        });

        it('should trim whitespace', () => {
            const jobComments = chance.string();
            ticketAttributes.packagingJobComments = ` ${jobComments} `;

            const ticket = new TicketModel(ticketAttributes);
            
            expect(ticket.packagingJobComments).toEqual(jobComments.trim());
        });
    });

    describe('attribute: destination', () => {
        it('should pass validation if attribute is not defined', () => {
            delete ticketAttributes.destination;
            const ticket = new TicketModel(ticketAttributes);

            const error = ticket.validateSync();

            expect(error).toBe(undefined);
        });

        it('should fail validation if attribute is not the correct type', () => {
            ticketAttributes.destination = chance.word();
            const ticket = new TicketModel(ticketAttributes);

            const error = ticket.validateSync();

            expect(error).not.toBe(undefined);
        });

        it('should be a mongoose object with an _id attribute', () => {
            const randomDepartment = chance.pickone(departmentsEnum.getAllDepartmentsWithDepartmentStatuses());
            ticketAttributes.destination = {
                department: randomDepartment,
                departmentStatus: chance.pickone(departmentsEnum.departmentToStatusesMappingForTicketObjects[randomDepartment])
            };

            const ticket = new TicketModel(ticketAttributes);

            expect(ticket.destination._id).not.toBe(undefined);
        });

        it('should fail validation if destination is empty object', () => {
            ticketAttributes.destination = {};
            const ticket = new TicketModel(ticketAttributes);

            const error = ticket.validateSync();

            expect(error).toBeDefined();
        });

        it('should pass validation if destination.department and destination.departmentStatus are defined correctly', () => {
            const validTicketDepartment = getRandomValidTicketDepartment();
            const validTicketDepartmentStatus = getRandomValidTicketDepartmentStatus(validTicketDepartment);

            ticketAttributes.destination = {
                department: validTicketDepartment,
                departmentStatus: validTicketDepartmentStatus
            };
            const ticket = new TicketModel(ticketAttributes);

            const error = ticket.validateSync();

            expect(error).toBeUndefined();
        });

        it('should fail validation if destination.department is defined correctly but destination.departmentStatus is not', () => {
            const validTicketDepartment = getRandomValidTicketDepartment();
            const invalidTicketDepartmentStatus = chance.word();

            ticketAttributes.destination = {
                department: validTicketDepartment,
                departmentStatus: invalidTicketDepartmentStatus
            };
            const ticket = new TicketModel(ticketAttributes);

            const error = ticket.validateSync();

            expect(error).toBeDefined();
        });

        it('should fail validation if destination.department is not allowed, regardless of what destination.departmentStatus is', () => {
            const invalidTicketDepartment = chance.word();

            const validDepartment = getRandomValidTicketDepartment();
            const validTicketDepartment = getRandomValidTicketDepartmentStatus(validDepartment);

            ticketAttributes.destination = {
                department: invalidTicketDepartment,
                departmentStatus: validTicketDepartment
            };
            const ticket = new TicketModel(ticketAttributes);

            const error = ticket.validateSync();

            expect(error).toBeDefined();
        });
    });

    describe('attribute: packingSlips', () => {
        it('should pass validation if attribute is defined correctly', () => {
            delete ticketAttributes.packingSlips;
            const ticket = new TicketModel(ticketAttributes);
            
            const error = ticket.validateSync();

            expect(error).toBeUndefined();
        });
        
        it('should default to an empty array', () => {
            delete ticketAttributes.packingSlips;
            const ticket = new TicketModel(ticketAttributes);
            
            expect(ticket.packingSlips).toEqual([]);
        });

        it('should be an array of mongoose object ids', () => {
            const packingSlips = [
                new mongoose.Types.ObjectId(),
                new mongoose.Types.ObjectId()
            ];
            ticketAttributes.packingSlips = packingSlips;
            const ticket = new TicketModel(ticketAttributes);
            
            expect(ticket.packingSlips.length).toEqual(packingSlips.length);

            expect(ticket.packingSlips[0]).toEqual(expect.any(mongoose.Types.ObjectId));
            expect(ticket.packingSlips[0]).toEqual(packingSlips[0]);

            expect(ticket.packingSlips[1]).toEqual(expect.any(mongoose.Types.ObjectId));
            expect(ticket.packingSlips[1]).toEqual(packingSlips[1]);
        });
    });

    describe('attribute: products', () => {
        it('should pass validation if attribute is defined correctly', () => {
            const products = [
                { baseProduct: new mongoose.Types.ObjectId() },
                { baseProduct: new mongoose.Types.ObjectId() },
                { baseProduct: new mongoose.Types.ObjectId() },
            ];
            ticketAttributes.products = products;
            const ticket = new TicketModel(ticketAttributes);
            
            const error = ticket.validateSync();
            
            expect(error).toBeUndefined();
            expect(ticket.products.length).toEqual(products.length);
        });

        it('should have the correct fields on each product', () => {
            const products = [
                { 
                    baseProduct: new mongoose.Types.ObjectId(), 
                    labelQuantity: chance.d100(),
                    numberOfFinishedRolls: chance.d100(), 
                    finishedLabelQuantity: chance.d100() 
                },
            ];
            ticketAttributes.products = products;
            const ticket = new TicketModel(ticketAttributes);
            
            expect(ticket.products[0].baseProduct).toEqual(products[0].baseProduct);
            expect(ticket.products[0].labelQuantity).toEqual(products[0].labelQuantity);
            expect(ticket.products[0].numberOfFinishedRolls).toEqual(products[0].numberOfFinishedRolls);
            expect(ticket.products[0].finishedLabelQuantity).toEqual(products[0].finishedLabelQuantity);
        });
    });

    describe('attribute: estimatedTicket', () => {
        it('should not be required', () => {
            delete ticketAttributes.estimatedTicket;
            const ticket = new TicketModel(ticketAttributes);

            const error = ticket.validateSync();

            expect(error).toBeUndefined();
        });

        it('should be set to the correct value', () => {
            const estimatedTicketObjectId = new mongoose.Types.ObjectId();
            ticketAttributes.estimatedTicket = estimatedTicketObjectId;
            const ticket = new TicketModel(ticketAttributes);
            
            expect(ticket.estimatedTicket).toBe(estimatedTicketObjectId);
        });
    });

    describe('database interaction validations', () => {
        let customerAttributes, savedCustomer;

        beforeAll(async () => {
            await databaseService.connectToTestMongoDatabase();
        });

        afterEach(async () => {
            await databaseService.clearDatabase();
        });

        afterAll(async () => {
            await databaseService.closeDatabase();
        });

        beforeEach(async () => {
            customerAttributes = testDataGenerator.mockData.Customer();
            const customer = new CustomerModel(customerAttributes);
            savedCustomer = await customer.save();
            ticketAttributes.customer = savedCustomer._id;
        });

        it('should soft delete items', async () => {
            const ticket = new TicketModel(ticketAttributes);
            const id = ticket._id;

            await ticket.save();
            await TicketModel.deleteById(id);

            const softDeletedAdhesiveCategory = await TicketModel.findOneDeleted({_id: id}).exec();

            expect(softDeletedAdhesiveCategory).toBeDefined();
            expect(softDeletedAdhesiveCategory.deleted).toBe(true);
        });

        describe('attribute: products', () => {
            it('should have timestamps', async () => {
                ticketAttributes.products = [
                    {
                        baseProduct: new mongoose.Types.ObjectId(),
                        labelQuantity: chance.d100(),
                        numberOfFinishedRolls: chance.d100(),
                        finishedLabelQuantity: chance.d100()
                    }
                ];
                const ticket = new TicketModel(ticketAttributes);
                const savedTicket = await ticket.save();
                
                expect(savedTicket.products[0].createdAt).toBeDefined();
                expect(savedTicket.products[0].updatedAt).toBeDefined();
            });
        });

        describe('attribute: ticketNumber', () => {
            it('should generate upon save', async () => {
                delete ticketAttributes.ticketNumber;
                const ticket = new TicketModel(ticketAttributes);
                const savedTicket = await ticket.save();
                
                expect(savedTicket.ticketNumber).toEqual(expect.any(Number));
            });

            it('should set the first ticketNumber at 60000 and incriment future tickets by 1', async () => {
                const startingTicketNumber = 60000;
                const ticket1 = new TicketModel(ticketAttributes);
                const ticket2 = new TicketModel(ticketAttributes);
                const ticket3 = new TicketModel(ticketAttributes);

                const savedTicket1 = await ticket1.save();
                const savedTicket2 = await ticket2.save();
                const savedTicket3 = await ticket3.save();

                expect(savedTicket1.ticketNumber).toEqual(startingTicketNumber);
                expect(savedTicket2.ticketNumber).toEqual(startingTicketNumber + 1);
                expect(savedTicket3.ticketNumber).toEqual(startingTicketNumber + 2);
            });
        });

        describe('attribute: ticketNotes', () => {
            it('should append ticket.customer.notes to ticket.ticketNotes', async () => {
                ticketAttributes.ticketNotes = chance.string();
                const ticket = new TicketModel(ticketAttributes);
                const savedTicket = await ticket.save();
                const expectedTicketNotesAfterSaving = `${ticketAttributes.ticketNotes}\n\nCustomer Notes:\n${savedCustomer.notes}`;

                expect(savedTicket.ticketNotes).toEqual(expectedTicketNotesAfterSaving);
            });
        });

        describe('Adding record(s) to WorkflowStep table', () => {
            let destination;

            beforeEach(() => {
                const randomDepartment = chance.pickone(departmentsEnum.getAllDepartmentsWithDepartmentStatuses());
                const departmentStatus = chance.pickone(departmentsEnum.departmentToStatusesMappingForTicketObjects[randomDepartment]);
                destination = {
                    department: randomDepartment,
                    departmentStatus: departmentStatus
                };
            });

            describe('mongoose ticketSchema.pre("save")', () => {
                it('should add item to workflow database when one ticket is saved with a destination', async () => {
                    ticketAttributes.destination = destination;
                    const ticket = new TicketModel(ticketAttributes);
                    await ticket.save({ validateBeforeSave: false });

                    const allWorkflowStepsInDatabase = await WorkflowStepModel.find({});
                    expect(allWorkflowStepsInDatabase.length).toBe(1);

                    const [workflowStep] = allWorkflowStepsInDatabase;
                    expect(workflowStep.destination.department).toEqual(destination.department);
                    expect(workflowStep.destination.departmentStatus).toEqual(destination.departmentStatus);
                });

                it('should NOT add item to workflow database when one ticket is saved without a destination', async () => {
                    delete ticketAttributes.destination;
                    const ticket = new TicketModel(ticketAttributes);
                    
                    await ticket.save({ validateBeforeSave: false });

                    const allWorkflowStepsInDatabase = await WorkflowStepModel.find({});
                    expect(allWorkflowStepsInDatabase.length).toBe(0);
                });
            });

            describe('mongoose ticketSchema.pre("findOneAndUpdate")', () => {
                it('should add item to workflow database when one ticket is updated', async () => {
                    const ticket = new TicketModel(ticketAttributes);
        
                    let savedTicket = await ticket.save({validateBeforeSave: false});
                    await TicketModel.findOneAndUpdate({_id: savedTicket._id}, {$set: {destination: destination}}, {runValidators: true}).exec();
        
                    const allWorkflowStepsInDatabase = await WorkflowStepModel.find({});
                    
                    expect(allWorkflowStepsInDatabase.length).toBe(1);

                    const [workflowStep] = allWorkflowStepsInDatabase;
                    expect(workflowStep.destination.department).toEqual(destination.department);
                    expect(workflowStep.destination.departmentStatus).toEqual(destination.departmentStatus);
                });
        
                it('should add item to workflow database with the correct attributes when one ticket is updated', async () => {
                    const ticket = new TicketModel(ticketAttributes);
                    let savedTicket = await ticket.save({validateBeforeSave: false});
                    await TicketModel.findOneAndUpdate({_id: savedTicket._id}, {$set: {destination: destination}}, {runValidators: true}).exec();
        
                    const allWorkflowStepsInDatabase = await WorkflowStepModel.find({});
                    const workflowStep = allWorkflowStepsInDatabase[0];
                    
                    expect(allWorkflowStepsInDatabase.length).toBe(1);
                    expect(String(workflowStep.ticketId)).toBe(String(savedTicket._id));
                    expect(workflowStep.destination.department).toBe(destination.department);
                    expect(workflowStep.destination.departmentStatus).toBe(destination.departmentStatus);
                    expect(workflowStep.destination.createdAt).toBeDefined();
                    expect(workflowStep.destination.updatedAt).toBeDefined();
                    expect(workflowStep.createdAt).toBeDefined();
                    expect(workflowStep.updatedAt).toBeDefined();
                });
        
                it('should NOT add item to workflow database when one ticket is updated but the destination attribute was NOT updated', async () => {
                    const ticket = new TicketModel(ticketAttributes);
                    let savedTicket = await ticket.save({validateBeforeSave: false});
                    const ticketAttributesOtherThanDestinationToUpdate = {};
                    await TicketModel.findOneAndUpdate({_id: savedTicket._id}, {$set: ticketAttributesOtherThanDestinationToUpdate}, {runValidators: true}).exec();
        
                    const allWorkflowStepsInDatabase = await WorkflowStepModel.find({});
                    
                    expect(allWorkflowStepsInDatabase.length).toBe(0);
                });
        
                it('should add a new item to workflow database N times where N is the number of times a tickets destination attribute was updated', async () => {
                    const ticket = new TicketModel(ticketAttributes);
                    const numberOfUpdatesToTicketDestination = chance.integer({min: 10, max: 100});
                    const departments = departmentsEnum.getAllDepartmentsWithDepartmentStatuses();
                    let savedTicket = await ticket.save({validateBeforeSave: false});
        
                    for (let i=0; i < numberOfUpdatesToTicketDestination; i++) {
                        const department = chance.pickone(departments);
                        const departmentStatus = chance.pickone(departmentsEnum.departmentToStatusesMappingForTicketObjects[department]);
        
                        const newTicketDestination = {
                            department,
                            departmentStatus
                        };
        
                        await TicketModel.findOneAndUpdate({_id: savedTicket._id}, {$set: {destination: newTicketDestination}}, {runValidators: true}).exec();
                    }
        
                    const allWorkflowStepsInDatabase = await WorkflowStepModel.find({});
                    
                    expect(allWorkflowStepsInDatabase.length).toBe(numberOfUpdatesToTicketDestination);
                });
            });

            describe('attributes which are arrays of objects, and whose objects has a single value field', () => {
                beforeEach(() => {
                    ticketAttributes = {
                        ...ticketAttributes,
                        colorCalibrations: [ createObjectWithValueField(chance.d100()) ],
                        scalings: [ createObjectWithValueField(chance.d100()) ],
                        printCleaners: [ createObjectWithValueField(chance.d100()) ],
                        proofRunups: [ createObjectWithValueField(chance.d100()) ],
                        newMaterialSplices: [ createObjectWithValueField(chance.d100()) ],
                        existingMaterialSplices: [ createObjectWithValueField(chance.d100()) ],
                        materialWrapUps: [ createObjectWithValueField(chance.d100()) ],
                        webBreaks: [ createObjectWithValueField(chance.d100()) ],
                        newInkBuilds: [ createObjectWithValueField(chance.d100()) ],
                        imagePlacements: [ createObjectWithValueField(chance.d100()) ],
                        colorSeperations: [ createObjectWithValueField(chance.d100()) ],
                        trailingEdges: [ createObjectWithValueField(chance.d100()) ],
                        leadingEdges: [ createObjectWithValueField(chance.d100()) ]
                    };
                });
                it('should have timestamps and _id on each element in colorCalibrations[n]', async () => {
                    ticketAttributes.colorCalibrations = [ { value: chance.d100() } ];
                    const ticket = new TicketModel(ticketAttributes);

                    const savedTicket = await ticket.save();

                    const { colorCalibrations } = savedTicket;

                    expect(colorCalibrations[0].updatedAt).toBeDefined();
                    expect(colorCalibrations[0].createdAt).toBeDefined();
                    expect(colorCalibrations[0]._id).toBeDefined();

                    const { scalings } = savedTicket;

                    expect(scalings[0].updatedAt).toBeDefined();
                    expect(scalings[0].createdAt).toBeDefined();
                    expect(scalings[0]._id).toBeDefined();

                    const { printCleaners } = savedTicket;

                    expect(printCleaners[0].updatedAt).toBeDefined();
                    expect(printCleaners[0].createdAt).toBeDefined();
                    expect(printCleaners[0]._id).toBeDefined();

                    const { proofRunups } = savedTicket;

                    expect(proofRunups[0].updatedAt).toBeDefined();
                    expect(proofRunups[0].createdAt).toBeDefined();
                    expect(proofRunups[0]._id).toBeDefined();

                    const { newMaterialSplices } = savedTicket;
                    
                    expect(newMaterialSplices[0].updatedAt).toBeDefined();
                    expect(newMaterialSplices[0].createdAt).toBeDefined();
                    expect(newMaterialSplices[0]._id).toBeDefined();

                    const { existingMaterialSplices } = savedTicket;

                    expect(existingMaterialSplices[0].updatedAt).toBeDefined();
                    expect(existingMaterialSplices[0].createdAt).toBeDefined();
                    expect(existingMaterialSplices[0]._id).toBeDefined();

                    const { materialWrapUps } = savedTicket;

                    expect(materialWrapUps[0].updatedAt).toBeDefined();
                    expect(materialWrapUps[0].createdAt).toBeDefined();
                    expect(materialWrapUps[0]._id).toBeDefined();

                    const { webBreaks } = savedTicket;

                    expect(webBreaks[0].updatedAt).toBeDefined();
                    expect(webBreaks[0].createdAt).toBeDefined();
                    expect(webBreaks[0]._id).toBeDefined();

                    const { newInkBuilds } = savedTicket;

                    expect(newInkBuilds[0].updatedAt).toBeDefined();
                    expect(newInkBuilds[0].createdAt).toBeDefined();
                    expect(newInkBuilds[0]._id).toBeDefined();

                    const { imagePlacements } = savedTicket;

                    expect(imagePlacements[0].updatedAt).toBeDefined();
                    expect(imagePlacements[0].createdAt).toBeDefined();
                    expect(imagePlacements[0]._id).toBeDefined();

                    const { colorSeperations } = savedTicket;
                    
                    expect(colorSeperations[0].updatedAt).toBeDefined();
                    expect(colorSeperations[0].createdAt).toBeDefined();
                    expect(colorSeperations[0]._id).toBeDefined();

                    const { trailingEdges } = savedTicket;

                    expect(trailingEdges[0].updatedAt).toBeDefined();
                    expect(trailingEdges[0].createdAt).toBeDefined();
                    expect(trailingEdges[0]._id).toBeDefined();

                    const { leadingEdges } = savedTicket;

                    expect(leadingEdges[0].updatedAt).toBeDefined();
                    expect(leadingEdges[0].createdAt).toBeDefined();
                    expect(leadingEdges[0]._id).toBeDefined();
                });
            });
        });
    });
});