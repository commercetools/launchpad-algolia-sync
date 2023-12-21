import algoliasearch from 'algoliasearch';
import { config } from '../configurations/config.js';
import { constants } from '../configurations/constants.js';

import { default as productMapping } from '../mappers/product.mapper.js';
import { logger } from '../../../utils/logger.utils.js';

export const remove = async (objectID) => {
  const client = algoliasearch(config.applicationId, config.searchApiKey);
  const index = client.initIndex(config.index);
  await index.deleteObject(objectID);
};

export const removeProducts = async () => {
  const client = algoliasearch(config.applicationId, config.searchApiKey);
  const index = client.initIndex(config.index);
  try {
    await index.clearObjects;
  } catch (e) {
    logger.error(`Error clearing objects(Products) from Index, Skipping the step!!`, e);
  }
};

export default async function save(products, locale) {
  let productChunks = [];

  const client = algoliasearch(config.applicationId, config.searchApiKey);
  const index = client.initIndex(config.index);

  for (const product of products) {
    productChunks.push(productMapping(product, locale));
    if (
      productChunks.length === constants.CHUNK_LIMIT ||
      product === products[products.length - 1]
    ) {
      await index
        .saveObjects(productChunks, { autoGenerateObjectIDIfNotExist: false })
        .then(() => {
          productChunks = [];
        });
    }
  }
}
