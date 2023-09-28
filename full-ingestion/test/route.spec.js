import { expect, describe, afterAll, it } from '@jest/globals';
import request from 'supertest';
import server from '../src/index.js';

/** Reminder : Please put mandatory environment variables in the settings of your github repository **/
describe('Test event.controller.js', () => {
  const storeKey = 'MY_STORE_KEY'; // Specify the key of Commercetools Store for product synchronization

  it(`POST /${storeKey}`, async () => {
    let response = {};
    // Send request to the connector application with following code snippet.

    response = await request(server).post(`/${storeKey}`);

    expect(response).toBeDefined();
  });

  it(`POST /`, async () => {
    let response = {};
    // Send request to the connector application with following code snippet.

    response = await request(server).post(`/`);

    expect(response).toBeDefined();
  });

  afterAll(() => {
    // Enable the function below to close the application on server once all test cases are executed.

    if (server) {
      server.close();
    }
  });
});
