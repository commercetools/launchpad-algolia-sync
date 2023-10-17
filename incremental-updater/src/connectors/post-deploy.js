import { createApiRoot } from '../clients/create.client.js';
import { createChangedStoreSubscription } from './actions.js';

const CONNECT_GCP_TOPIC_NAME_KEY = 'CONNECT_GCP_TOPIC_NAME';
const CONNECT_GCP_PROJECT_ID_KEY = 'CONNECT_GCP_PROJECT_ID';
const CTP_PRODUCT_CHANGE_SUBSCRIPTION_KEY = 'CTP_PRODUCT_CHANGE_SUBSCRIPTION_KEY';

async function postDeploy(properties) {
  const topicName = properties.get(CONNECT_GCP_TOPIC_NAME_KEY);
  const projectId = properties.get(CONNECT_GCP_PROJECT_ID_KEY);
  const ctpSubscriptionKey = properties.get(CTP_PRODUCT_CHANGE_SUBSCRIPTION_KEY);

  const apiRoot = createApiRoot();
  await createChangedStoreSubscription(apiRoot, topicName, projectId, ctpSubscriptionKey);
}

async function run() {
  try {
    const properties = new Map(Object.entries(process.env));
    await postDeploy(properties);
  } catch (error) {
    process.stderr.write(`Post-deploy failed: ${error.message}\n`);
    process.exitCode = 1;
  }
}

run();
