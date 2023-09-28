import { logger } from '../utils/logger.utils.js';
import {
  getProductsInCurrentStore,
  getProductProjectionInStoreById,
} from '../clients/query.client.js';
import CustomError from '../errors/custom.error.js';
import {
  default as saveProducts,
  removeProducts,
} from '../extensions/algolia-example/clients/client.js';
import {
  HTTP_STATUS_RESOURCE_NOT_FOUND,
  HTTP_STATUS_SUCCESS_ACCEPTED,
  HTTP_STATUS_BAD_REQUEST,
  HTTP_STATUS_SUCCESS_NO_CONTENT,
} from '../constants/http.status.constants.js';

async function syncProducts(storeKey) {
  let productsToBeSynced = [];
  const products = await getProductsInCurrentStore(storeKey);

  //Clean up search index before full sychronization
  const productIdsToBeRemoved = products.map((product) => product.id);
  await removeProducts(productIdsToBeRemoved);

  for (let productInCurrentStore of products) {
    let productToBeSynced = undefined;
    productToBeSynced = await getProductProjectionInStoreById(
      storeKey,
      productInCurrentStore.id
    ).catch(async (error) => {
      // Product cannot be found in store assignment. Need to remove product in external search index
      if (error.statusCode === HTTP_STATUS_RESOURCE_NOT_FOUND) {
        logger.info(
          `Product "${productInCurrentStore.id}" is not found in the current store. The product will not be synchronized to the search index.`
        );
      } else {
        throw new CustomError(
          HTTP_STATUS_SUCCESS_ACCEPTED,
          error.message,
          error
        );
      }
    });

    // Check if product ID has already been existing in the list
    if (productToBeSynced) {
      const isDuplicatedProduct =
        productsToBeSynced.filter(
          (product) => product.id === productToBeSynced.id
        ).length > 0;
      if (isDuplicatedProduct)
        logger.info(`${productToBeSynced.id} is duplicated.`);
      if (!isDuplicatedProduct)
        productsToBeSynced = productsToBeSynced.concat(productToBeSynced);
    }
  }

  if (productsToBeSynced.length > 0) {
    logger.info(
      `${productsToBeSynced.length} product(s) to be synced to search index.`
    );
    await saveProducts(productsToBeSynced).catch((error) => {
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
    const storeKey = request.params.storeKey;
    if (!storeKey) {
      logger.error('Missing store key in query parameter.');
      throw new CustomError(
        HTTP_STATUS_BAD_REQUEST,
        'Bad request: No store key is defined in query parameter'
      );
    }
    await syncProducts(storeKey);
  } catch (err) {
    logger.error(err);
    if (err.statusCode) return response.status(err.statusCode).send(err);
    return response.status(500).send(err);
  }

  // Return the response for the client
  return response.status(HTTP_STATUS_SUCCESS_NO_CONTENT).send();
};
