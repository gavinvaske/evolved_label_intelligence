const mongoose = require('mongoose');
const { convertDollarsToPennies, convertPenniesToDollars } = require('../services/currencyService');
mongoose.Schema.Types.String.set('trim', true);
const Schema = mongoose.Schema;

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
    min: 0
};

const costAttribute = {
    type: Number,
    min: 0,
    set: convertDollarsToPennies,
    get: convertPenniesToDollars
};

// const percentageAttribute = {}   // TODO (9-13-2023): Finish this after talking to Storm
// const msiAttribute = {}  // TODO (9-13-2023): Finish this after talking to Storm

const estimatedTicketSchema = new Schema({
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
    // totalStockMsi: {
    //     ...msiAttribute
    // },
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
}, { 
    timestamps: true,
    strict: 'throw'
});

module.exports = estimatedTicketSchema;