const mongoose = require('mongoose');
mongoose.Schema.Types.String.set('trim', true);
const Schema = mongoose.Schema;
const fileSchema = require('../schemas/s3File');
const destinationSchema = require('../schemas/destination');
const departmentsEnum = require('../enums/departmentsEnum');

function isValidDieLineDestination(destination) {
    const {department, departmentStatus} = destination;

    if (!destination.department && !destination.departmentStatus) return false;

    const validDepartmentStatuses = departmentsEnum.departmentToDepartmentStatusesForDieLineRequests[department];

    if (!validDepartmentStatuses) return false;

    if (validDepartmentStatuses.length === 0) { 
        return !departmentStatus;
    };
    
    return validDepartmentStatuses.includes(departmentStatus);
}

const dieLineSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: false
    },
    fileUploads: {
        type: [fileSchema],
        required: false
    },
    destination: {
        type: destinationSchema,
        required: false,
        validate: [isValidDieLineDestination, 'A "Die Line Request" cannot be moved to the following destination: {VALUE}']
    }
}, { timestamps: true });

const DieLine = mongoose.model('DieLine', dieLineSchema);

module.exports = DieLine;