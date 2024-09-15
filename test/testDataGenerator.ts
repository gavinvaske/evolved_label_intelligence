import Chance from 'chance';
const chance = Chance();
import mongoose from 'mongoose';

import { dieShapes } from '../application/api/enums/dieShapesEnum.ts';
import { toolTypes } from '../application/api/enums/toolTypesEnum.ts';
import { dieVendors } from '../application/api/enums/dieVendorsEnum.ts';
import { dieMagCylinders } from '../application/api/enums/dieMagCylindersEnum.ts';
import { dieStatuses } from '../application/api/enums/dieStatusesEnum.ts';
import { unwindDirections } from '../application/api/enums/unwindDirectionsEnum.ts';
import { finishTypes } from '../application/api/enums/finishTypesEnum.ts';
import { AVAILABLE_AUTH_ROLES } from '../application/api/enums/authRolesEnum.ts';
import { ovOrEpmOptions } from '../application/api/enums/ovOrEpmEnum.ts';

export const mockData = {
    Die: getDie,
    Material: getMaterial,
    Finish: getFinish,
    Customer: getCustomer,
    Contact: getContact,
    User: getUser,
    BaseProduct: getBaseProduct,
    Address: getAddress
};

function getDie() {
    return {
        shape: chance.pickone(dieShapes),
        sizeAcross: chance.floating({ min: 0.01, max: 10, fixed: 2 }),
        sizeAround: chance.floating({ min: 0.01, max: 10, fixed: 2 }),
        dieNumber: 'DC-1234',
        numberAcross: chance.d10(),
        numberAround: chance.d10(),
        gear: chance.d100(),
        toolType: chance.pickone(toolTypes),
        notes: chance.string(),
        cost: chance.floating({ min: 0, fixed: 2 }),
        vendor: chance.pickone(dieVendors),
        magCylinder: chance.pickone(dieMagCylinders),
        cornerRadius: chance.floating({ min: 0.01, max: 10, fixed: 2 }),
        topAndBottom: chance.d100(),
        leftAndRight: chance.d100(),
        spaceAcross: chance.floating({ min: 0.01, max: 10, fixed: 2 }),
        spaceAround: chance.floating({ min: 0.01, max: 10, fixed: 2 }),
        facestock: chance.string(),
        liner: chance.string(),
        specialType: chance.string(),
        serialNumber: chance.string(),
        status: chance.pickone(dieStatuses),
        quantity: chance.d100()
    };
}

function getMaterial() {
    return {
        name: chance.string(),
        materialId: chance.string(),
        vendor: new mongoose.Types.ObjectId(),
        materialCategory: new mongoose.Types.ObjectId(),
        thickness: chance.integer({ min: 1, max: 3 }),
        weight: chance.integer({ min: 0 }),
        costPerMsi: `${chance.floating({ min: 0.001, fixed: 3, max: 3 })}`,
        freightCostPerMsi: `${chance.floating({ min: 0.001, fixed: 3, max: 3 })}`,
        width: chance.d12(),
        faceColor: chance.string(),
        adhesive: chance.string(),
        adhesiveCategory: new mongoose.Types.ObjectId(),
        quotePricePerMsi: chance.integer({ min: 0.001, fixed: 3, max: 3 }),
        description: chance.string(),
        whenToUse: chance.string(),
        alternativeStock: chance.string(),
        length: chance.integer({ min: 0, max: 1000000 }),
        facesheetWeightPerMsi: chance.floating({ min: 0.0001, fixed: 4 }),
        adhesiveWeightPerMsi: chance.floating({ min: 0.0001, fixed: 4 }),
        linerWeightPerMsi: chance.floating({ min: 0.0001, fixed: 4 }),
        location: chance.word(),
        linerType: new mongoose.Types.ObjectId(),
        productNumber: chance.string(),
        masterRollSize: chance.integer({ min: 1, max: 10 }),
        image: chance.url()
    };
}

function getFinish() {
    return {
        name: chance.string(),
        finishId: chance.string(),
        vendor: new mongoose.Types.ObjectId(),
        category: new mongoose.Types.ObjectId(),
        thickness: chance.integer({ min: 1, max: 3 }),
        weight: chance.d100(),
        costPerMsi: chance.floating({ min: 0.001, fixed: 3, max: 3 }),
        freightCostPerMsi: chance.floating({ min: 0.001, fixed: 3, max: 3 }),
        width: chance.d100(),
        quotePricePerMsi: chance.floating({ min: 0.001, fixed: 3, max: 3 }),
        description: chance.string(),
        whenToUse: chance.string(),
        alternativeFinish: chance.string()
    };
}

function getContact() {
    return {
        fullName: chance.string(),
        contactStatus: chance.string()
    };
}

function getCustomer() {
    return {
        name: chance.string(),
        notes: chance.string(),
        overun: chance.d100(),
        customerId: chance.string(),
        contacts: chance.n(getContact, chance.d10()),
    };
}

function getUser() {
    const PASSWORD_MIN_LENGTH = 8;

    return {
        firstName: chance.word(),
        lastName: chance.word(),
        birthDate: chance.date({ string: true }),
        email: chance.email(),
        password: chance.string({ length: PASSWORD_MIN_LENGTH }),
        authRoles: [chance.pickone(AVAILABLE_AUTH_ROLES)]
    };
}

function getBaseProduct() {
  return {
    customer: new mongoose.Types.ObjectId(),
    die: new mongoose.Types.ObjectId(),
    primaryMaterial: new mongoose.Types.ObjectId(),
    finish: new mongoose.Types.ObjectId(),
    author: new mongoose.Types.ObjectId(),
    productDescription: chance.string(),
    unwindDirection: chance.pickone(unwindDirections),
    ovOrEpm: chance.pickone(ovOrEpmOptions),
    finishType: chance.pickone(finishTypes),
    coreDiameter: chance.d10(),
    labelsPerRoll: chance.integer({ min: 100, max: 1000 }),
    spotPlate: chance.bool(),
    numberOfColors: chance.d12()
  }
}

function getAddress() {
    return {
        name: chance.string(),
        street: chance.street(),
        unitOrSuite: chance.word(),
        city: chance.city(),
        state: chance.state(),
        zipCode: chance.zip()
    };
}