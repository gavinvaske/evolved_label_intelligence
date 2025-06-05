import { Router, Request, Response, RequestHandler } from 'express';
import { verifyBearerToken } from '../middleware/authorize.ts';
import { DeliveryMethodModel } from '../models/deliveryMethod.ts';
import { SUCCESS, CREATED_SUCCESSFULLY } from '../enums/httpStatusCodes.ts';

const router = Router();
router.use(verifyBearerToken);

router.get('/', (async (_: Request, response: Response) => {
  const deliveryMethods = await DeliveryMethodModel.find().exec();

  response.send(deliveryMethods);
}) as RequestHandler);

router.patch('/:mongooseId', (async (request: Request, response: Response) => {
  const updatedDeliveryMethod = await DeliveryMethodModel.findOneAndUpdate(
    { _id: request.params.mongooseId },
    { $set: request.body },
    { runValidators: true, new: true }
  ).exec();

  response.json(updatedDeliveryMethod);
}) as RequestHandler);

router.post('/', (async (request: Request, response: Response) => {
  const savedDeliveryMethod = await DeliveryMethodModel.create(request.body);

  response.status(CREATED_SUCCESSFULLY).send(savedDeliveryMethod);
}) as RequestHandler);

router.delete('/:mongooseId', (async (request: Request, response: Response) => {
  const deletedDeliveryMethod = await DeliveryMethodModel.deleteById(request.params.mongooseId, request.user._id);

  response.status(SUCCESS).json(deletedDeliveryMethod);
}) as RequestHandler);

router.get('/:mongooseId', (async (request: Request, response: Response) => {
  const deliveryMethod = await DeliveryMethodModel.findById(request.params.mongooseId);

  response.json(deliveryMethod);
}) as RequestHandler);

export default router;