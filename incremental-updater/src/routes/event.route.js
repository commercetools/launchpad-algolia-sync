import { Router } from 'express';

import { eventHandler as productEventHandler } from '../controllers/product.event.controller.js';
import CustomError from '../errors/custom.error.js';
import { logger } from '../utils/logger.utils.js';
import { decodeToJson } from '../utils/decoder.utils.js';
import {
  HTTP_STATUS_SUCCESS_ACCEPTED,
  HTTP_STATUS_BAD_REQUEST,
  HTTP_STATUS_SUCCESS_NO_CONTENT,
} from '../constants/http.status.constants.js';

const eventRouter = Router();

async function eventHandler(request, response) {
  try {
    // Check request body
    if (!request.body) {
      logger.error('Missing request body.');
      throw new CustomError(
        HTTP_STATUS_BAD_REQUEST,
        'Bad request: No Pub/Sub message was received'
      );
    }
    // Check if the body comes in a message
    if (!request.body.message || !request.body.message.data) {
      logger.error('Missing message data in incoming message');
      throw new CustomError(
        HTTP_STATUS_BAD_REQUEST,
        'Bad request: No message data in incoming message'
      );
    }

    const encodedMessageBody = request.body.message.data;
    const messageBody = decodeToJson(encodedMessageBody);
    const resourceType = messageBody?.resource?.typeId;

    switch (resourceType) {
      case 'product':
        await productEventHandler(request, response);
        break;
      case 'subscription': // Handle the ack once subscription is created after deployment
        logger.info(`Created subscription in Commercetools`);
        response.status(HTTP_STATUS_SUCCESS_NO_CONTENT).send();
        break;
      default:
        throw new CustomError(
          HTTP_STATUS_SUCCESS_ACCEPTED,
          'Resource type is not defined in incoming message data'
        );
    }
  } catch (err) {
    logger.error(err);
    if (err.statusCode) return response.status(err.statusCode).send(err);
    return response.status(500).send(err);
  }
}

eventRouter.post('/', eventHandler);

export default eventRouter;
