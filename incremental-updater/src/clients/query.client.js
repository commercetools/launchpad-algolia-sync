import { createApiRoot } from './create.client.js';

export const productQueryArgs = {
  staged: false,
  expand: ['productSelection', 'taxCategory', 'productType', 'categories[*]'],
};

export async function getProductProjectionById(productId) {
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
