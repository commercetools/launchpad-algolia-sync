import { createApiRoot } from '../clients/create.client.js';

import { deleteChangedStoreSubscription } from './actions.js';

const CTP_PRODUCT_CHANGE_SUBSCRIPTION_KEY = 'CTP_PRODUCT_CHANGE_SUBSCRIPTION_KEY';

async function preUndeploy(properties) {
  const apiRoot = createApiRoot();
  const ctpSubscriptionKey = properties.get(CTP_PRODUCT_CHANGE_SUBSCRIPTION_KEY);
  await deleteChangedStoreSubscription(apiRoot, ctpSubscriptionKey);
}

async function run() {
  try {
    const properties = new Map(Object.entries(process.env));
    await preUndeploy(properties);
  } catch (error) {
    process.stderr.write(`Post-undeploy failed: ${error.message}\n`);
    process.exitCode = 1;
  }
}

run();
