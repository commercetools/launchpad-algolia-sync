export async function deleteChangedStoreSubscription(
  apiRoot,
  ctpSubscriptionKey
) {
  const {
    body: { results: subscriptions },
  } = await apiRoot
    .subscriptions()
    .get({
      queryArgs: {
        where: `key = "${ctpSubscriptionKey}"`,
      },
    })
    .execute();

  if (subscriptions.length > 0) {
    const subscription = subscriptions[0];

    await apiRoot
      .subscriptions()
      .withKey({ key: ctpSubscriptionKey })
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
  projectId,
  ctpSubscriptionKey
) {
  await deleteChangedStoreSubscription(apiRoot, ctpSubscriptionKey);

  await apiRoot
    .subscriptions()
    .post({
      body: {
        key: ctpSubscriptionKey,
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
