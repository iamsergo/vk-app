const path = require('path')
const express = require('express')
const router = express.Router()

router.get('/group_or_teacher', async (req, res) => {
  const { q } = req.query

  if(!q) res.json([])

  const data = require(path.resolve(__dirname, '../data.json'))
  
  res.json( data.filter( ({ title }) => title.toLowerCase().includes(q.toLowerCase()) ) )
} )

module.exports = router