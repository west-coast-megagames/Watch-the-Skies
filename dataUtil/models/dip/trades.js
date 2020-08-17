const mongoose = require('mongoose');
const { boolean } = require('joi');
const Schema = mongoose.Schema;

const tradeDebugger = require('debug')('app:trade');

const TradeSchema = new Schema({
    offer: [{
        team: {type: Schema.Types.ObjectId, ref: 'Team'}, 
        megabucks: {type: Number, default: 0},
        aircraft: [{type: Schema.Types.ObjectId, ref: 'Aircraft'}],
        //intel here
        research: [{type: Schema.Types.ObjectId, ref: 'Research'}],
        //sites here
        equiptment: [{type: Schema.Types.ObjectId, ref: 'Equiptment'}],
        ratified: {type: Boolean, default: false}    
    }],//offer
    status: {
        draft: {type: Boolean, default: true},
        proposal: {type: Boolean, default: false},
        pending: {type: Boolean, default: false},
        rejected: {type: Boolean, default: false},
        complete: {type: Boolean, default: false},
    },
    comments: [],
    lastUpdated: {type: Date, default: Date.now()}
});//const TradeSchema

let Trade = mongoose.model('Trade', TradeSchema);

module.exports = { Trade };