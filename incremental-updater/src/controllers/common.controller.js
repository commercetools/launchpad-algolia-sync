import { logger } from '../utils/logger.utils.js';
import {
  default as saveProducts,
  remove as removeProduct,
} from '../extensions/algolia-example/clients/client.js';
import { getProductProjectionInStoreById } from '../clients/common.query.client.js';
import { HTTP_STATUS_RESOURCE_NOT_FOUND } from '../constants/http.status.constants.js';

export async function saveChangedProductToExtSearchIndex(productId) {
  const productProjectionToBeSynced = await getProductProjectionInStoreById(
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
    await saveProducts([productProjectionToBeSynced]);
    logger.info(`Product "${productId}" has been added/updated.`);
  }
}

export async function saveDeletedProductToExtSearchIndex(productId) {
  const productProjectionToBeRemoved = await getProductProjectionInStoreById(
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
