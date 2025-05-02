function getStatusCodes() {
  return {
    OK: 200,
    CREATED: 201,
    INVALID_DATA_ERROR: 400,
    UNAUTHORIZED_ERROR: 401,
    FORBIDDEN_ERROR: 403,
    NOT_FOUND_ERROR: 404,
    CONFLICT_ERROR: 409,
    INTERNAL_SERVER_ERROR: 500,
  };
}

module.exports = getStatusCodes();
