const decodeToString = (encodedMessageBody) => {
  const buff = Buffer.from(encodedMessageBody, 'base64');
  return buff.toString().trim();
};

export const decodeToJson = (encodedMessageBody) => {
  const decodedString = decodeToString(encodedMessageBody);
  return JSON.parse(decodedString);
};
