const gameServer = require('../config/config').gameServer;
const axios = require('axios');
const { logger } = require('../middleware/log/winston'); // Import of winston for error logging

async function dropAll (doDrop) {
	if (!doDrop) return;

	// drop all tables
	/*
  await Research.deleteMany();
  await Log.deleteMany();
  await LogError.deleteMany();
	await LogInfo.deleteMany();
	*/

	try {
		await axios.patch(`${gameServer}api/upgrades/deleteAll`);
		logger.info('Delete of All upgrades done (initDropAll).');
	}
	catch (err) {
		logger.error(`Catch deleteAll upgrades in initDropAll: ${err.message}`, { meta: err.stack });
	}

	try {
		await axios.patch(`${gameServer}api/blueprints/deleteAll`);
		logger.info('Delete of All blueprints done (initDropAll).');
	}
	catch (err) {
		logger.error(`Catch deleteAll blueprints in initDropAll: ${err.message}`, { meta: err.stack });
	}

	try {
		await axios.patch(`${gameServer}api/zones/deleteAll`);
		logger.info('Delete of All zones done (initDropAll).');
	}
	catch (err) {
		logger.error(`Catch deleteAll Zones in initDropAll: ${err.message}`, { meta: err.stack });
	}

	try {
		await axios.patch(`${gameServer}api/team/deleteAll`);
		logger.info('Delete of All teams done (initDropAll).');
	}
	catch (err) {
		logger.error(`Catch deleteAll Teams in initDropAll: ${err.message}`, { meta: err.stack });
	}

	try {
		await axios.patch(`${gameServer}api/countries/deleteAll`);
		logger.info('Delete of All Country done (initDropAll).');
	}
	catch (err) {
		logger.error(`Catch deleteAll Country in initDropAll: ${err.message}`, { meta: err.stack });
	}

	try {
		await axios.patch(`${gameServer}api/sites/deleteAll`);
		logger.info('Delete of All Sites done (initDropAll).');
	}
	catch (err) {
		logger.error(`Catch deleteAll Sites in initDropAll: ${err.message}`, { meta: err.stack });
	}

	try {
		await axios.patch(`${gameServer}api/facilities/deleteAll`);
		logger.info('Delete of All Facilities done (initDropAll).');
	}
	catch (err) {
		logger.error(`Catch deleteAll Facilities in initDropAll: ${err.message}`, { meta: err.stack });
	}

	try {
		await axios.patch(`${gameServer}api/aircrafts/deleteAll`);
		logger.info('Delete of All Aircraft done (initDropAll).');
	}
	catch (err) {
		logger.error(`Catch deleteAll Aircraft in initDropAll: ${err.message}`, { meta: err.stack });
	}

	try {
		await axios.patch(`${gameServer}api/accounts/deleteAll`);
		logger.info('Delete of All Accounts done (initDropAll).');
	}
	catch (err) {
		logger.error(`Catch deleteAll Accounts in initDropAll: ${err.message}`, { meta: err.stack });
	}

	try {
		await axios.patch(`${gameServer}api/military/deleteAll`);
		logger.info('Delete of All Military done (initDropAll).');
	}
	catch (err) {
		logger.error(`Catch deleteAll Military in initDropAll: ${err.message}`, { meta: err.stack });
	}

	try {
		await axios.patch(`${gameServer}api/squad/deleteAll`);
		logger.info('Delete of All Squad done (initDropAll).');
	}
	catch (err) {
		logger.error(`Catch deleteAll Squad in initDropAll: ${err.message}`, { meta: err.stack });
	}

	try {
		await axios.patch(`${gameServer}api/articles/deleteAll`);
		logger.info('Delete of All Articles done (initDropAll).');
	}
	catch (err) {
		logger.error(`Catch deleteAll Articles in initDropAll: ${err.message}`, { meta: err.stack });
	}

	try {
		await axios.patch(`${gameServer}api/user/deleteAll`);
		logger.info('Delete of All users done (initDropAll).');
	}
	catch (err) {
		logger.error(`Catch deleteAll Users in initDropAll: ${err.message}`, { meta: err.stack });
	}

	return true;
}

module.exports = dropAll;
