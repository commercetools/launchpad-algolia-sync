const PRODUCT_CHANGE_SUBSCRIPTION_KEY =
  'thegoodstore-changed-product-subscription';

export async function deleteChangedStoreSubscription(apiRoot) {
  const {
    body: { results: subscriptions },
  } = await apiRoot
    .subscriptions()
    .get({
      queryArgs: {
        where: `key = "${PRODUCT_CHANGE_SUBSCRIPTION_KEY}"`,
      },
    })
    .execute();

  if (subscriptions.length > 0) {
    const subscription = subscriptions[0];

    await apiRoot
      .subscriptions()
      .withKey({ key: PRODUCT_CHANGE_SUBSCRIPTION_KEY })
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
        key: PRODUCT_CHANGE_SUBSCRIPTION_KEY,
        destination: {
          type: 'GoogleCloudPubSub',
          topic: topicName,
          projectId,
        },
        changes: [
          {
            resourceTypeId: 'product',
          },
        ],
      },
    })
    .execute();
}
