export const image_http = (key?: string) => {
  if (!key) return "";
  return key.startsWith("http") ? key : `https://example.com/${key}`;
};
