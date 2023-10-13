import { createApiRoot } from './create.client.js';
import CustomError from '../errors/custom.error.js';
import { HTTP_STATUS_BAD_REQUEST } from '../constants/http.status.constants.js';

const CHUNK_SIZE = 100;
const queryArgs = {
  limit: CHUNK_SIZE,
  withTotal: false,
  sort: 'id asc',
  expand: ['productSelection', 'taxCategory', 'productType', 'categories[*]'],
};

export async function getProductProjections() {
  let lastProductId = undefined;
  let hasNextQuery = true;
  let allProducts = [];

  while (hasNextQuery) {
    if (lastProductId) {
      queryArgs.where = `id>"${lastProductId}"`;
    }

    let productChunk = await createApiRoot()
      .productProjections()
      .get({ queryArgs })
      .execute()
      .then((response) => response.body.results)
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
