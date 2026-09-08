/**
 * Standardized success response format
 */
const successResponse = (res, statusCode = 200, data = null, message = 'Success') => {
  return res.status(statusCode).json({
    success: true,
    data,
    message,
    requestId: res.req?.headers['x-request-id'] || res.req?.id || null
  });
};

/**
 * Standardized paginated response format
 */
const paginatedResponse = (res, statusCode = 200, data = [], pagination = {}, message = 'Success') => {
  return res.status(statusCode).json({
    success: true,
    data,
    pagination: {
      page: pagination.page || 1,
      limit: pagination.limit || 10,
      total: pagination.total || 0,
      totalPages: pagination.totalPages || 1
    },
    message,
    requestId: res.req?.headers['x-request-id'] || res.req?.id || null
  });
};

module.exports = {
  successResponse,
  paginatedResponse
};
