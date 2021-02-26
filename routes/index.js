// const { OrderModel } = require('../models')
const MidasScraper = require('../services/midas')

const router = require('express').Router()

router.post('/buypubg', async (req, res) => {

  // const order = await OrderModel.create({
  //   productId: req.body.productId,
  //   playerId: req.body.playerId,
  //   orderId: req.body.orderId,
  //   status: 'pending',
  // })

  const midas = new MidasScraper('market.ptgdinnusa@gmail.com', 'Weweasas1', 'charlieputin11@yahoo.com', 'lapakgaming123', req.body.key)
  midas.buyPubg(req.body.playerId, req.body.productId, async (result) => {
    // if (result.status == 'success') {
    //   order.status = 'success'
    //   order.lastStep = result.step
    //   await order.save()
    // }
    // else {
    //   order.status = 'failed'
    //   order.lastStep = result.step
    //   await order.save()
    // }
    return res.json(result)
  })

})


module.exports = router