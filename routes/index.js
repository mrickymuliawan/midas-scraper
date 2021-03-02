const MidasScraper = require('../services/midas')
const router = require('express').Router()
require('dotenv').config()

router.post('/buypubg', async (req, res) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress
  const header = req.headers['authorization'] 
  if (ip != process.env.ALLOWED_IP || token != process.env.TOKEN) {
    return res.status(401).json({error:'unauthorized'}) 
  }
  const midas = new MidasScraper(req.body.midasUsername, req.body.midasPassword, process.env.UNIPIN_USERNAME, process.env.UNIPIN_PASSWORD, process.env.UNIPIN_KEY)
  midas.buyPubg(req.body.playerId.toString(), req.body.productId, async (result) => {
    return res.json(result)
  })

})


module.exports = router