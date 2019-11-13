
const Joi = require('joi');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const zoneDebugger = require('debug')('app:zone');
const supportsColor = require('supports-color');

const ZoneSchema = new Schema({
  zoneCode: {type: String, 
             required: true,
             minlength: 3,
             maxlength: 3,
             uppercase: true,
             index: true,
             unique: true
            },
  zoneName: {type: String, 
             required: true,
             minlength: 3,
             maxlength: 50},
  zoneActive: { type: Boolean, default: true }
});

ZoneSchema.methods.validateZone = function (zone) {
zoneDebugger("In methods validateZone", zone.zoneName, zone.zoneCode, zone.zoneActive);
  const schema = {
    zoneName: Joi.string().min(3).max(50).required(),
    zoneCode: Joi.string().min(3).max(3).required().uppercase(),
    zoneActive: Joi.boolean().default(true)
  };

  return Joi.validate(zone, schema, { "allowUnknown": true });
  //return Joi.schema.validate(zone, { "allowUnknown": true });
}

let Zone = mongoose.model('zone', ZoneSchema);

function validateZone(zone) {
  zoneDebugger("In function validateZone", zone.zoneName);
  const schema = {
    zoneCode: Joi.string().min(3).max(3).required().uppercase(),
    zoneName: Joi.string().min(3).max(50).required(),
    zoneActive: Joi.boolean().default(true)
  };

  //return Joi.schema.validate(zone, { "allowUnknown": true });
  return Joi.validate(zone, schema, { "allowUnknown": true });
}

module.exports =  { Zone, validateZone };