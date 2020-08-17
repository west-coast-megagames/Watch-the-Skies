const routeDebugger = require('debug')('app:routes');
const express = require('express');
const router = express.Router();
const nexusEvent = require('../../startup/events');

const { logger } = require('../../middleware/winston'); // Import of winston for error logging

// Trade Models - Using Mongoose Model
const { Trade } = require('../../models/dip/trades');
const { Team } = require('../../models/team/team');

const { resolveTrade } = require('../../wts/trades/trade')


// @route   GET api/trades
// @Desc    Get all trades
// @access  Public
router.get('/', async function (req, res){
    routeDebugger('Showing all Trades');
    let trade = await Trade.find().sort({ team: 1 });  
    res.status(200).json(trade);
}); 

// @route   POST api/trades
// @Desc    Post a new trade
// @access  Public
router.post('/', async function (req, res){
    console.log(req.body); 
    let { offer, initiator } = req.body;
   
    if (offer.length < 1){
        res.status(400).send(`This trade is empty!`);
    }
    let trade = new Trade(req.body);
    trade = await trade.save();
    let initiatorTeam = await Team.findById({_id: initiator});
    initiatorTeam.trades.push(trade._id);
    initiatorTeam = await initiatorTeam.save();

    for await (let offer of trade.offer) {
        offer.team = await Team.findById(offer.team);
    }
    nexusEvent.emit('updateTeam');
    routeDebugger(trade);
    res.status(200).json(trade);
});

router.delete('/', async function (req, res){
    let data = await Trade.deleteMany();
    res.status(200).send(`We killed ${data.deletedCount}`)    
});

router.delete('/id', async function (req, res){
    
    try{
        let removalTeam = await Team.findById({_id: req.body.teamID});
        for (i=0; i< removalTeam.trades.length; i++){
            if (removalTeam.trades[i] == req.body.tradeID){
                removalTeam.trades.splice(i, 1);
                removalTeam.save();
            }
        }

        res.status(200).send(`We killed trade: ${req.body.tradeID}`);            
    }
    catch (err) {
    logger.error(`Catch runSpacecraftLoad Error: ${err.message}`, {
      meta: err,
    });
    return false;
  }//catch


});

router.post('/process', async function (req, res){
    resolveTrade(req, res);

});//router



module.exports = router;