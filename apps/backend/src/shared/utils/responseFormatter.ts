export const success = <T>(data: T, meta?: object) => ({
  success: true,
  data,
  ...(meta && { meta }),
});
