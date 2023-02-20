const mongoose = require('mongoose');
mongoose.Schema.Types.String.set('trim', true);
const Schema = mongoose.Schema;

URL_VALIDATION_REGEX = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/;

function validateUrl(url) {
    return URL_VALIDATION_REGEX.test(url);
}

const fileSchema = new Schema({
    url: {
        type: String,
        validate: [validateUrl, 'Invalid URL of "{VALUE}" resulted in a validation error'],
        required: true
    },
    fileName: {
        type: String,
        required: true
    }
}, { timestamps: true });

module.exports = fileSchema;