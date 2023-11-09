const { howManyCirclesCanFitInThisSquare } = require('../enums/circlesPerSquareEnum');
const isNil = require('lodash.isnil');

const ONE_EIGHTH_INCH = 0.125;

module.exports.getNumberOfLayers = (boxHeight, rollHeight) => {
    if (rollHeight > boxHeight) {
        return 0;
    }
    const buffer = ONE_EIGHTH_INCH;
    const boxHeightMinusBuffer = boxHeight - buffer;

    return Math.floor(boxHeightMinusBuffer / rollHeight);
};

module.exports.getRollsPerLayer = (rollDiameter, boxSideLength) => {
    if (rollDiameter > boxSideLength) {
        return 0;
    }
    const buffer = ONE_EIGHTH_INCH;
    const rollDiameterPlusBuffer = rollDiameter + buffer;

    return howManyCirclesCanFitInThisSquare(rollDiameterPlusBuffer, boxSideLength);
};

module.exports.getNumberOfBoxes = (rollsPerBox, numberOfRolls) => {
    if (isNil(rollsPerBox) || isNil(numberOfRolls)) return null;

    return Math.ceil(numberOfRolls / rollsPerBox);
};