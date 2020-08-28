const express = require('express')
const router = express.Router()

const BodyParser = require('../parser/BodyParser')
const Parser = require('../parser/Parser')
const User = require('../models/User')

router.get('/user', async (req, res) => {
  const { id } = req.query

  const doc = await User.findOne({ id })  
  
  if(doc)
  {
    const user = await doc.toJSON()
    let payload = {}
    if(user.group)
    {
      const BASE_URL = 'http://www.bstu.ru/static/themes/bstu/schedule/index.php?'
      const URL = `${BASE_URL}${user.group.slice(1)}`

      const body = await BodyParser.getHTML(URL)
      const parser = new Parser(body)
      const schedule = parser.getData()
      const fromWhoms = parser.getFromWhoms(schedule.days)

      payload = { schedule, fromWhoms }            
    }
    res.json({ ...user, ...payload })
  }
  else
  {
    res.json(null)
  }  
} )

router.post('/user', async (req, res) => {
  const { id } = req.query
  
  const doc = await User.create({ id, group : '' })
  const user = await doc.toJSON()
  
  res.json(user)
} )

module.exports = router