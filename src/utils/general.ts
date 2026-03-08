export const normalizeError = (e: any) => {
  if (e instanceof Error || 'message' in e) {
    return e.message;
  }

  if (typeof e === 'string') {
    return e;
  }

  try {
    return JSON.stringify(e);
  } catch {
    return String(e);
  }
};
