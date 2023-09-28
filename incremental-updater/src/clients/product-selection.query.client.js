import { createApiRoot } from './create.client.js';
import CustomError from '../errors/custom.error.js';
import { HTTP_STATUS_SUCCESS_ACCEPTED } from '../constants/http.status.constants.js';

export async function getCurrentStoreByProductSelectionId(productSelectionId) {
  let queryArgs = {
    where: `productSelections(active=true and productSelection(id="${productSelectionId}")) and key="${process.env.CTP_STORE_KEY}"`,
  };

  const stores = await createApiRoot()
    .stores()
    .get({ queryArgs })
    .execute()
    .then((response) => response.body.results)
    .catch((error) => {
      throw new CustomError(HTTP_STATUS_SUCCESS_ACCEPTED, error.message, error);
    });

  return stores[0];
}
