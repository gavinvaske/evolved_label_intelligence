const mongoose = require('mongoose');
mongoose.Schema.Types.String.set('trim', true);
const Schema = mongoose.Schema;
const { convertDollarsToPennies, convertPenniesToDollars } = require('../services/currencyService');
const { dieShapes } = require('../enums/dieShapesEnum');

function numberHasNDecimalPlacesOrLess(number, maxNumberOfDecimalPlaces) {
    const digitsInDecimalPlace = number.toString().split('.')[1];

    if (!digitsInDecimalPlace) return true;

    return digitsInDecimalPlace.length <= maxNumberOfDecimalPlaces;
}

function numberHasFourDecimalPlacesOrLess(number) {
    const maxNumberOfDecimalPlaces = 4;
    return numberHasNDecimalPlacesOrLess(number, maxNumberOfDecimalPlaces);
}

function numberHasTwoDecimalPlacesOrLess(number) {
    const maxNumberOfDecimalPlaces = 2;
    return numberHasNDecimalPlacesOrLess(number, maxNumberOfDecimalPlaces);
}

const lengthInFeetAttribute = {
    type: Number,
    min: 0
};

const timeInSecondsAttribute = {
    type: Number,
    min: 0
};

const numberOfFramesAttribute = {
    type: Number,
    min: 0
};

const numberOfRollsAttribute = {
    type: Number,
    min: 0,
    validate : {
        validator : Number.isInteger,
        message: '{VALUE} is not an integer'
    },
};

const costAttribute = {
    type: Number,
    min: 0,
    set: convertDollarsToPennies,
    get: convertPenniesToDollars
};

// const percentageAttribute = {}   // TODO (9-13-2023): Finish this after talking to Storm
const msiAttribute = {
    type: Number,
    min: 0
};

