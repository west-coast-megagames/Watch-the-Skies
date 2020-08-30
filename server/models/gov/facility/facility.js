const mongoose = require("mongoose");
const modelDebugger = require("debug")("app:facilityModel");
const Schema = mongoose.Schema;
const Joi = require("joi");
const ObjectId = mongoose.ObjectId;

const FacilitySchema = new Schema({
  model: { type: String, default: "Facility" },
  type: { type: String, min: 2, maxlength: 50 },
  name: { type: String, required: true, min: 2, maxlength: 50 },
  team: { type: ObjectId, ref: "Team" },
  site: { type: ObjectId, ref: "Site" },
  code: {
    type: String,
    minlength: 2,
    maxlength: 20,
    required: true,
    unique: true,
  },
  status: {
    repair: { type: Boolean, default: true },
    damaged: { type: Boolean, default: false },
    destroyed: { type: Boolean, default: false },
    secret: { type: Boolean, default: false },
    defenses: { type: Boolean, default: false },
  },
  hidden: { type: Boolean, default: false },
  gameState: [],
  capability: {
    research: {
      capacity: { type: Number, default: 0 },
      projects: [{ type: ObjectId, ref: "Research" }],
      funding: [Number],
      sciRate: { type: Number, default: 0 },
      sciBonus: { type: Number, default: 0 },
      active: { type: Boolean },
      status: {
        damage: [Boolean],
        pending: [Boolean]
      },
      upgrade: [{ type: ObjectId, ref: "Upgrade" }],
    },
    airMission: {
      capacity: { type: Number, default: 0 },
      damage: [Boolean],
      aircraft: [{ type: ObjectId, ref: "Aircraft" }],
      active: { type: Boolean, default: false },
      upgrade: [{ type: ObjectId, ref: "Upgrade" }],
    },
    storage: {
      capacity: { type: Number, default: 0 },
      damage: [Boolean],
      upgrade: [{ type: ObjectId, ref: "Upgrade" }],
      active: { type: Boolean, default: false },
    },
    manufacturing: {
      capacity: { type: Number, default: 0 },
      damage: [Boolean],
      upgrade: [{ type: ObjectId, ref: "Upgrade" }],
      active: { type: Boolean, default: false },
    },
    naval: {
      capacity: { type: Number, default: 0 },
      damage: [Boolean],
      fleet: [{ type: ObjectId, ref: "Military" }],
      active: { type: Boolean, default: false },
      upgrade: [{ type: ObjectId, ref: "Upgrade" }],
    },
    ground: {
      capacity: { type: Number, default: 0 },
      damage: [Boolean],
      corps: [{ type: ObjectId, ref: "Military" }],
      active: { type: Boolean, default: false },
      upgrade: [{ type: ObjectId, ref: "Upgrade" }],
    },
  },
});

let Facility = mongoose.model("Facility", FacilitySchema);

function validateFacility(facility) {
  const schema = {
    name: Joi.string().min(2).max(50).required(),
  };

  return Joi.validate(facility, schema, { allowUnknown: true });
}

module.exports = { Facility, validateFacility };
