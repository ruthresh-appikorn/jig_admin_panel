export const createProxyS3Client = () => {
  return {
    downloadObject: async (bucket: string, key: string) => {
      console.warn("Mock S3 client: downloadObject called", { bucket, key });
      // Return a structure that matches what common_functions.tsx expects
      return {
        ok: false,
        data: {
          blob: null as any,
          Body: null as any,
        },
      };
    },
  };
};
