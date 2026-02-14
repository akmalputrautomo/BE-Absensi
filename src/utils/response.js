exports.success = (res, code, message, data) => {
  return res.status(code).json({
    status: true,
    message,
    err: null,
    data,
  });
};

exports.error = (res, code, message, err = null) => {
  return res.status(code).json({
    status: false,
    message,
    err,
    data: null,
  });
};
