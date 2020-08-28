const express = require('express')
const router = express.Router()

const Parser = require('../parser/Parser')
const BodyParser = require('../parser/BodyParser')
const User = require('../models/User')

router.put('/user/group', async (req, res) => {
  const { uid, group } = req.body
  
  await User.updateOne({ id : uid }, { $set : { group : `?${group}` } })

  const BASE_URL = 'http://www.bstu.ru/static/themes/bstu/schedule/index.php?'
  const URL = `${BASE_URL}${group}`

  const body = await BodyParser.getHTML(URL)
  const parser = new Parser(body)
  const schedule = parser.getData()
  const fromWhoms = parser.getFromWhoms(schedule.days)
  
  res.json({ id : uid, group : `?${group}`, schedule, fromWhoms})
} )

router.delete('/user/group', async (req, res) => {
  const { uid } = req.body
  
  await User.updateOne({ id : uid }, { $set : { group : '' } })
  
  res.json({ id : uid, group : '' })
} )

module.exports = router