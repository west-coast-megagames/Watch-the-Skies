const mongoose = require('mongoose');
const modelDebugger = require('debug')('app:SquadModel');
const Schema = mongoose.Schema;
const Joi = require('joi');
const ObjectId = mongoose.ObjectId;

const SquadSchema = new Schema({
	model: { type: String, default: 'Squad' },
	type: {
		type: String,
		default: 'Raid',
		enum: ['Raid', 'Assault', 'Infiltration', 'Envoy', 'Science']
	},
	rollBonus: { type: Number, required: true, default: 0 },
	upgrades: [{ type: ObjectId, ref: 'Upgrade' }],
	name: { type: String, required: true, min: 2, maxlength: 50, unique: true },
	team: { type: Schema.Types.ObjectId, ref: 'Team' },
	zone: { type: Schema.Types.ObjectId, ref: 'Zone' },
	country: { type: Schema.Types.ObjectId, ref: 'Country' },
	site: { type: Schema.Types.ObjectId, ref: 'Site' },
	origin: { type: Schema.Types.ObjectId, ref: 'Facility' },
	status: {
		damaged: { type: Boolean, default: false },
		deployed: { type: Boolean, default: false },
		destroyed: { type: Boolean, default: false },
		repair: { type: Boolean, default: false },
		secret: { type: Boolean, default: false }
	},
	gameState: []
});

SquadSchema.methods.deploy = async (unit, country) => {
	const banking = require('../../../wts/banking/banking');
	const { Account } = require('../../gov/account');

	try {
		modelDebugger(
			`Deploying ${unit.name} to ${country.name} in the ${country.zone.name} zone`
		);
		let cost = 0;
		if (unit.zone !== country.zone) {
			cost = unit.status.localDeploy;
			unit.status.deployed = true;
		}
		else if (unit.zone === country.zone) {
			cost = unit.status.globalDeploy;
			unit.status.deployed = true;
		}

		let account = await Account.findOne({
			name: 'Operations',
			team: unit.team
		});
		account = await banking.withdrawal(
			account,
			cost,
			`Deploying ${
				unit.name
			} to ${country.name.toLowerCase()} in the ${country.zone.name.toLowerCase()} zone`
		);

		modelDebugger(account);
		await account.save();
		await squad.save();
		modelDebugger(`${unit.name} deployed...`);

		return unit;
	}
	catch (err) {
		modelDebugger('Error:', err.message);
	}
};

SquadSchema.methods.validateSquad = function (squad) {
	const schema = {
		name: Joi.string().min(2).max(50).required()
	};

	return Joi.validate(squad, schema, { allowUnknown: true });
};

const Squad = mongoose.model('Squad', SquadSchema);

function validateSquad (squad) {
	// modelDebugger(`Validating ${squad.name}...`);

	const schema = {
		name: Joi.string().min(2).max(50).required()
	};

	return Joi.validate(squad, schema, { allowUnknown: true });
}

module.exports = { Squad, validateSquad };