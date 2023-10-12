import { createApiRoot } from './create.client.js';

export const CHUNK_SIZE = 100;
export const productQueryArgs = {
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
    .get({ productQueryArgs })
    .execute()
    .then((response) => {
      return response.body;
    });
}

export async function getProductProjectionInStoreById(productId) {
  const queryArgs = productQueryArgs;
  return await createApiRoot()
    .inStoreKeyWithStoreKeyValue({
      storeKey: Buffer.from(process.env.CTP_STORE_KEY).toString(),
    })
    .productProjections()
    .withId({
      ID: Buffer.from(productId).toString(),
    })
    .get({ queryArgs })
    .execute()
    .then((response) => getProductProjectionById(response.body.id));
}
