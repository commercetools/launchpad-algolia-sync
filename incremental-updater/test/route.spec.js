import { expect, describe, afterAll, it } from '@jest/globals';
import request from 'supertest';
import server from '../src/index.js';
import { encodeJsonObject } from './utils/encoder.utils.js';

/** Reminder : Please put mandatory environment variables in the settings of your github repository **/
describe('Test event.controller.js', () => {
  const storeKey = 'MY_STORE_KEY'; // Specify the key of Commercetools Store for product synchronization

  it(`POST /`, async () => {
    let response = {};
    // Send request to the connector application with following code snippet.

    response = await request(server).post(`/`);

    expect(response).toBeDefined();
  });

  it(`POST /deltaSync with empty payload`, async () => {
    let response = {};
    // Send request to the connector application with following code snippet.
    let payload = {};
    response = await request(server).post(`/deltaSync`).send(payload);

    expect(response).toBeDefined();
    expect(response.statusCode).toEqual(400);
  });

  it(`POST /deltaSync with correct message in payload body`, async () => {
    let response = {};
    // Send request to the connector application with following code snippet.
    // Following incoming message data is an example. Please define incoming message based on resources identifer in your own Commercetools project
    const incomingMessageData = {
      notificationType: 'ResourceUpdated',
      projectKey: 'connect-search-template',
      resource: { typeId: 'product', id: 'dummy-product-id' },
      resourceUserProvidedIdentifiers: {
        key: 'dummy-product-key',
        slug: { 'de-DE': 'dummy-product-slut' },
      },
      version: 11,
      oldVersion: 10,
      modifiedAt: '2023-09-12T00:00:00.000Z',
    };

    const encodedMessageData = encodeJsonObject(incomingMessageData);
    let payload = {
      message: {
        data: encodedMessageData,
      },
    };
    response = await request(server).post(`/deltaSync`).send(payload);

    expect(response).toBeDefined();
    expect(response.statusCode).toEqual(204);
  });

  afterAll(() => {
    // Enable the function below to close the application on server once all test cases are executed.

    if (server) {
      server.close();
    }
  });
});
