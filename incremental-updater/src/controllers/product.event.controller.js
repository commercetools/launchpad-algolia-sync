import { decodeToJson } from '../utils/decoder.utils.js';
import { logger } from '../utils/logger.utils.js';
import { HTTP_STATUS_SUCCESS_NO_CONTENT } from '../constants/http.status.constants.js';
import { doValidation } from '../validators/product.validators.js';
import {
  saveChangedProductToExtSearchIndex,
  saveDeletedProductToExtSearchIndex,
} from './common.controller.js';

export const eventHandler = async (request, response) => {
  // Receive the Pub/Sub message
  const encodedMessageBody = request.body.message.data;
  const messageBody = decodeToJson(encodedMessageBody);

  if (messageBody) {
    const notificationType = messageBody.notificationType;
    const productId = messageBody.resource.id;

    await doValidation(messageBody);
    logger.info(
      `sync product ${productId} with notification type ${notificationType}`
    );
    switch (notificationType) {
      case 'ResourceUpdated':
        await saveChangedProductToExtSearchIndex(productId);
        break;
      case 'ResourceCreated':
        await saveChangedProductToExtSearchIndex(productId);
        break;
      case 'ResourceDeleted':
        await saveDeletedProductToExtSearchIndex(productId);
        break;
    }
  }

  // Return the response for the client
  response.status(HTTP_STATUS_SUCCESS_NO_CONTENT).send();
};
