import mongoose from 'mongoose';
mongoose.Schema.Types.String.set('trim', true);
const Schema = mongoose.Schema;

const URL_VALIDATION_REGEX = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/;

function validateUrl(url) {
    return URL_VALIDATION_REGEX.test(url);
}

const schema = new Schema({
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        unique: false,
        required: true
    },
    machine: {
        type: Schema.Types.ObjectId,
        ref: 'Machine',
        required: true
    },
    notes: {
        type: String
    },
    finish: {
        type: Schema.Types.ObjectId,
        ref: 'Finish',
        required: true
    },
    setupFeet: {
        type: Number,
        required: true
    },
    jobSpeed: {
        type: Number,
        required: true
    },
    video: {
        type: String,
        validate: [validateUrl, 'must be a valid url'],
        match: [URL_VALIDATION_REGEX, 'must be a valid url']
    },
    difficulty: {
        type: String,
        uppercase: true,
        enum: [
            'EASY',
            'MEDIUM',
            'HARD',
            'VERY DIFFICULT'
        ],
        required: true
    },
    recipe: {
        type: Schema.Types.ObjectId,
        ref: 'Recipe',
        required: true
    },
    alertTextBox: {
        type: String
    },
    defaultMachine: {
        type: Schema.Types.ObjectId,
        ref: 'Machine'
    }
}, { timestamps: true });

export const CuttingSetupModel = mongoose.model('CuttingSetup', schema);