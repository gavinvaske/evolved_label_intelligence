import Chance from 'chance';
const chance = Chance();
import mongoose from 'mongoose';

import { dieShapes } from '../application/api/enums/dieShapesEnum';
import { toolTypes } from '../application/api/enums/toolTypesEnum';
import { dieVendors } from '../application/api/enums/dieVendorsEnum';
import { dieMagCylinders } from '../application/api/enums/dieMagCylindersEnum';
import { dieStatuses } from '../application/api/enums/dieStatusesEnum';
import { unwindDirections } from '../application/api/enums/unwindDirectionsEnum';
import { finishTypes } from '../application/api/enums/finishTypesEnum';
import { AVAILABLE_AUTH_ROLES } from '../application/api/enums/authRolesEnum';
import { ovOrEpmOptions } from '../application/api/enums/ovOrEpmEnum';
import { DIE_NUMBER_PREFIXES } from '../application/api/enums/dieNumberPrefixEnum';

export const mockData = {
    Die: getDie,
    Material: getMaterial,
    Finish: getFinish,
    Customer: getCustomer,
    Contact: getContact,
    User: getUser,
    BaseProduct: getBaseProduct,
    Address: getAddress,
    CreditTerm: getCreditTerm,
    AdhesiveCategory: getAdhesiveCategory,
    DeliveryMethod: getDeliveryMethod,
    LinerType: getLinerType,
    Vendor: getVendor,
    MaterialCategory: getMaterialCategory,
    MaterialLengthAdjustment: getMaterialLengthAdjustment,
    MaterialOrder: getMaterialOrder,
    ShippingLocation: getShippingLocation
};

function getDie() {
    return {
        shape: chance.pickone(dieShapes),
        sizeAcross: chance.floating({ min: 0.01, max: 10, fixed: 2 }),
        sizeAround: chance.floating({ min: 0.01, max: 10, fixed: 2 }),
        dieNumber: `${chance.pickone(DIE_NUMBER_PREFIXES)}-${chance.integer({ min: 1000, max: 9999 })}`,
        numberAcross: chance.d10(),
        numberAround: chance.d10(),
        gear: chance.d100(),
        toolType: chance.pickone(toolTypes),
        notes: chance.sentence(),
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
        quantity: chance.d100(),
        isLamination: chance.pickone([chance.bool(), undefined])
    };
}

function getMaterialOrder() {
  return {
    material: new mongoose.Types.ObjectId(),
    purchaseOrderNumber: `${chance.integer({min: 0})}`,
    orderDate: chance.date({string: true}),
    arrivalDate: chance.date({string: true}),
    feetPerRoll: chance.integer({min: 0}),
    totalRolls: chance.integer({min: 1, max: 100}),
    totalCost: chance.floating({min: 1, max: 500000}),
    vendor: new mongoose.Types.ObjectId(),
    hasArrived: chance.bool(),
    notes: chance.sentence(),
    author: new mongoose.Types.ObjectId(),
    freightCharge: chance.floating({ min: 0, fixed: 2 }),
    fuelCharge: chance.floating({ min: 0, fixed: 2 })
  }
}

function getVendor() {
    return {
      name: chance.word(),
      phoneNumber: chance.phone(),
      email: chance.email(),
      notes: chance.sentence(),
      website: chance.url(),
      primaryContactName: `${chance.word()} ${chance.word()}`,
      primaryContactPhoneNumber: chance.phone(),
      primaryContactEmail: chance.email(),
      primaryAddress: getAddress(),
      remittanceAddress: chance.pickone([getAddress(), undefined]),
      mfgSpecNumber: chance.word()
    };
}

function getMaterialLengthAdjustment() {
  return {
    material: new mongoose.Types.ObjectId(),
    length: chance.integer({ min: -100000, max: 100000 }),
    notes: chance.sentence()
  }
}

function getLinerType() {
    return {
        name: chance.word()
    };
}

function getCreditTerm() {
    return {
        description: chance.string({ symbols: false, alpha: true, numeric: true })
    };
}

function getAdhesiveCategory() {
    return {
        name: chance.word()
    };
}

function getMaterialCategory() {
    return {
        name: chance.word()
    };
}

function getMaterial() {
    return {
        name: chance.word(),
        materialId: chance.string({ symbols: false, alpha: true, numeric: true }),
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
        quotePricePerMsi: chance.integer({ min: 0.001, max: 3 }),
        description: chance.string(),
        whenToUse: chance.string(),
        alternativeStock: chance.string(),
        length: chance.integer({ min: 0, max: 1000000 }),
        facesheetWeightPerMsi: chance.floating({ min: 0.0001, fixed: 4 }),
        adhesiveWeightPerMsi: chance.floating({ min: 0.0001, fixed: 4 }),
        linerWeightPerMsi: chance.floating({ min: 0.0001, fixed: 4 }),
        locations: ['A1', 'Z99'],
        linerType: new mongoose.Types.ObjectId(),
        productNumber: chance.string(),
        masterRollSize: chance.integer({ min: 1, max: 10 }),
        image: chance.url(),
        lowStockThreshold: chance.integer({ min: 0, max: 10000 }),
        lowStockBuffer: chance.integer({ min: 0, max: 10000 }),
    };
}

function getFinish() {
    return {
        name: chance.word(),
        finishId: chance.string({ symbols: false, alpha: true, numeric: true }),
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
        fullName: `${chance.word()} ${chance.word()}`,
        phoneNumber: chance.phone(),
        phoneExtension: chance.integer({ min: 0, max: 999 }),
        email: chance.email(),
        contactStatus: chance.string(),
        notes: chance.sentence(),
        position: chance.string(),
        location: null
    };
}

function getCustomer() {
    return {
        name: `${chance.word()} ${chance.word()}`,
        notes: chance.sentence(),
        overun: chance.d100(),
        customerId: chance.string({ symbols: false, alpha: true, numeric: true }),
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
        name: chance.word(),
        street: chance.street(),
        unitOrSuite: chance.word(),
        city: chance.city(),
        state: chance.state(),
        zipCode: chance.zip()
    };
}

function getShippingLocation() {
  return {
    ...getAddress(),
    freightAccountNumber: chance.string(),
    deliveryMethod: new mongoose.Types.ObjectId()
  }
}

function getDeliveryMethod() {
    return {
        name: chance.word()
    };
}