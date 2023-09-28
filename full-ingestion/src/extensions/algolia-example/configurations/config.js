function loadConfig() {
  try {
    return JSON.parse(process.env.SEARCH_PLATFORM_CONFIG);
  } catch (e) {
    throw new Error(
      'Search platform configuration is not provided in the JSON format'
    );
  }
}

export const config = {
  applicationId: loadConfig()?.applicationId,
  searchApiKey: loadConfig()?.searchApiKey,
  index: loadConfig()?.index,
};
