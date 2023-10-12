import { createApiRoot } from './create.client.js';
import CustomError from '../errors/custom.error.js';
import { HTTP_STATUS_BAD_REQUEST } from '../constants/http.status.constants.js';

const CHUNK_SIZE = 100;
const queryArgs = {
  limit: CHUNK_SIZE,
  withTotal: false,
  sort: 'product.id asc',
  expand: ['productSelection', 'taxCategory', 'productType', 'categories[*]'],
};

async function getProductProjectionById(productId) {
  return await createApiRoot()
    .productProjections()
    .withId({
      ID: Buffer.from(productId).toString(),
    })
    .get({ queryArgs })
    .execute()
    .then((response) => {
      return response.body;
    });
}

export async function getProductProjectionInStoreById(storeKey, productId) {
  return await createApiRoot()
    .inStoreKeyWithStoreKeyValue({
      storeKey: Buffer.from(storeKey).toString(),
    })
    .productProjections()
    .withId({
      ID: Buffer.from(productId).toString(),
    })
    .get({ queryArgs })
    .execute()
    .then((response) => getProductProjectionById(response.body.id)); // USD price is unexpectedly absent from inStoreKeyWithStoreKeyValue response, therefore it has to retrieve product projection once more as workaround before SDK is fixed.
}

export async function getProductsInCurrentStore(storeKey) {
  let lastProductId = undefined;
  let hasNextQuery = true;
  let allProducts = [];

  while (hasNextQuery) {
    if (lastProductId) {
      queryArgs.where = `product(id>"${lastProductId}")`;
    }

    let productChunk = await createApiRoot()
      .inStoreKeyWithStoreKeyValue({
        storeKey: Buffer.from(storeKey).toString(),
      })
      .productSelectionAssignments()
      .get({ queryArgs })
      .execute()
      .then((response) => response.body.results)
      .then((results) => results.map((result) => result.product))
      .catch((error) => {
        throw new CustomError(
          HTTP_STATUS_BAD_REQUEST,
          `Bad request: ${error.message}`,
          error
        );
      });
    hasNextQuery = productChunk.length == CHUNK_SIZE;
    if (productChunk.length > 0) {
      lastProductId = productChunk[productChunk.length - 1].id;
      allProducts = allProducts.concat(productChunk);
    }
  }
  return allProducts;
}
