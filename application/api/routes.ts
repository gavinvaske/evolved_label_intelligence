import defaultRoute from './controllers/index.ts';
import userEndpoints from './controllers/userController.ts';
import materialEndpoints from './controllers/materialController.ts';
import vendorEndpoints from './controllers/vendorController.ts';
import materialOrderEndpoints from './controllers/materialOrdersController.ts';
import productEndpoints from './controllers/productController.ts';
import materialCategoryEndpoints from './controllers/materialCategoryController.ts';
import quoteEndpoints from './controllers/quoteController.ts';
import dieEndpoints from './controllers/dieController.ts';
import linerTypeEndpoints from './controllers/linerTypeController.ts';
import adhesiveCategoryEndpoints from './controllers/adhesiveCategoryController.ts';
import materialLengthAdjustmentEndpoints from './controllers/materialLengthAdjustmentController.ts';
import customerEndpoints from './controllers/customerController.ts';
import deliveryMethodEndpoints from './controllers/deliveryMethodController.ts';
import creditTermEndpoints from './controllers/creditTermsController.ts';
import authEndpoints from './controllers/authController.ts'
import { Application } from 'express';
import { errorHandler } from './errorHandler.ts';

export const setupApiRoutes = (app: Application) => {
  app.use('/auth', authEndpoints);
  app.use('/', defaultRoute);
  app.use('/users', userEndpoints);
  app.use('/materials', materialEndpoints);
  app.use('/vendors', vendorEndpoints);
  app.use('/material-orders', materialOrderEndpoints);
  app.use('/products', productEndpoints);
  app.use('/material-categories', materialCategoryEndpoints);
  app.use('/quotes', quoteEndpoints);
  app.use('/dies', dieEndpoints);
  app.use('/liner-types', linerTypeEndpoints);
  app.use('/adhesive-categories', adhesiveCategoryEndpoints);
  app.use('/material-length-adjustments', materialLengthAdjustmentEndpoints);
  app.use('/customers', customerEndpoints);
  app.use('/delivery-methods', deliveryMethodEndpoints);
  app.use('/credit-terms', creditTermEndpoints);
  app.use(errorHandler);  // Error handler must be last middleware
}
