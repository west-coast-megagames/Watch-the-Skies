const mongoose = require('mongoose');
const { Facility } = require('./facility');
const Schema = mongoose.Schema;
const Joi = require('joi');

const Lab = Facility.discriminator('Lab', new Schema({
  type: { type: String, min: 2, maxlength: 50, default: 'Lab'},
  sciRate: { type: Number, default: 0 },
  bonus: { type: Number, default: 0 },
  funding: { type: Number, default: 0 },
  research: [{ type: Schema.Types.ObjectId, ref: 'Research' }]
}));

module.exports = { Lab };