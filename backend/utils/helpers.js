const successResponse = (res, data, message = 'Success', statusCode = 200) => {
  res.status(statusCode).json({
    status: 'success',
    message,
    data,
  });
};

const errorResponse = (res, message = 'Error', statusCode = 500) => {
  res.status(statusCode).json({
    status: 'error',
    message,
  });
};

module.exports = {
  successResponse,
  errorResponse,
};
