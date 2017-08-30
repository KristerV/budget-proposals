module.exports.getFullUrl = req => {
  return (
    req.protocol + "://" + req.get("host") + req.originalUrl.replace(/\/$/, "")
  );
};
