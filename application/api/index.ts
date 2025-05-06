import 'dotenv/config';
import express from 'express';
import expressLayouts from 'express-ejs-layouts';
import mongoose from 'mongoose';
import { connectToMongoDatabase } from './services/databaseService.ts';
import { getTestDatabaseUri, closeTestDatabase } from '../../test/sharedTestDatabase';
import cookieParser from 'cookie-parser';
import flash from 'connect-flash';
import session from 'express-session';
import fs from 'fs';
import ejsService from './services/ejsService.ts';
import httpServ from 'http';
import { Server } from 'socket.io';
import customWebSockets from './services/websockets/init.ts';
import { setupApiRoutes } from './routes.ts'
import { UserModel } from './models/user.ts';
import { DeliveryMethodModel } from './models/deliveryMethod.ts';

async function initializeServer() {
  const defaultPort = 8080;
  const PORT = process.env.PORT || defaultPort;

  const app = express();
  const httpServer = new httpServ.Server(app);
  const socket = new Server(httpServer);

  // Set up database connection event handlers BEFORE connecting
  mongoose.connection.on('error', (error) => {
    console.error('Database connection error:', error);
    process.exit(1);
  });

  mongoose.connection.on('open', () => {
    console.log('Database connection established');
    httpServer.listen(PORT, () => {
      console.log(`Server started listening on PORT ${PORT}. Visit http://localhost:${PORT} in your browser`);
    });
  });

  // Set up cleanup on process termination
  process.on('SIGINT', async () => {
    console.log('Shutting down server...');
    if (process.env.NODE_ENV === 'test') {
      await closeTestDatabase();
    }
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('Shutting down server...');
    if (process.env.NODE_ENV === 'test') {
      await closeTestDatabase();
    }
    process.exit(0);
  });

  // Remove the test database URI file if it exists
  if (fs.existsSync('./test-db-uri.txt')) {
    fs.unlinkSync('./test-db-uri.txt');
  }

  // Now connect to the database
  console.log(`Connecting to ${process.env.NODE_ENV === 'test' ? 'test' : 'production'} database...`);
  await connectToMongoDatabase();

  // In test mode, log the database URI for Cypress to use
  if (process.env.NODE_ENV === 'test') {
    // removing the old URI file
    console.log('Removing old test database URI file...');

    console.log('Old test database URI file removed');
    const dbUri = await getTestDatabaseUri();
    console.log('API created test database with URI:', dbUri);
    const users = await UserModel.find({}).lean();
    await DeliveryMethodModel.create({ name: 'index.ts' })
    const deliveryMethods = await DeliveryMethodModel.find({}).lean();
    console.log('users in API database:', users);
    console.log('delivery methods in API database:', deliveryMethods);
  }

  // Set up the rest of the Express app
  app.locals.helperMethods = ejsService;
  customWebSockets(socket);

  app.use(expressLayouts);
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true
  }));

  app.use(flash());
  app.use((request, response, next) => {
    response.locals.errors = request.flash('errors');
    response.locals.alerts = request.flash('alerts');
    next();
  });

  const publicDirectory = 'application/public';
  const ejsViewsDirectory = 'application/views';
  const ejsLayoutFilename = 'layout.ejs';

  app.use(express.static(publicDirectory));

  if (!fs.existsSync(publicDirectory)) {
    throw new Error('Public folder does not exist, cannot render any .ejs views and/or css styles for those pages');
  }

  app.set('view engine', 'ejs');
  app.set('views', ejsViewsDirectory);
  app.set('layout', ejsLayoutFilename);

  const reactBuildFolderPath = './build';

  if (!fs.existsSync(reactBuildFolderPath)) {
    throw new Error('React build folder does not exist. Please run `npm run build` and try again.');
  }

  app.use(express.static(reactBuildFolderPath));
  setupApiRoutes(app);
  app.use('/react-ui', (_, response) => response.render('app.ejs'));
}

initializeServer().catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
