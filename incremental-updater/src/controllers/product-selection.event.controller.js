import { decodeToJson } from '../utils/decoder.utils.js';

import { doValidation } from '../validators/product-selection.validators.js';
import { HTTP_STATUS_SUCCESS_NO_CONTENT } from '../constants/http.status.constants.js';
import {
  saveChangedProductToExtSearchIndex,
  saveDeletedProductToExtSearchIndex,
} from './common.controller.js';

export const eventHandler = async (request, response) => {
  // Receive the Pub/Sub message
  const encodedMessageBody = request.body.message.data;
  const messageBody = decodeToJson(encodedMessageBody);
  await doValidation(messageBody);

  const type = messageBody.type;
  const productId = messageBody?.product?.id;
  switch (type) {
    case 'ProductSelectionVariantSelectionChanged':
      await saveChangedProductToExtSearchIndex(productId);
      break;
    case 'ProductSelectionProductRemoved':
      await saveDeletedProductToExtSearchIndex(productId);
      break;
    case 'ProductSelectionProductAdded':
      await saveChangedProductToExtSearchIndex(productId);
      break;
  }

  // Return the response for the client
  response.status(HTTP_STATUS_SUCCESS_NO_CONTENT).send();
};
