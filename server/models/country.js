const mongoose = require('mongoose'); // Mongo DB object modeling module
const Joi = require('joi'); // Schema description & validation module
const { logger } = require('../middleware/log/winston'); // Loging midddleware
const nexusError = require('../middleware/util/throwError'); // Costom error handler util

// Global Constants
const Schema = mongoose.Schema; // Destructure of Schema

// type values are Ground or Space
const CountrySchema = new Schema({
	model: { type: String, default: 'Country' },
	zone: { type: Schema.Types.ObjectId, ref: 'Zone' },
	team: { type: Schema.Types.ObjectId, ref: 'Team' },
	capital: { type: Schema.Types.ObjectId, ref: 'Site' },
	code: {
		type: String,
		required: true,
		index: true,
		trim: true,
		unique: true,
		minlength: 2,
		maxlength: 2,
		uppercase: true
	},
	name: {
		type: String,
		required: true,
		trim: true,
		minlength: 3,
		maxlength: 75
	},
	unrest: {
		type: Number,
		min: 0,
		max: 250,
		default: 0
	},
	type: { type: String, default: 'Ground' },
	coastal: {
		type: Boolean,
		default: false
	},
	borderedBy: [{ type: Schema.Types.ObjectId, ref: 'Country' }],
	milAlliance: [{ type: Schema.Types.ObjectId, ref: 'Team' }],
	sciAlliance: [{ type: Schema.Types.ObjectId, ref: 'Team' }],
	stats: {
		sciRate: { type: Number, default: 25 },
		balance: { type: Number, default: 0 }
	},
	formalName: { type: String },
	serviceRecord: [{ type: Schema.Types.ObjectId, ref: 'Log' }],
	gameState: []
});

CountrySchema.methods.validateCountry = async function () {
	const { validTeam, validZone, validLog, validCountry } = require('../middleware/util/validateDocument');
	logger.info(`Validating ${this.model.toLowerCase()} ${this.name}...`);
	let schema = {};
	switch (this.type) {
	case 'Ground':
		schema = Joi.object({
			name: Joi.string().min(3).max(75).required(),
			code: Joi.string().min(2).max(2).required().uppercase(),
			unrest: Joi.number().min(0).max(250)
		});
		for await (const bBy of this.borderedBy) {
			await validCountry(bBy);
		}
		break;

	case 'Space':
		schema = Joi.object({
			name: Joi.string().min(3).max(75).required(),
			code: Joi.string().min(2).max(2).required().uppercase(),
			unrest: Joi.number().min(0).max(250)
		});
		break;

	default:
		nexusError(`Invalid Type ${this.type} for zone!`, 400);
	}

	const { error } = schema.validate(this, { allowUnknown: true });
	if (error != undefined) nexusError(`${error}`, 400);

	await validZone(this.zone);
	await validTeam(this.team);
	for await (const milAll of this.milAlliance) {
		await validTeam(milAll);
	}
	for await (const sciAll of this.sciAlliance) {
		await validTeam(sciAll);
	}
	for await (const servRec of this.serviceRecord) {
		await validLog(servRec);
	}
};

const Country = mongoose.model('Country', CountrySchema);

const GroundCountry = Country.discriminator(
	'GroundCountry',
	new Schema({
		type: { type: String, default: 'Ground' },
		coastal: {
			type: Boolean,
			default: false
		},
		borderedBy: [{ type: Schema.Types.ObjectId, ref: 'Country' }]
	})
);

const SpaceCountry = Country.discriminator(
	'SpaceCountry',
	new Schema({
		type: { type: String, default: 'Space' }
	})
);

module.exports = { Country, GroundCountry, SpaceCountry };
