// Account Model - Using Mongoose Model
const { Account, validateAccount } = require('../models/account');
const { Team } = require('../models/team');
const { logger } = require('../middleware/log/winston'); // Import of winston for error logging
require('winston-mongodb');

function inArray (array, value) {
	for (let i = 0; i < array.length; i++) {
		if (array[i] == value) return true;
	}
	return false;
}

async function chkAccount (runFlag) {
	const nameVals = [
		'Treasury',
		'UNSC',
		'Governance',
		'Operations',
		'Science',
		'Political'
	];

	const teamCounts = [];
	let tCnt = {};
	// load teams
	for (const team of await Team.find()) {
		tCnt = {
			hexId: team._id.toHexString(),
			owner: team.shortName,
			acctsCount: 0,
			unsCount: 0,
			treCount: 0,
			govCount: 0,
			opsCount: 0,
			sciCount: 0,
			polCount: 0
		};
		teamCounts.push(tCnt);
	}

	for (const account of await Account.find()
		// .populate('team', 'name shortName')    does not work with .lean
		.lean()) {
		// do not need toObject with .lean()
		// let testPropertys = account.toObject();

		if (!Object.prototype.hasOwnProperty.call(account, 'model')) {
			logger.error(
				`model missing for Account ${account.name} ${account.owner} ${account._id}`
			);
		}

		if (!Object.prototype.hasOwnProperty.call(account, 'gameState')) {
			logger.error(
				`gameState missing for Account ${account.name} ${account.owner} ${account._id}`
			);
		}

		if (!Object.prototype.hasOwnProperty.call(account, 'deposits')) {
			logger.error(
				`deposits missing for Account ${account.name} ${account.owner} ${account._id}`
			);
		}
		else if (account.deposits.length < 15) {
			logger.error(
				`deposits has too few entries for Account ${account.name} ${account.owner} ${account._id}`
			);
		}

		if (!Object.prototype.hasOwnProperty.call(account, 'withdrawals')) {
			logger.error(
				`withdrawals missing for Account ${account.name} ${account.owner} ${account._id}`
			);
		}
		else if (account.withdrawals.length < 15) {
			logger.error(
				`withdrawals has too few entries for Account ${account.name} ${account.owner} ${account._id}`
			);
		}

		if (!Object.prototype.hasOwnProperty.call(account, 'code')) {
			logger.error(
				`code missing for Account ${account.name} ${account.owner} ${account._id}`
			);
		}
		else if (
			account.code === '' ||
			account.code == undefined ||
			account.code == null
		) {
			logger.error(
				`code is blank for Account ${account.name} ${account.owner} ${account._id}`
			);
		}

		if (!Object.prototype.hasOwnProperty.call(account, 'name')) {
			logger.error(
				`name missing for Account ${account.name} ${account.owner} ${account._id}`
			);
		}
		else {
			if (
				account.name === '' ||
				account.name == undefined ||
				account.name == null
			) {
				logger.error(
					`name is blank for Account ${account.name} ${account.owner} ${account._id}`
				);
			}
			if (!inArray(nameVals, account.name)) {
				logger.error(`Invalid account name $${account.name} ${account._id}`);
			}
		}

		if (!Object.prototype.hasOwnProperty.call(account, 'balance')) {
			logger.error(
				`Account balance is missing  ${account.name} ${account._id}`
			);
		}
		else if (isNaN(account.balance)) {
			logger.error(
				`Account ${account.name} ${account._id} balance is not a number ${account.balance}`
			);
		}

		if (!Object.prototype.hasOwnProperty.call(account, 'owner')) {
			logger.error(
				`owner missing for Account ${account.name} ${account.owner} ${account._id}`
			);
		}
		else if (
			account.owner === '' ||
			account.owner == undefined ||
			account.owner == null
		) {
			logger.error(
				`owner is blank for Account ${account.name} ${account.owner} ${account._id}`
			);
		}

		if (!Object.prototype.hasOwnProperty.call(account, 'autoTransfers')) {
			logger.error(
				`autoTransfers missing for Account ${account.name} ${account.owner} ${account._id}`
			);
		}

		try {
			const { error } = validateAccount(account);
			if (error) {
				logger.error(
					`Account Validation Error For ${account.name} ${account.owner} Error: ${error.details[0].message}`
				);
			}
		}
		catch (err) {
			logger.error(
				`Account Validation Error For ${account.name} ${account.owner} Error: ${err.details[0].message}`
			);
		}

		let countRef = -1;
		let teamHex = undefined;
		let teamOwner = undefined;

		if (Object.prototype.hasOwnProperty.call(account, 'owner')) {
			teamOwner = account.owner;
		}

		if (!Object.prototype.hasOwnProperty.call(account, 'team')) {
			logger.error(
				`Team missing for Account ${account.name} ${account.owner} ${account._id}`
			);
		}
		else {
			const team = await Team.findById({ _id: account.team });
			if (!team) {
				logger.error(
					`team reference is invalid for Account ${account.name} ${account.owner} ${account._id}`
				);
				countRef = teamCounts.findIndex((tc) => tc.owner == teamOwner);
			}
			else {
				teamHex = account.team._id.toHexString();
				countRef = teamCounts.findIndex((tc) => tc.hexId == teamHex);
			}
		}

		if (countRef >= 0) {
			++teamCounts[countRef].acctsCount;
			switch (account.code) {
			case 'TRE':
				++teamCounts[countRef].treCount;
				break;

			case 'UNS':
				++teamCounts[countRef].unsCount;
				break;

			case 'GOV':
				++teamCounts[countRef].govCount;
				break;

			case 'OPS':
				++teamCounts[countRef].opsCount;
				break;

			case 'SCI':
				++teamCounts[countRef].sciCount;
				break;

			case 'POL':
				++teamCounts[countRef].polCount;
				break;

			default:
				logger.error(
					`Account has invalid code: ${account.code} ${account.name} ${account.owner} ${account._id}`
				);
			}
		}
		else {
			logger.error(
				`Account Failed to Find Team in Count Array: ${teamOwner} ${teamHex} ${account.code} ${account.name} ${account.owner} ${account._id}`
			);
		}
	}

	// check team counts for errors
	for (tCnt of teamCounts) {
		if (tCnt.acctsCount != 6) {
			logger.error(
				`Team Owner ${tCnt.owner} ${tCnt.hexId} does not have 6 accounts: : ${tCnt.acctsCount}`
			);
		}
		if (tCnt.unsCount != 1) {
			logger.error(
				`Team Owner ${tCnt.owner} ${tCnt.hexId} does not have 1 UNSC account: ${tCnt.unsCount}`
			);
		}
		if (tCnt.treCount != 1) {
			logger.error(
				`Team Owner ${tCnt.owner} ${tCnt.hexId} does not have 1 Treasury account: ${tCnt.treCount}`
			);
		}
		if (tCnt.govCount != 1) {
			logger.error(
				`Team Owner ${tCnt.owner} ${tCnt.hexId} does not have 1 Governance account: ${tCnt.govCount}`
			);
		}
		if (tCnt.opsCount != 1) {
			logger.error(
				`Team Owner ${tCnt.owner} ${tCnt.hexId} does not have 1 Operations account: ${tCnt.opsCount}`
			);
		}
		if (tCnt.sciCount != 1) {
			logger.error(
				`Team Owner ${tCnt.owner} ${tCnt.hexId} does not have 1 Science account: ${tCnt.sciCount}`
			);
		}
		if (tCnt.polCount != 1) {
			logger.error(
				`Team Owner ${tCnt.owner} ${tCnt.hexId} does not have 1 Political account: ${tCnt.polCount}`
			);
		}
	}

	runFlag = true;
	return runFlag;
}

module.exports = chkAccount;
