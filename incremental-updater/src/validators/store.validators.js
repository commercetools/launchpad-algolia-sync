import CustomError from '../errors/custom.error.js';
import { HTTP_STATUS_SUCCESS_ACCEPTED } from '../constants/http.status.constants.js';

export function doValidation(messageBody) {
  const storeKey = messageBody.resourceUserProvidedIdentifiers?.key;
  const type = messageBody.type;
  if (!messageBody) {
    throw new CustomError(
      HTTP_STATUS_SUCCESS_ACCEPTED,
      `The incoming message body is missing. No further action is required. `
    );
  }

  // Make sure the store key assigned to current connector matches with the changed store
  if (storeKey !== process.env.CTP_STORE_KEY) {
    throw new CustomError(
      HTTP_STATUS_SUCCESS_ACCEPTED,
      `The change in store "${storeKey}" is different from current store "${process.env.CTP_STORE_KEY}". No further action is required. `
    );
  }

  // Make sure only the event of product selections change in current store is handled.
  if (type !== 'StoreProductSelectionsChanged') {
    throw new CustomError(
      HTTP_STATUS_SUCCESS_ACCEPTED,
      `The incoming message belongs to inappropriate type "${type}". No further action is required. `
    );
  }

  // Make sure incoming message contains the action of product selection changes
  if (
    !messageBody.updatedProductSelections &&
    !messageBody.removedProductSelections &&
    !messageBody.addedProductSelections
  ) {
    throw new CustomError(
      HTTP_STATUS_SUCCESS_ACCEPTED,
      `Unable to find suitable actions [addedProductSelections,removedProductSelections,updatedProductSelections] within incoming message.`
    );
  }
}
