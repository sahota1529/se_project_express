function getStatusCodes() {
  return {
    INVALID_DATA_ERROR: 400,
    NOT_FOUND_ERROR: 404,
    INTERNAL_SERVER_ERROR: 500,
    OK: 200,
    CREATED: 201,
  };
}

module.exports = getStatusCodes();
