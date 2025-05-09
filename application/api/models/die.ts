import mongoose from 'mongoose';
mongoose.Schema.Types.String.set('trim', true);
const Schema = mongoose.Schema;
import { dieShapes } from '../enums/dieShapesEnum.ts';
import { toolTypes } from '../enums/toolTypesEnum.ts';
import { dieVendors } from '../enums/dieVendorsEnum.ts';
import { dieMagCylinders } from '../enums/dieMagCylindersEnum.ts';
import { dieStatuses, ORDERED_DIE_STATUS, IN_STOCK_DIE_STATUS } from '../enums/dieStatusesEnum.ts';
import { convertDollarsToPennies, convertPenniesToDollars } from '../services/currencyService.ts';
import { IDie } from '@shared/types/models.ts';
import { DIE_NUMBER_PREFIXES } from '../enums/dieNumberPrefixEnum.ts';

import mongooseDelete from 'mongoose-delete';
mongoose.plugin(mongooseDelete, { overrideMethods: true });

const DIE_NUMBER_REGEX = /^(\d{4})$/;

function validateDieNumberFormat(dieNumber) {
    dieNumber = dieNumber.toUpperCase();
    const dieNumberParts = dieNumber.split('-');

    if (dieNumberParts.length !== 2) {
        return false;
    }

    const [prefix, number] = dieNumberParts;

    if (!prefix || !number) {
        return false;
    }

    const isValidPrefix = DIE_NUMBER_PREFIXES.includes(prefix);
    const isValidNumber = DIE_NUMBER_REGEX.test(number);

    return isValidPrefix && isValidNumber;
}

function setDieStatus(newStatus) {
    const previousStatus = this.status;
    const statusHasNotChanged = previousStatus === newStatus;

    if (statusHasNotChanged) return newStatus;

    if (newStatus === ORDERED_DIE_STATUS) this.orderDate = new Date();

    if (newStatus === IN_STOCK_DIE_STATUS) this.arrivalDate = new Date();

    return newStatus;
}

const schema = new Schema<IDie>({
    dieNumber: {
      type: String,
      required: true,
      validate: [validateDieNumberFormat, 'The provided dieNumber "{VALUE}" must be in the following format: characters followed a dash followed by numbers'],
      uppercase: true
    },
    shape: {
        type: String,
        required: true,
        enum: [...dieShapes],
        uppercase: true
    },
    sizeAcross: {
        type: Number,
        required: true,
        min: 0
    },
    sizeAround: {
        type: Number,
        required: true,
        min: 0
    },
    numberAcross: {
        type: Number,
        required: true,
        validate : {
            validator : Number.isInteger,
            message: '{VALUE} is not an integer'
        },
        min: 0
    },
    numberAround: {
        type: Number,
        required: true,
        validate : {
            validator : Number.isInteger,
            message: '{VALUE} is not an integer'
        },
        min: 0
    },
    gear: {
        type: Number,
        required: true,
        validate : {
            validator : Number.isInteger,
            message: '{VALUE} is not an integer'
        },
        min: 0
    },
    toolType: {
        type: String,
        required: true,
        uppercase: true,
        enum: [...toolTypes],
    },
    notes: {
        type: String,
        required: true
    },
    cost: { 
        type: Number,
        required: true,
        min: 0,
        get: convertPenniesToDollars,
        set: convertDollarsToPennies,
    },
    vendor: {
        type: String,
        required: true,
        uppercase: true,
        enum: [...dieVendors]
    },
    magCylinder: {
        type: Number,
        required: true,
        enum: [...dieMagCylinders]
    },
    cornerRadius: {
        type: Number,
        required: true,
        min: 0
    },
    topAndBottom: {
        type: Number,
        required: true
    },
    leftAndRight: {
        type: Number,
        required: true
    },
    spaceAcross: { // also known as "Col Space"
        type: Number,
        set: function (spaceAcross) {
            this.topAndBottom = spaceAcross / 2;
            return spaceAcross;
        },
        min: 0
    }, 
    spaceAround: { // also known as "Row Space"
        type: Number,
        set: function (spaceAround) {
            this.leftAndRight = spaceAround / 2;
            return spaceAround;
        },
        min: 0
    },
    facestock: {
        type: String,
        required: true
    },
    liner: {
        type: String,
        required: true
    },
    specialType: {
        type: String
    },
    serialNumber: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true,
        uppercase: true,
        enum: [...dieStatuses],
        set: setDieStatus
    },
    quantity: {
        type: Number,
        validate : {
            validator : Number.isInteger,
            message: '{VALUE} is not an integer'
        },
        min: 0,
        required: true,
    },
    orderDate: {
        type: Date
    },
    arrivalDate: {
        type: Date
    },
    isLamination: {
      type: Boolean
    }
}, { timestamps: true, strict: 'throw' });

schema.index({ dieNumber: 'text', serialNumber: 'text' });

export const DieModel = mongoose.model<IDie>('Die', schema);
