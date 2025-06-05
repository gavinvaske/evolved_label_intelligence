import mongoose from 'mongoose';
mongoose.Schema.Types.String.set('trim', true);
const Schema = mongoose.Schema;
import { addressSchema } from '../schemas/address.ts';
import { FACTORY_ADDRESS } from '../enums/constantsEnum.ts';
import { validatePhoneNumber } from '../services/dataValidationService.ts';
import { convertDollarsToPennies, convertPenniesToDollars } from '../services/currencyService.ts';

import mongooseDelete from 'mongoose-delete';
mongoose.plugin(mongooseDelete, { overrideMethods: true });

async function generatePackingSlipNumber() {
    const numberOfPackingSlipsInDatabase = await PackingSlipModel.countDocuments({});
    const startingPackingSlipNumber = 7000;

    this.packingSlipNumber = startingPackingSlipNumber + numberOfPackingSlipsInDatabase;
}

const DEFAULT_NAME_OF_SENDER = 'The Label Advantage';


const packingSlipSchema = new Schema({
    packingSlipNumber: {
        type: Number,
        index: true
    },
    nameOfSender: {
        type: String,
        default: DEFAULT_NAME_OF_SENDER
    },
    senderAddress: {
        type: addressSchema,
        default: FACTORY_ADDRESS
    },
    senderPhoneNumber: {
        type: String,
        validate: [validatePhoneNumber, 'must be a valid phone number']
    },
    nameOfReceiver: {
        type: String
    },
    receiverAddress: {
        type: addressSchema,
    },
    deliveryMethod: {
        type: Schema.Types.ObjectId,
        ref: 'DeliveryMethod'
    },
    shippingCarrier: {
        type: String,
        uppercase: true
    },
    numberOfBoxes: {
        type: Number,
        validate: [Number.isInteger, 'must be an integer'],
        min: 0,
    },
    weight: {
        type: Number,
        min: 0
    },
    freightCost: {
        type: Number,
        min: 0,
        get: convertPenniesToDollars,
        set: convertDollarsToPennies,
    },
    trackingNumber: {
        type: String
    },
    packingSlipDateTime: {
        type: Date,
        default: Date.now
    },
    freightAccountNumber: {
        type: String
    },
}, { timestamps: true });

packingSlipSchema.pre('save', generatePackingSlipNumber);

export const PackingSlipModel = mongoose.model('PackingSlip', packingSlipSchema);


