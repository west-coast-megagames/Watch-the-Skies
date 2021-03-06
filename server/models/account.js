const mongoose = require('mongoose'); // Mongo DB object modeling module
const Joi = require('joi'); // Schema description & validation module
const { logger } = require('../middleware/log/winston'); // Loging midddleware
const nexusError = require('../middleware/util/throwError'); // Costom error handler util

// Global Constants
const Schema = mongoose.Schema; // Destructure of Schema

// Transfer sub-schema
const TransferSchema = new Schema({
	to: { type: String },
	from: { type: String },
	amount: { type: Number },
	note: { type: String }
});

// Account Schema
const AccountSchema = new Schema({
	model: { type: String, default: 'Account' },
	team: { type: Schema.Types.ObjectId, ref: 'Team', required: true },
	owner: { type: String },
	name: { type: String, minlength: 2, maxlength: 50, required: true },
	code: { type: String, minlength: 3, maxlength: 3, required: true },
	balance: { type: Number, default: 0 },
	deposits: [Number],
	withdrawals: [Number],
	autoTransfers: [TransferSchema],
	gameState: []
});

// validateAccount method
AccountSchema.methods.validateAccount = async function () {
	const { validTeam } = require('../middleware/util/validateDocument');
	logger.info(`Validating ${this.model.toLowerCase()} ${this.name}...`);
	const schema = Joi.object({
		name: Joi.string().min(2).max(50).required(),
		code: Joi.string().min(3).max(3).required().uppercase(),
		owner: Joi.string(),
		balance: Joi.number()
	});

	const { error } = schema.validate(this, { allowUnknown: true });
	if (error != undefined) nexusError(`${error}`, 400);

	await validTeam(this.team);
};

const Account = mongoose.model('account', AccountSchema); // Creation of Account Model

module.exports = { Account };
