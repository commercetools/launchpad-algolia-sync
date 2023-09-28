const encodeString = (message) => {
  const buff = Buffer.from(message);
  return buff.toString('base64').trim();
};

export const encodeJsonObject = (messageBody) => {
  const message = JSON.stringify(messageBody);
  return encodeString(message);
};
