
/**
 * Extrae y valida la pagiancion
 * @param {object} query - req.query,
 * @param {number} maxPageSize
 * @returns {{page, pageSize, limit, offset}}
 * */
function getPagination(query, maxPageSize = 100) {
  const page = Math.max(1, parseInt(query.page || "1", 10) || 1);
  const pageSize = Math.min(
    maxPageSize,
    Math.max(1, parseInt(query.pageSize || "10", 10) || 10),
  );

  return {
    page,
    pageSize,
    limit: pageSize,
    offset: (page - 1) * pageSize,
  };
}

function paginatedResponse({ rows, count }, page, pageSize) {
  return {
    total: count,
    page,
    pageSize,
    totalPages: Math.ceil(count / pageSize),
    data: rows,
  };
}

module.exports = { getPagination, paginatedResponse };
