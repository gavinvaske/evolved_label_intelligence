import { SortDirection, SortOption } from "@shared/types/mongoose.ts";
import { MongooseId } from "@shared/types/typeAliases.ts";


export function getObjectIds<T extends { _id: MongooseId }>(objects: T[]): MongooseId[] {
    return objects.map(({_id}) => {
        return _id;
    });
}

export function parseHumanReadableMessages(error) {
    try {
        const aNonMongooseErrorOccurred = !error.errors && error.message;

        if (aNonMongooseErrorOccurred) {
            return [error.message];
        }

        let humanReadableMessages = [];
        const {errors} = error;

        Object.keys(errors).forEach((key) => {
            const mongooseError = errors[key];
            const errorType = mongooseError['name'];
            let humanReadableMessage;

            if (errorType === 'ValidatorError') {
                humanReadableMessage = `${mongooseError['message']}`;
            } else {
                humanReadableMessage = `'${errorType}': ${mongooseError['message']}`;
            }
            humanReadableMessages.push(humanReadableMessage);
        });

        return humanReadableMessages;
    } catch (error) {
        console.log(`Error: parse error in parseHumanReadableMessages: ${JSON.stringify(error)}`);
        return ['Uh oh, an unknown error occurred, please contact the IT department.'];
    }
}

export const getSortOption = (sortOption: string | undefined, sortDirection: '1' | '-1' | 1 | -1 | undefined): SortOption => {
  if (!sortOption || !sortDirection) return {}

  if (typeof sortDirection ==='string') {
    return { 
      [sortOption]: parseInt(sortDirection) as SortDirection 
    };
  }

  return { 
    [sortOption]: sortDirection 
  };
}