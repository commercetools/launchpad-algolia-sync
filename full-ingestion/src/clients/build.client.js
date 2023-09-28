import { ClientBuilder } from '@commercetools/sdk-client-v2';
import { authMiddlewareOptions } from '../middlewares/auth.middleware.js';
import { httpMiddlewareOptions } from '../middlewares/http.middleware.js';
import { readConfiguration } from '../utils/config.utils.js';

/**
 * Create a new client builder.
 * This code creates a new client builder that can be used to make API calls
 */
export const createClient = () =>
  new ClientBuilder()
    .withProjectKey(readConfiguration().projectKey)
    .withClientCredentialsFlow(authMiddlewareOptions)
    .withHttpMiddleware(httpMiddlewareOptions)
    .build();
