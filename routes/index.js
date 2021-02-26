const MidasScraper = require('../services/midas')
const router = require('express').Router()
require('dotenv').config()

router.post('/buypubg', async (req, res) => {
  console.log(process.env.UNIPIN_PASSWORD);
  const midas = new MidasScraper(req.body.midasUsername, req.body.midasPassword, process.env.UNIPIN_USERNAME, process.env.UNIPIN_PASSWORD, process.env.UNIPIN_KEY)
  midas.buyPubg(req.body.playerId.toString(), req.body.productId, async (result) => {
    return res.json(result)
  })

})


module.exports = router