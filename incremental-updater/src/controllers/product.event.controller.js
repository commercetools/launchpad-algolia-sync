import { decodeToJson } from '../utils/decoder.utils.js';
import { logger } from '../utils/logger.utils.js';
import { HTTP_STATUS_SUCCESS_NO_CONTENT } from '../constants/http.status.constants.js';
import { doValidation } from '../validators/product.validators.js';

import { getProductProjectionById } from '../clients/query.client.js';
import { HTTP_STATUS_RESOURCE_NOT_FOUND } from '../constants/http.status.constants.js';
import {
  default as saveProducts,
  remove as removeProduct,
} from '../extensions/algolia-example/clients/client.js';
import { readConfiguration } from '../utils/config.utils.js';

async function saveChangedProductToExtSearchIndex(productId, locale) {
  const productProjectionToBeSynced = await getProductProjectionById(
    productId
  ).catch(async (error) => {
    if (error.statusCode === HTTP_STATUS_RESOURCE_NOT_FOUND) {
      logger.info(
        `The changed product "${productId}" is not assigned to the current store "${process.env.CTP_STORE_KEY}. Product(s) is going to be removed from search index.`
      );
      await removeProduct(productId);
      logger.info(`Product "${productId}" has been removed.`);
    }
  });

  if (productProjectionToBeSynced) {
    logger.info(
      `The changed product "${productId}" is assigned to the current store ${process.env.CTP_STORE_KEY}. Sync action is going to be performed now.`
    );
    await saveProducts([productProjectionToBeSynced], locale);
    logger.info(`Product "${productId}" has been added/updated.`);
  }
}

async function saveDeletedProductToExtSearchIndex(productId) {
  const productProjectionToBeRemoved = await getProductProjectionById(
    productId
  );

  if (productProjectionToBeRemoved)
    logger.info(
      `Product "${productId}" is still in other product selections of current store. No deletion action is required.`
    );
  else {
    await removeProduct(productId);
    logger.info(`Product "${productId}" has been removed.`);
  }
}

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
    const locale = readConfiguration().locale;
    switch (notificationType) {
      case 'ResourceUpdated':
        await saveChangedProductToExtSearchIndex(productId, locale);
        break;
      case 'ResourceCreated':
        await saveChangedProductToExtSearchIndex(productId, locale);
        break;
      case 'ResourceDeleted':
        await saveDeletedProductToExtSearchIndex(productId);
        break;
    }
  }

  // Return the response for the client
  response.status(HTTP_STATUS_SUCCESS_NO_CONTENT).send();
};
