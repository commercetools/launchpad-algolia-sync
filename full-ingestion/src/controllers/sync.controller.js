import { logger } from '../utils/logger.utils.js';
import { getProductProjections } from '../clients/query.client.js';
import CustomError from '../errors/custom.error.js';
import {
  default as saveProducts,
  removeProducts,
} from '../extensions/algolia-example/clients/client.js';
import {
  HTTP_STATUS_BAD_REQUEST,
  HTTP_STATUS_SUCCESS_NO_CONTENT,
} from '../constants/http.status.constants.js';
import { readConfiguration } from '../utils/config.utils.js';

async function syncProducts() {
  const locale = readConfiguration().locale;
  const productProjectionsToBeSynced = await getProductProjections();

  //Clean up search index before full sychronization
  await removeProducts();

  logger.info(
    `${productProjectionsToBeSynced.length} product(s) to be synced to search index.`
  );

  if (productProjectionsToBeSynced.length > 0) {
    await saveProducts(productProjectionsToBeSynced, locale).catch((error) => {
      throw new CustomError(
        HTTP_STATUS_BAD_REQUEST,
        `Bad request: ${error.message}`,
        error
      );
    });
    logger.info(`Product(s) has been added/updated to to search index.`);
  }
}

export const syncHandler = async (request, response) => {
  try {
    await syncProducts();
  } catch (err) {
    logger.error(err);
    if (err.statusCode) return response.status(err.statusCode).send(err);
    return response.status(500).send(err);
  }

  // Return the response for the client
  return response.status(HTTP_STATUS_SUCCESS_NO_CONTENT).send();
};
