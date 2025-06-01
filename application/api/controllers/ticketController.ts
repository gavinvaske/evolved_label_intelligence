import { Router } from 'express';
const router = Router();
import { verifyBearerToken } from '../middleware/authorize.ts';
import { upload } from '../middleware/upload.ts';
import parser from 'xml2json';
import * as ticketService from '../services/ticketService.ts';
import { TicketModel } from '../models/ticket.ts';
import * as mongooseService from '../services/mongooseService.ts';
import { MaterialModel } from '../models/material.ts';
import {
    departmentToStatusesMappingForTicketObjects, 
    isInProgressDepartmentStatus, 
    removeDepartmentStatusesAUserIsNotAllowedToSelect
} from '../enums/departmentsEnum.ts';
import * as workflowStepService from '../services/workflowStepService.ts';
import * as dateTimeService from '../services/dateTimeService.ts';
import * as holdReasonService from '../services/holdReasonService.ts';
import * as fileService from '../services/fileService.ts';
import * as downtimeReasonService from '../services/downtimeReasonService.ts';
import * as destinationService from '../services/destinationService.ts';

router.use(verifyBearerToken);

const SERVER_ERROR_CODE = 500;
const INVALID_REQUEST_ERROR_CODE = 400;

router.get('/', async (request, response) => {
    const tickets = await TicketModel
        .find()
        .populate({path: 'destination.assignee'})
        .exec();

    console.log(tickets);

    const ticketsGroupedByDestination = destinationService.groupItemsByDestination(tickets);
    const departmentToHoldReasons = await holdReasonService.getDepartmentToHoldReasons();

    return response.render('viewTickets', {
        ticketsGroupedByDestination,
        departmentToHoldReasons,
        loggedInUser: request.user
    });
});

router.get('/in-progress/:ticketId', async (request, response) => {
    const ticketObjectId = request.params.ticketId;
    try {
        const ticket = await TicketModel.findById(ticketObjectId).exec();
        const downtimeReasons = await downtimeReasonService.getDowntimeReasons();

        const now = new Date();
        const ticketCreationDate = new Date(ticket.createdAt);
        const ageOfTicketInMilliseconds = dateTimeService.howManyMillisecondsHavePassedBetweenDateTimes(now, ticketCreationDate);
        const ageOfTicketInMinutes = dateTimeService.convertMillisecondsToMinutes(ageOfTicketInMilliseconds);

        if (!ticket) {
            throw new Error(`No ticket was found in the database whose object ID is "${ticketObjectId}"`);
        }

        if (!isInProgressDepartmentStatus(ticket.destination.departmentStatus)) {
            return response.status(INVALID_REQUEST_ERROR_CODE).send(`The requested ticket whose object ID is "${ticketObjectId}" does not have a department status of "in-progress"`);
        }

        return response.render('viewOneInProgressTicket', {
            ticket,
            ageOfTicket: dateTimeService.prettifyDuration(ageOfTicketInMinutes),
            downtimeReasons
        });
    } catch (error) {
        return response.status(SERVER_ERROR_CODE).send(error.message);
    }
});

router.post('/find-department-statuses', (request, response) => {
    const departmentName = request.body.departmentName;
    const allStatusesForOneDepartment = departmentToStatusesMappingForTicketObjects[departmentName];
    let userSelectableDepartmentStatuses;
    
    try {
        userSelectableDepartmentStatuses = removeDepartmentStatusesAUserIsNotAllowedToSelect(allStatusesForOneDepartment);

        if (!userSelectableDepartmentStatuses) {
            throw new Error(`No departmentStatuses found for the department named "${departmentName}"`);
        }
    } catch (error) {
        return response.json({
            error: error.message
        });
    }

    return response.json({
        departmentStatuses: userSelectableDepartmentStatuses
    });
});

router.patch('/:id', async (request, response) => {
    const ticketId = request.params.id;

    try {
        const updatedTicket = await TicketModel.findOneAndUpdate({_id: ticketId}, {$set: request.body}, {runValidators: true, new: true}).exec();
        response.send(updatedTicket);
    } catch (error) {
        console.log(`Failed to update ticket with id ${ticketId}. Error message: ${error.message}`);
        request.flash('errors', [error.message]);
        return response.status(SERVER_ERROR_CODE).send(error.message);
    }
});

