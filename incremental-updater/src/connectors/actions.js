const STORE_PRODUCT_CHANGE_SUBSCRIPTION_KEY = 'your-subscription';

export async function deleteChangedStoreSubscription(apiRoot) {
  const {
    body: { results: subscriptions },
  } = await apiRoot
    .subscriptions()
    .get({
      queryArgs: {
        where: `key = "${STORE_PRODUCT_CHANGE_SUBSCRIPTION_KEY}"`,
      },
    })
    .execute();

  if (subscriptions.length > 0) {
    const subscription = subscriptions[0];

    await apiRoot
      .subscriptions()
      .withKey({ key: STORE_PRODUCT_CHANGE_SUBSCRIPTION_KEY })
      .delete({
        queryArgs: {
          version: subscription.version,
        },
      })
      .execute();
  }
}

export async function createChangedStoreSubscription(
  apiRoot,
  topicName,
  projectId
) {
  await deleteChangedStoreSubscription(apiRoot);

  await apiRoot
    .subscriptions()
    .post({
      body: {
        key: STORE_PRODUCT_CHANGE_SUBSCRIPTION_KEY,
        destination: {
          type: 'GoogleCloudPubSub',
          topic: topicName,
          projectId,
        },
        messages: [
          {
            resourceTypeId: 'product-selection',
            types: [
              'ProductSelectionProductAdded',
              'ProductSelectionProductRemoved',
              'ProductSelectionVariantSelectionChanged',
            ],
          },
          {
            resourceTypeId: 'store',
            types: [
              'StoreProductSelectionsChanged',
              'StoreCreated',
              'StoreDeleted',
            ],
          },
        ],
        changes: [
          {
            resourceTypeId: 'product',
          },
        ],
      },
    })
    .execute();
}
