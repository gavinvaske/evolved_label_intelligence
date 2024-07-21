import { Router } from 'express'
const router = Router();
import { verifyJwtToken }from '../middleware/authorize.js'
const DeliveryMethodModel = require('../models/deliveryMethod');
const { SUCCESS, SERVER_ERROR, BAD_REQUEST, CREATED_SUCCESSFULLY } = require('../enums/httpStatusCodes');

router.use(verifyJwtToken);

router.get('/', async (_, response) => {
    try {
        const deliveryMethods = await DeliveryMethodModel.find().exec();

        return response.send(deliveryMethods);
    } catch (error) {
        return response.status(SERVER_ERROR).send(error.message);
    }
});

router.patch('/:mongooseId', async (request, response) => {
    try {
        const updatedDeliveryMethod = await DeliveryMethodModel.findOneAndUpdate(
            { _id: request.params.mongooseId }, 
            { $set: request.body }, 
            { runValidators: true, new: true }
        ).exec();

        return response.json(updatedDeliveryMethod);
    } catch (error) {
        console.error('Failed to update deliveryMethod: ', error);

        response
            .status(SERVER_ERROR)
            .send(error.message);
    }
});

router.post('/', async (request, response) => {
    let savedDeliveryMethod;

    try {
        savedDeliveryMethod = await DeliveryMethodModel.create(request.body);

        return response.status(CREATED_SUCCESSFULLY).send(savedDeliveryMethod);
    } catch (error) {
        console.error('Failed to create deliveryMethod', error);

        return response.status(BAD_REQUEST).send(error.message);
    }
});

router.delete('/:mongooseId', async (request, response) => {
    try {
        const deletedDeliveryMethod = await DeliveryMethodModel.findByIdAndDelete(request.params.mongooseId).exec();
        
        return response.status(SUCCESS).json(deletedDeliveryMethod);
    } catch (error) {
        console.error('Failed to delete deliveryMethod: ', error);

        return response.status(SERVER_ERROR).send(error.message);
    }
});

router.get('/:mongooseId', async (request, response) => {
    try {
        const deliveryMethod = await DeliveryMethodModel.findById(request.params.mongooseId);

        return response.json(deliveryMethod);
    } catch (error) {
        console.error('Error searching for deliveryMethod: ', error);

        return response
            .status(SERVER_ERROR)
            .send(error.message);
    }
});

module.exports = router;