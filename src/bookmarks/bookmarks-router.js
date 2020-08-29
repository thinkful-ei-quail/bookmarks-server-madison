const express = require("express")
const { v4: uuid } = require("uuid")
const { PORT } = require("../config")
const authValidator = require("../authValidator")
const bookmarksRouter = express.Router()
const bodyParser = express.json()

const { bookmarks } = require("../store.js")
const logger = require("../logger.js")

bookmarksRouter
  .route("/bookmarks")
  .get((req, res) => {
    res.status(200).json(bookmarks)
  })
  .post(authValidator, bodyParser, (req, res) => {
    const { title, url, description = "No Description", rating } = req.body

    if (!title) {
      logger.error("Title is required")
      return res.status(400).send("Invalid data")
    }
    if (!url) {
      logger.error("URL is required")
      return res.status(400).send("Invalid data")
    }
    if (!rating) {
      logger.error("Rating is required")
      return res.status(400).send("Invalid data")
    }

    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      logger.error("Must start with http(s)//")
      return res.status(400).send("Invalid URL")
    }
    if (isNaN(rating) || rating < 1 || rating > 5) {
      logger.error("Rating must be a number between 1 to 5 inclusive")
      return res.status(400).send("Invalid Rating")
    }

    const id = uuid()

    const bookmark = {
      id,
      title,
      url,
      description,
      rating,
    }

    bookmarks.push(bookmark)

    logger.info(`Bookmark with id ${id} created`)

    res
      .status(201)
      .location(`http://localhost:${PORT}/bookmarks/${id}`)
      .json(bookmark)
  })

bookmarksRouter
  .route("/bookmarks/:id")
  .get((req, res) => {
    const { id } = req.params
    const bookmark = bookmarks.find((b) => b.id == id)

    if (!bookmark) {
      logger.error(`Bookmark with id ${id} not found`)
      return res.status(404).send("Bookmark not found")
    }

    res.json(bookmark)
  })
  .delete(authValidator,(req, res) => {
    const { id } = req.params

    const bookIndex = bookmarks.findIndex((b) => b.id == id)

    if (bookIndex === -1) {
      logger.error(`Bookmark with id ${id} not found`)
      return res.status(404).send("Not found")
    }

    bookmarks.splice(bookIndex, 1)

    logger.info(`Bookmark with id ${id} deleted`)

    res.status(204).end()
  })

module.exports = bookmarksRouter
