import mongoose from 'mongoose';
mongoose.Schema.Types.String.set('trim', true);
const Schema = mongoose.Schema;
import { getAllDepartments } from '../enums/departmentsEnum.ts';
import mongoose_delete from 'mongoose-delete';

function isDepartmentValid(department) {
    if (!getAllDepartments().includes(department)) {
        return false;
    }

    return true;
}

const HoldReasonSchema = new Schema({
    department: {
        type: String,
        validate: [isDepartmentValid, 'must be a valid department'],
        required: true
    },
    reason: {
        type: String,
        uppercase: true,
        required: true
    }
}, { timestamps: true });

HoldReasonSchema.plugin(mongoose_delete, {overrideMethods: true});

export const HoldReasonModel = mongoose.model('HoldReason', HoldReasonSchema);
