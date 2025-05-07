import 'dotenv/config';
import express from 'express';
import expressLayouts from 'express-ejs-layouts';
import mongoose from 'mongoose';
import { connectToMongoDatabase } from './services/databaseService.ts';
import cookieParser from 'cookie-parser';
import flash from 'connect-flash';
import session from 'express-session';
import fs from 'fs';
import ejsService from './services/ejsService.ts';
import httpServ from 'http';
import { Server } from 'socket.io';
import customWebSockets from './services/websockets/init.ts';
import { setupApiRoutes } from './routes.ts'
import { connectToTestDatabase } from '../../test/sharedTestDatabase';

if (process.env.NODE_ENV === 'test') {
    connectToTestDatabase();
} else {
    connectToMongoDatabase(process.env.MONGO_DB_URL);
}
const databaseConnection = mongoose.connection;

const defaultPort = 8080;
const cypressPort = 8069;
const PORT = process.env.NODE_ENV === 'test' ? cypressPort : (process.env.PORT || defaultPort);

if (!PORT) throw new Error('PORT is not set');

const app = express();

app.locals.helperMethods = ejsService;

const httpServer = new httpServ.Server(app);
const socket = new Server(httpServer);
customWebSockets(socket); // Initalize sockets listeners/emitters

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

const publicDirectory = 'application/public'
const ejsViewsDirectory = 'application/views'
const ejsLayoutFilename = 'layout.ejs'

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

app.use(express.static(reactBuildFolderPath));  // Sets up React

/* Defines every HTTP route the API provides */ 
setupApiRoutes(app)

// This route loads the ENTIRE REACT APP
app.use('/react-ui', (_, response) => response.render('app.ejs'));

databaseConnection.on('error', (error) => {
    /* 
      If we're running in a test environment, we expect the database connection to fail sometimes by design
      so do nothing.
    */
    if (process.env.NODE_ENV !== 'test') {
        throw new Error(`Error connecting to the database: ${error}`);
    }
});

databaseConnection.on('open', () => {
    httpServer.listen(PORT, () => {
        console.log(`Server started listening on PORT ${PORT}. Visit http://localhost:${PORT} in your browser`);
    });
});