const estimatedTicketSchema = new Schema({
    // * Inputs * //
    profitMargin: {
        type: Number,
        min: 0,
        required: true,
        default: 30,
        max: 100
    },
    labelsPerRoll: {
        type: Number,
        min: 1,
        max: 1000000,
        required: true,
        default: 1000,
        validate : {
            validator : Number.isInteger,
            message: '{VALUE} is not an integer'
        }
    },
    numberOfDesigns: {
        type: Number,
        min: 1,
        max: 1000,
        default: 1,
        required: true,
        validate : {
            validator : Number.isInteger,
            message: '{VALUE} is not an integer'
        }
    },
    reinsertion: {
        type: Boolean,
        default: false
    },
    variableData: {
        type: Boolean,
        default: false
    },
    sheeted: {
        type: Boolean,
        default: false
    },
    labelQty: { /// TODO (9-28-2023): Storm says to make this an array, but I think I should just do one number and instead have an array of EstimatedTicket
        type: Number,
        min: 0
    },
    die: {
        type: Schema.Types.ObjectId,
        ref: 'Die'
    },
    sizeAcross: {
        type: Number,
        validate: {
            validator: numberHasFourDecimalPlacesOrLess,
            message: '{VALUE} has more than four decimals'
        },
        min: 0
    },
    sizeAroundOverride: {
        type: Number,
        validate: {
            validator: numberHasFourDecimalPlacesOrLess,
            message: '{VALUE} has more than four decimals'
        },
        min: 0
    },
    // cornerRadius: {},
    shape: {
        type: String,
        enum: dieShapes
    },
    overrideSpaceAround: {
        type: Number,
        validate: {
            validator: numberHasFourDecimalPlacesOrLess,
            message: '{VALUE} has more than four decimals'
        },
        min: 0
    },
    overrideSpaceAcross: {
        type: Number,
        validate: {
            validator: numberHasFourDecimalPlacesOrLess,
            message: '{VALUE} has more than four decimals'
        },
        min: 0
    },
    materialSelect: {
        type: Schema.Types.ObjectId,
        ref: 'Material'
    },
    overrideMaterialFreightMsi: {
        type: Number,
        validate: {
            validator: numberHasFourDecimalPlacesOrLess,
            message: '{VALUE} has more than four decimals'
        },
        min: 0
    },
    overrideMaterialTotalCostMsi: {
        type: Number,
        validate: {
            validator: numberHasFourDecimalPlacesOrLess,
            message: '{VALUE} has more than four decimals'
        },
        min: 0
    },
    overrideMaterialQuotedMsi: {
        type: Number,
        validate: {
            validator: numberHasFourDecimalPlacesOrLess,
            message: '{VALUE} has more than four decimals'
        },
        min: 0
    },
    overrideMaterialThickness: {
        type: Number,
        validate: {
            validator: numberHasFourDecimalPlacesOrLess,
            message: '{VALUE} has more than four decimals'
        },
        min: 0
    },
    overrideFinishSelect: {
        type: Schema.Types.ObjectId,
        ref: 'Finish'
    },
    overrideFinishCostMsi: {
        type: Number,
        validate: {
            validator: numberHasFourDecimalPlacesOrLess,
            message: '{VALUE} has more than four decimals'
        },
        min: 0
    },
    overrideFinishFreightMsi: {
        type: Number,
        validate: {
            validator: numberHasFourDecimalPlacesOrLess,
            message: '{VALUE} has more than four decimals'
        },
        min: 0
    },
    overrideFinishTotalCostMsi: {
        type: Number,
        validate: {
            validator: numberHasFourDecimalPlacesOrLess,
            message: '{VALUE} has more than four decimals'
        },
        min: 0
    },
    overrideFinishQuotedMsi: {
        type: Number,
        validate: {
            validator: numberHasFourDecimalPlacesOrLess,
            message: '{VALUE} has more than four decimals'
        },
        min: 0
    },
    overrideFinishThickness: {
        type: Number,
        validate: {
            validator: numberHasFourDecimalPlacesOrLess,
            message: '{VALUE} has more than four decimals'
        },
        min: 0
    },
    coreDiameter: {
        type: Number,
        validate: {
            validator: numberHasTwoDecimalPlacesOrLess,
            message: '{VALUE} has more than two decimals'
        },
        min: 0,
        default: 3
    },
    numberOfColors: {
        type: Number,
        min: 1,
        max: 12,
        validate: {
            validator: Number.isInteger,
            message: '{VALUE} is not an integer'
        }
    },
    // * Outputs * //
    productQty: {
        type: Number,
        min: 0,
        required: true
    },
    initialStockLength: {
        ...lengthInFeetAttribute
    },
    colorCalibrationFeet: {
        ...lengthInFeetAttribute
    },
    proofRunupFeet: {
        ...lengthInFeetAttribute
    },
    printCleanerFeet: {
        ...lengthInFeetAttribute
    },
    scalingFeet: {
        ...lengthInFeetAttribute
    },
    newMaterialSetupFeet: {
        ...lengthInFeetAttribute
    },
    dieLineSetupFeet: {
        ...lengthInFeetAttribute
    },
    totalStockFeet: {
        ...lengthInFeetAttribute
    },
    // throwAwayStockPercentage: {
    //     ...percentageAttribute
    // },
    totalStockMsi: {
        ...msiAttribute
    },
    totalRollsOfPaper: {
        ...numberOfRollsAttribute
    },
    extraFrames: {
        ...numberOfFramesAttribute
    },
    totalFrames: {
        ...numberOfFramesAttribute
    },
    totalStockCosts: {
        ...costAttribute
    },
    totalFinishFeet: {
        ...lengthInFeetAttribute
    },
    // totalFinishMsi: {
    //     ...msiAttribute
    // },
    totalFinishCost: {
        ...costAttribute
    },
    totalCoreCost: {
        ...costAttribute
    },
    boxCost: {
        ...costAttribute
    },
    totalMaterialsCost: {
        ...costAttribute
    },
    stockSpliceTime: {
        ...timeInSecondsAttribute
    },
    colorCalibrationTime: {
        ...timeInSecondsAttribute
    },
    printingProofTime: {
        ...timeInSecondsAttribute
    },
    reinsertionPrintingTime: {
        ...timeInSecondsAttribute
    },
    printTearDownTime: {
        ...timeInSecondsAttribute
    },
    totalLabelPrintingTime: {
        ...timeInSecondsAttribute
    },
    throwAwayPrintTime: {
        ...timeInSecondsAttribute
    },
    totalTimeAtPrinting: {
        ...timeInSecondsAttribute
    },
    totalPrintingCost: {
        ...costAttribute
    },
    cuttingStockSpliceCost: {
        ...costAttribute
    },
    // dieSetup: {}     // (9-13-2023) Is this a time/feet/cost field? Rename accordingly after talking to Storm
    // sheetedSetup: {}  // (9-13-2023) Is this a time/feet/cost field? Rename accordingly after talking to Storm
    cuttingStockTime: {
        ...timeInSecondsAttribute
    },
    cuttingTearDownTime: {
        ...timeInSecondsAttribute
    },
    sheetedTearDownTime: {
        ...timeInSecondsAttribute
    },
    totalCuttingTime: {
        ...timeInSecondsAttribute
    },
    totalCuttingCost: {
        ...costAttribute
    },
    coreGatheringTime: {
        ...timeInSecondsAttribute
    },
    changeOverTime: {
        ...timeInSecondsAttribute
    },
    windingAllRollsTime: {
        ...timeInSecondsAttribute
    },
    labelDropoffAtShippingTime: {
        ...timeInSecondsAttribute
    },
    totalWindingTime: {
        ...timeInSecondsAttribute
    },
    throwAwayWindingTime: {
        ...timeInSecondsAttribute
    },
    totalFinishedRolls: {
        ...numberOfRollsAttribute
    },
    totalWindingCost: {
        ...costAttribute
    },
    totalCostOfMachineTime: {
        ...costAttribute
    },
    boxCreationTime: {
        ...timeInSecondsAttribute
    },
    packagingBoxTime: {
        ...timeInSecondsAttribute
    }
}, { timestamps: true });

const estimatedTicket = mongoose.model('EstimatedTicket', estimatedTicketSchema);

module.exports = estimatedTicket;