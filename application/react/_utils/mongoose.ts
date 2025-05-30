/* Generates a UUID that can be used as a mongoose _id. Follows the format of the default mongoose _id. */
export const generateMongooseId = () => {
  const timestamp = Math.floor(Date.now() / 1000).toString(16);
  const random = 'xxxxxxxxxxxxxxxx'.replace(/[x]/g, () =>
    Math.floor(Math.random() * 16).toString(16)
  );
  return (timestamp + random).slice(0, 24);
}