router.get('/duration/:id', async (request, response) => {
    const ticketId = request.params.id;

    try {
        const ticket = await TicketModel.findById(ticketId).exec();
        const workflowStepTimeLedger = await workflowStepService.computeTimeTicketsHaveSpentInEachWorkflowStep([ticket._id]);

        const workflowStepTimeLedgerForTicket = workflowStepTimeLedger[ticketId];

        const department = ticket.destination.department;
        const departmentStatus = ticket.destination.departmentStatus;

        const overallDuration = workflowStepService.getOverallTicketDuration(workflowStepTimeLedgerForTicket);
        const productionDuration = workflowStepService.getHowLongTicketHasBeenInProduction(workflowStepTimeLedgerForTicket);
        const departmentDuration = workflowStepService.getHowLongTicketHasBeenInDepartment(workflowStepTimeLedgerForTicket, department);
        const listDuration = workflowStepService.getHowLongTicketHasHadADepartmentStatus(workflowStepTimeLedgerForTicket, department, departmentStatus);
        
        return response.json({
            'date-created': dateTimeService.getDate(ticket.createdAt),
            'overall-duration': dateTimeService.prettifyDuration(overallDuration),
            'production-duration': dateTimeService.prettifyDuration(productionDuration),
            'department-duration': dateTimeService.prettifyDuration(departmentDuration),
            'list-duration': dateTimeService.prettifyDuration(listDuration)
        });
    } catch (error) {
        console.log(`Failed to update ticket with id ${ticketId}. Error message: ${error.message}`);
        request.flash('errors', [error.message]);
        return response.status(SERVER_ERROR_CODE).send(error.message);
    }
});

router.get('/update/:id', async (request, response) => {
    try {
        const ticket = await TicketModel.findById(request.params.id).exec();
        const materials = await MaterialModel.find().exec();
        const departmentNames = Object.keys(departmentToStatusesMappingForTicketObjects);

        const ticketDestination = ticket.destination;
        const selectedDepartment = ticketDestination && ticketDestination.department;
        const selectedDepartmentStatus = ticketDestination && ticketDestination.departmentStatus;
        const selectedMaterial = ticket.primaryMaterial;

        const departmentStatuses = departmentToStatusesMappingForTicketObjects ? departmentToStatusesMappingForTicketObjects[selectedDepartment] : undefined;

        const materialIds = materials.map(material => material.materialId);

        response.render('updateTicket', {
            ticket,
            materialIds,
            departmentNames,
            selectedDepartment,
            selectedDepartmentStatus: selectedDepartmentStatus,
            departmentStatuses: departmentStatuses,
            selectedMaterial
        });
    } catch (error) {
        console.log(`Error rendering ticket update page: ${error.message}`);
        request.flash('errors', [error.message]);
        return response.redirect('back');
    }
});

router.get('/form', (request, response) => {
    response.render('createTicket');
});

router.post('/', upload.single('job-xml'), async (request, response) => {
    const xmlFile = fileService.getUploadedFile(request.file.filename);

    try {
        const rawUploadedTicketAsJson = JSON.parse(parser.toJson(xmlFile.fileContents))['Root'];

        ticketService.removeEmptyObjectAttributes(rawUploadedTicketAsJson);

        const ticketAttributes = ticketService.convertedUploadedTicketDataToProperFormat(rawUploadedTicketAsJson);

        const ticket = new TicketModel(ticketAttributes);

        await TicketModel.create(ticket);

        return response.redirect(`/tickets/update/${ticket._id}`);
    } catch (error) {
        console.log(`Error uploading job file: ${error}`);
        request.flash('errors', ['The following error(s) occurred while uploading the file:', ...mongooseService.parseHumanReadableMessages(error)]);
    
        return response.redirect('/tickets/form');
    } finally {
        fileService.deleteOneFileFromFileSystem(xmlFile);
    }
});

router.get('/:id', async (request, response) => {
    try {
        const ticket = await TicketModel
            .findById(request.params.id)
            .exec();

        const {responseDataType} = request.query;
        const shouldOnlyReturnTheJsonObject = responseDataType && responseDataType.toUpperCase() === 'JSON';

        if (shouldOnlyReturnTheJsonObject) {
            return response.json(ticket);
        }

        return response.render('viewOneTicket', {
            ticket
        });
    } catch (error) {
        console.log(error);
        request.flash('errors', ['An error occurred while loading the requested ticket:', error.message]);
        return response.redirect('back');
    }
});

router.post('/:ticketId/next-department', async (request, response) => {
    try {
        const {attempts, totalFramesRan, jobComment} = request.body;
        const ticket = await TicketModel.findById(request.params.ticketId).exec();

        ticketService.transitionTicketToNextDepartment(ticket, {
            attempts,
            totalFramesRan,
            jobComment
        });

        await ticket.save();

        return response.send();
    } catch (error) {
        console.log(error);
        response.status(INVALID_REQUEST_ERROR_CODE).send(error.message);
    }
});

export default router;