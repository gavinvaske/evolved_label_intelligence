import mongoose, { Schema } from 'mongoose';
import { Decimal } from 'decimal.js';
import MongooseDelete, { SoftDeleteModel } from 'mongoose-delete';
import { IMaterial } from '@shared/types/models.ts';
import { MongooseHooks } from '../constants/mongoose.ts';
import { populateMaterialInventories } from '../services/materialInventoryService.ts';

/* Trim all strings and enable soft deletes */
mongoose.Schema.Types.String.set('trim', true);
mongoose.plugin(MongooseDelete, { overrideMethods: true, deletedBy: true, deletedAt: true });

const FOUR_DECIMAL_PLACES = 4;

// For help deciphering these regex expressions, visit: https://regexr.com/
const URL_VALIDATION_REGEX = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/;
const LOCATION_REGEX = /^[a-zA-Z][1-9][0-9]?$/;

function validateUrl(url) {
    return URL_VALIDATION_REGEX.test(url);
}

function validateLocationsFormat(locations) {
  return locations.every((location) => {
    return LOCATION_REGEX.test(location)
  });
}

function validateLocationsAreUnique(locations) {
  return new Set(locations).size === locations.length;
}

function roundNumberToNthDecimalPlace(nthDecimalPlaces) {
    return function (number) {
        const moreAccurateNumber = new Decimal(number);

        return moreAccurateNumber.toFixed(nthDecimalPlaces);
    };
}

const weightPerMsiAttribute = {
    type: Number,
    min: 0,
    set: roundNumberToNthDecimalPlace(FOUR_DECIMAL_PLACES),
};

const schema = new Schema<IMaterial>({
    name: {
        type: String,
        required: true,
        uppercase: true
    },
    materialId: {
        type: String,
        required: true,
        uppercase: true
    },
    vendor: {
        type: Schema.Types.ObjectId,
        ref: 'Vendor',
        required: true
    },
    materialCategory: {
        type: Schema.Types.ObjectId,
        ref: 'MaterialCategory',
        required: true
    },
    thickness: {
        type: Number,
        required: true,
        min: 0
    },
    weight: {
        type: Number,
        required: true,
        min: 0
    },
    costPerMsi: {
        type: Number,
        required: true,
        min: 0,
        set: roundNumberToNthDecimalPlace(FOUR_DECIMAL_PLACES)
    },
    freightCostPerMsi: {
        type: Number,
        required: true,
        min: 0,
        set: roundNumberToNthDecimalPlace(FOUR_DECIMAL_PLACES)
    },
    width: {
        type: Number,
        required: true,
        min: 0
    },
    faceColor: {
        type: String,
        required: true
    },
    adhesive: {
        type: String,
        required: true
    },
    adhesiveCategory: {
        type: Schema.Types.ObjectId,
        ref: 'AdhesiveCategory',
        required: true
    },
    quotePricePerMsi: {
        type: Number,
        required: true,
        min: 0,
        set: roundNumberToNthDecimalPlace(FOUR_DECIMAL_PLACES)
    },
    description: {
        type: String,
        required: true
    },
    whenToUse: {
        type: String,
        required: true
    },
    alternativeStock: {
        type: String,
        required: false
    },
    length: {
        type: Number,
        required: true,
        validate : {
            validator : Number.isInteger,
            message: '{VALUE} is not an integer'
        },
        min: 0
    },
    facesheetWeightPerMsi: {
        ...weightPerMsiAttribute,
        required: true
    },
    adhesiveWeightPerMsi: {
        ...weightPerMsiAttribute,
        required: true
    },
    linerWeightPerMsi: {
        ...weightPerMsiAttribute,
        required: true
    },
    locations: {
        type: [String],
        uppercase: true,
        required: true,
        set: (locations: string[]) => locations.map(location => location.toUpperCase()),
        validate: [
          {
            validator: validateLocationsFormat,
            message: 'Each location must start with a letter and end with a number between 1 and 99 (Ex: C13).'
          },
          {
            validator: validateLocationsAreUnique,
            message: 'Each location must be unique (i.e no duplicates allowed).'
          }
        ]
    },
    linerType: {
        type: Schema.Types.ObjectId,
        ref: 'LinerType',
        required: true
    },
    productNumber: {
        type: String,
        uppercase: true,
        required: true
    },
    masterRollSize: {
        type: Number,
        required: true,
        validate : {
            validator : Number.isInteger,
            message: '{VALUE} is not an integer'
        },
        min: 1
    },
    image: {
        type: String,
        required: true,
        validate: [validateUrl, '{VALUE} is not a valid url']
    },
    lowStockThreshold: {
        type: Number,
        required: true,
        min: 0,
        validate : {
            validator : Number.isInteger,
            message: '{VALUE} is not an integer'
        },
    },
    lowStockBuffer: {
        type: Number,
        required: true,
        min: 0,
        validate : {
            validator : Number.isInteger,
            message: '{VALUE} is not an integer'
        },
    },
  inventory: {  // Denormalized attribute to optimize query performance
    netLengthAvailable: {
      type: Number
    },
    lengthArrived: {
      type: Number
    },
    lengthNotArrived: {
      type: Number
    },
    materialOrders: {
      ref: 'MaterialOrder',
      type: [Schema.Types.ObjectId],
    },
    sumOfLengthAdjustments: {
      type: Number
    },
    lengthAdjustments: {
      ref: 'MaterialLengthAdjustment',
      type: [Schema.Types.ObjectId],
    }
  }
}, {
    timestamps: true,
    strict: 'throw'
});

/* Unique index */
schema.index(
  { materialId: 1 },
  {
    unique: true,
    partialFilterExpression: { deleted: { $eq: false } }
  }
);

/* Hooks */
schema.post(MongooseHooks.Save, (doc: IMaterial) => populateMaterialInventories([doc._id.toString()]))

/* Model */
export const MaterialModel = mongoose.model<IMaterial, SoftDeleteModel<IMaterial>>('Material', schema);
