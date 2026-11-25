// Forwards rejected promises to the central error handler (Express 4 does not do this by itself).
export const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
