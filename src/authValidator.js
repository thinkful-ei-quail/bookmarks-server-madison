const logger = require("./logger")

module.exports = authValidator = function (req, res, next) {
  const authToken = req.get("Authorization")
  const apiToken = process.env.API_TOKEN

  if (!authToken || authToken.split(" ").pop() !== apiToken) {
    logger.error(`Unauthorized request to path: ${req.path}`)
    return res.status(401).json({ error: "Unauthorized access" })
  }

  next()
}
