
# launchpad-algolia-sync
This is a connect application which aims at synchronizing products between `Launchpad template` and algolia search index. This repository is developed based on [connect-search-ingestion-template](https://github.com/commercetools/connect-search-ingestion-template)

This connector uses the [Product type](https://docs.commercetools.com/api/projects/productTypes) and [Product](https://docs.commercetools.com/api/projects/products) data models from composable commerce which can be used for mapping and syncing data into Algolia index to power frontend. Connector is based on asynchronous [Subscriptions](https://docs.commercetools.com/api/projects/subscriptions) to keep the search index up to date.

## Connector Features
- NodeJS supported.
- Uses Express as web server framework.
- Uses [commercetools SDK](https://docs.commercetools.com/sdk/js-sdk-getting-started) for the commercetools-specific communication.
- Includes local development utilities in npm commands to build, start, test, lint & prettify code.
- Uses JSON formatted logger with log levels
- Setup sample integration tests with [Jest](https://jestjs.io/) and [supertest](https://github.com/ladjs/supertest#readme)

## Prerequisite
#### 1. commercetools composable commerce API client
Users are expected to create API client responsible for fetching product details from composable commerce project, API client should have enough scope to be able to do so. These API client details are taken as input as an environment variable/ configuration for connect. Details of composable commerce project can be provided as environment variables (configuration for connect) `CTP_PROJECT_KEY` , `CTP_CLIENT_ID`, `CTP_CLIENT_SECRET`, `CTP_SCOPE`, `CTP_REGION`. For details, please read [Deployment Configuration](./README.md#deployment-configuration).


#### 2. Algolia index creation
Users are expected to create search index in Algolia. The index details are taken as input as an environment variable / configuration for connect. Details of search index can be provided as environment variables (configuration for connect) `SEARCH_PLATFORM_CONFIG`. For details, please read [Deployment Configuration](./README.md#deployment-configuration).

 
## Getting started
The connector contains two separated modules :
- Full Ingestion : Provides a REST-API to users to export all products from specific store of a commercetools project to Algolia index for initial load or  for full reindexing whenever needed. 
- Incremental Updater : Receives message from composable commerce project once there are product changes. The modified products are then synchronized to the existing Algolia index.


#### 1. Develop your search-specific needs 
While extending Launchpad data model in composable commerce, users need to also extend this connector with the following tasks
- Data Mapping: Implementation to transform the product type & product resources from commercetools structure to users-desired structure for the Algolia index.
- Data Persistence: Implementation to save/remove new mapped product data to the specific Algolia index using Algolia libraries included in the connector.

#### 2. Register as connector in commercetools Connect
Follow guidelines [here](https://docs.commercetools.com/connect/getting-started) to register the connector for private use. 

## Deployment Configuration
In order to deploy your Algolia connector application on commercetools Connect, it needs to be published. Connector needs to be published with certification false to be able to create deployment for production use. For details, please refer to [documentation about commercetools Connect](https://docs.commercetools.com/connect/concepts)
In addition, in order to support connect, the search connector template has a folder structure as listed below
```
├── full-ingestion
│   ├── src
│   ├── test
│   └── package.json
├── incremental-updater
│   ├── src
│   ├── test
│   └── package.json
└── connect.yaml
```

Connect deployment configuration is specified in `connect.yaml` which is required information needed for publishing of the application. Following is the deployment configuration used by full ingestion and incremental updater modules
```
deployAs:
  - name: full-ingestion
    applicationType: service
    endpoint: /fullSync
    scripts:
      postDeploy: npm install
    configuration:
      securedConfiguration:
        - key: CTP_PROJECT_KEY
          description: commercetools project key
        - key: CTP_CLIENT_ID
          description: commercetools client ID
        - key: CTP_CLIENT_SECRET
          description: commercetools client secret
        - key: CTP_SCOPE
          description: commercetools client scope
        - key: CTP_REGION
          description: Region of commercetools project
        - key: THEGOODSTORE_LOCALE
          description: Locale used in launchpad site. It includes 'en-US', 'de-DE'
        - key: SEARCH_PLATFORM_CONFIG
          description: Escaped JSON object including credentials to search platform and other settings
  - name: incremental-updater
    applicationType: event
    endpoint: /deltaSync
    scripts:
      postDeploy: npm install && npm run connector:post-deploy
      preUndeploy: npm install && npm run connector:pre-undeploy
    configuration:
      standardConfiguration:
        - key: CTP_PRODUCT_CHANGE_SUBSCRIPTION_KEY
          description: Key of commercetools subscription which subscribes any change in commercetools product resources
      securedConfiguration:
        - key: CTP_PROJECT_KEY
          description: commercetools project key
        - key: CTP_CLIENT_ID
          description: commercetools client ID
        - key: CTP_CLIENT_SECRET
          description: commercetools client secret
        - key: CTP_SCOPE
          description: commercetools client scope
        - key: CTP_REGION
          description: Region of commercetools project
        - key: THEGOODSTORE_LOCALE
          description: Locale used in launchpad site. It includes 'en-US', 'de-DE'
        - key: SEARCH_PLATFORM_CONFIG
          description: Escaped JSON object including credentials to search platform and other settings
```

Here you can see the details about various variables in configuration
- CTP_PROJECT_KEY: The key of commercetools project.
- CTP_CLIENT_ID: The client ID of your commercetools user account. It is used in commercetools client to communicate with commercetools platform via SDK.
- CTP_CLIENT_SECRET: The client secret of commercetools user account. It is used in commercetools client to communicate with commercetools platform via SDK.
- CTP_SCOPE: The scope constrains the endpoints to which the commercetools client has access, as well as the read/write access right to an endpoint.
- CTP_REGION: As the commercetools APIs are provided in six different region, it defines the region which your commercetools user account belongs to.
- CTP_PRODUCT_CHANGE_SUBSCRIPTION_KEY: Key of commercetools subscription which subscribes any change in commercetools product resources. Remind that it needs to be unique per deployed connector application. That means it cannot be shared among multiple applications and Algolia search indices.
- THEGOODSTORE_LOCALE: Locale in `launchpad`. It includes 'en-US' and 'de-DE'. Since it is suggested each search index supports only single locale, locale code requires to be provided as environment variable for connector.
- SEARCH_PLATFORM_CONFIG: It defines the configurations required by the Algolia index, such as credentials, Algolia index unique identifier, etc.
  Following is a sample JSON object of this variable.
  
    ```
    {
        applicationId: xxx,
        searchApiKey: yyy,
        index: zzz
    }

    ```
  The value of this configuration variable needs to be in escaped JSON format. Hence, based on the sample above, the expected value of this variable becomes
  ```
  '{ "applicationId": "xxx", "searchApiKey": "yyy", "index": "zzz" }'
  ```
- CTP_STORE_KEY : Only used in incremental updater. It specifies the key of commercetools store so that connector can look up the modified product under the specific store in commercetools platform.

## Recommendations
#### Implement your own test cases
We have provided simple integration test cases with [Jest](https://jestjs.io/) and [supertest](https://github.com/ladjs/supertest#readme). The implementation is under `test` folder in both `full-ingestion` and `incremental-updater` modules. It is recommended to implement further test cases based on your own needs to test your development. 
