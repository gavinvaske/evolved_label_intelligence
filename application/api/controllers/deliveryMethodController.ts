import express, { Request, Response, RequestHandler } from 'express';
const router = express.Router();
import { verifyBearerToken } from '../middleware/authorize.ts';
import { DeliveryMethodModel } from '../models/deliveryMethod.ts';
import { SUCCESS, SERVER_ERROR, BAD_REQUEST, CREATED_SUCCESSFULLY } from '../enums/httpStatusCodes.ts';

router.use(verifyBearerToken);

router.get('/', (async (_: Request, response: Response) => {
  try {
    const deliveryMethods = await DeliveryMethodModel.find().exec();
    response.send(deliveryMethods);
  } catch (error) {
    response.status(SERVER_ERROR).send(error.message);
  }
}) as RequestHandler);

router.patch('/:mongooseId', (async (request: Request, response: Response) => {
  try {
    const updatedDeliveryMethod = await DeliveryMethodModel.findOneAndUpdate(
      { _id: request.params.mongooseId },
      { $set: request.body },
      { runValidators: true, new: true }
    ).exec();

    response.json(updatedDeliveryMethod);
  } catch (error) {
    console.error('Failed to update deliveryMethod: ', error);
    response.status(SERVER_ERROR).send(error.message);
  }
}) as RequestHandler);

router.post('/', (async (request: Request, response: Response) => {
  try {
    const savedDeliveryMethod = await DeliveryMethodModel.create(request.body);
    response.status(CREATED_SUCCESSFULLY).send(savedDeliveryMethod);
  } catch (error) {
    console.error('Failed to create deliveryMethod', error);
    response.status(BAD_REQUEST).send(error.message);
  }
}) as RequestHandler);

router.delete('/:mongooseId', (async (request: Request, response: Response) => {
  try {
    const deletedDeliveryMethod = await DeliveryMethodModel.deleteById(request.params.mongooseId, request.user._id);
    response.status(SUCCESS).json(deletedDeliveryMethod);
  } catch (error) {
    console.error('Failed to delete deliveryMethod: ', error);
    response.status(SERVER_ERROR).send(error.message);
  }
}) as RequestHandler);

router.get('/:mongooseId', (async (request: Request, response: Response) => {
  try {
    const deliveryMethod = await DeliveryMethodModel.findById(request.params.mongooseId);
    response.json(deliveryMethod);
  } catch (error) {
    console.error('Error searching for deliveryMethod: ', error);
    response.status(SERVER_ERROR).send(error.message);
  }
}) as RequestHandler);

export default router;