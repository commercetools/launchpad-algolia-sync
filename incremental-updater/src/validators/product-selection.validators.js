import CustomError from '../errors/custom.error.js';
import { HTTP_STATUS_SUCCESS_ACCEPTED } from '../constants/http.status.constants.js';
import { getCurrentStoreByProductSelectionId } from '../clients/product-selection.query.client.js';

export async function doValidation(messageBody) {
  const type = messageBody.type;

  if (!messageBody) {
    throw new CustomError(
      HTTP_STATUS_SUCCESS_ACCEPTED,
      `The incoming message body is missing. No further action is required. `
    );
  }

  // Make sure incoming message contains the action of product changes in product selections
  if (
    type !== 'ProductSelectionProductRemoved' &&
    type !== 'ProductSelectionProductAdded' &&
    type !== 'ProductSelectionVariantSelectionChanged'
  ) {
    throw new CustomError(
      HTTP_STATUS_SUCCESS_ACCEPTED,
      `The incoming message belongs to an incorrect type ${type}. No further action is required. `
    );
  }

  // Make sure the changed product selection is assigned and active to current store
  const productSelectionIdFromMessage = messageBody.resource.id;
  await validateProductSelectionAssignedToCurrentStore(
    productSelectionIdFromMessage
  );
}

async function validateProductSelectionAssignedToCurrentStore(
  productSelectionIdFromMessage
) {
  const store = await getCurrentStoreByProductSelectionId(
    productSelectionIdFromMessage
  );
  if (!store) {
    throw new CustomError(
      HTTP_STATUS_SUCCESS_ACCEPTED,
      `The product selection "${productSelectionIdFromMessage}" in notification is not assigned or active to current store "${process.env.CTP_STORE_KEY}". No further action is required. `
    );
  }
}
