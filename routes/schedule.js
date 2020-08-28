const express = require('express')
const router = express.Router()

const BodyParser = require('../parser/BodyParser')
const Parser = require('../parser/Parser')

router.get('/schedule/:id', async (req, res) => {
  const { id } = req.params
  const BASE_URL = 'http://www.bstu.ru/static/themes/bstu/schedule/index.php?'
  const URL = `${BASE_URL}${id}`

  const body = await BodyParser.getHTML(URL)
  const parser = new Parser(body)
  
  res.json({ ...parser.getData(), href : `?${id}`})
} )

module.exports = router