const fs = require('fs');
const config = require('config');

const aircraftBPData = JSON.parse(fs.readFileSync(config.get('initPath') + 'init-json/initBlueprintAircraft.json', 'utf8'));
const facilityBPData = JSON.parse(fs.readFileSync(config.get('initPath') + 'init-json/initBlueprintFacility.json', 'utf8'));
const upgradeBPData = JSON.parse(fs.readFileSync(config.get('initPath') + 'init-json/initBlueprintUpgrade.json', 'utf8'));
const squadBPData = JSON.parse(fs.readFileSync(config.get('initPath') + 'init-json/initBlueprintSquad.json', 'utf8'));
const militaryBPData = JSON.parse(fs.readFileSync(config.get('initPath') + 'init-json/initBlueprintMilitary.json', 'utf8'));
const blueprintDataIn = [...aircraftBPData, ...facilityBPData, ...upgradeBPData, ...squadBPData, ...militaryBPData];

const { logger } = require('../middleware/log/winston'); // Import of winston for error logging
require('winston-mongodb');

const express = require('express');
const bodyParser = require('body-parser');
const gameServer = require('../config/config').gameServer;
const axios = require('axios');

const app = express();

// Bodyparser Middleware
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

async function runBlueprintLoad (runFlag) {
	if (!runFlag) return false;
	if (runFlag) await initLoad(runFlag);
	return true;
}

async function initLoad (doLoad) {
	if (!doLoad) return;

	// Delete now regardless of loadFlag
	await deleteAllBlueprints();

	let blueprintRecReadCount = 0;
	const blueprintRecCounts = { loadCount: 0, loadErrCount: 0, updCount: 0 };

	for await (const data of blueprintDataIn) {
		if (data.loadType == 'blueprint') {


			if (data.loadFlag === 'true') {
				++blueprintRecReadCount;
				await loadBlueprint(data, blueprintRecCounts);
			}
		}
	}

	logger.info(
		`Blueprint Load Counts Read: ${blueprintRecReadCount} Errors: ${blueprintRecCounts.loadErrCount} Saved: ${blueprintRecCounts.loadCount} Updated: ${blueprintRecCounts.updCount}`
	);

	return;
}

async function loadBlueprint (bpData, rCounts) {

	if (bpData.loadFlag === 'false') return; // don't load if not true

	try {

		const { data } = await axios.get(`${gameServer}init/initBlueprints/code/${bpData.code}`);

		if (!data.desc) {
			// New Blueprint here

			switch (bpData.buildModel) {
			case 'facility':
				await newFacilityBP(bpData, rCounts);
				break;
			case 'aircraft':
				await newAircraftBP(bpData, rCounts);
				break;
			case 'military':
				await newMilitaryBP(bpData, rCounts);
				break;
			case 'squad':
				await newSquadBP(bpData, rCounts);
				break;
			case 'upgrade':
				await newUpgradeBP(bpData, rCounts);
				break;

			default:
				logger.error(
					`Invalid New Blueprint BuildModel: ${bpData.buildModel}`
				);
				++rCounts.loadErrCount;
			}
		}
		else {
			// Existing Blueprint here ... nolonger doing updates so this is now counted as an error
			logger.error(
				`Blueprint skipped as code already exists in database: ${bpData.name} ${bpData.code}`
			);
			++rCounts.loadErrCount;
		}
	}
	catch (err) {
		logger.error(`Catch Blueprint Error: ${err.message}`, { meta: err });
		++rCounts.loadErrCount;
		return;
	}
}

async function deleteAllBlueprints () {
	try {
		let delErrorFlag = false;

		try {
			await axios.patch(`${gameServer}api/blueprints/deleteAll`);
		}
		catch (err) {
			logger.error(`Catch deleteAllBlueprints Error 1: ${err.message}`, { meta: err.stack });
			delErrorFlag = true;
		}

		if (!delErrorFlag) {
			logger.debug('All Blueprints succesfully deleted. (blueprintLoad');
		}
		else {
			logger.error('Some Error In Blueprints delete all (blueprintLoad)');
		}
	}
	catch (err) {
		logger.error(`deleteAllBlueprints Error 2: ${err.message}`, { meta: err.stack });
	}
}

async function newAircraftBP (bpData, rCounts) {

	// New Aircraft Blueprint here
	const bpAircraft = bpData;
	try {
		await axios.post(`${gameServer}api/blueprints`, bpAircraft);
		++rCounts.loadCount;
		logger.debug(`${bpAircraft.name} add saved to Aircraft Blueprint collection.`);
	}
	catch (err) {
		++rCounts.loadErrCount;
		logger.error(`New Aircraft Blueprint Save Error: ${err.message}`, { meta: err.stack });
	}

}

async function newMilitaryBP (bpData, rCounts) {

	// New Military Blueprint here
	const bpMilitary = bpData;
	try {
		await axios.post(`${gameServer}api/blueprints`, bpMilitary);
		++rCounts.loadCount;
		logger.debug(`${bpMilitary.name} add saved to Military Blueprint collection.`);
	}
	catch (err) {
		++rCounts.loadErrCount;
		logger.error(`New Military Blueprint Save Error: ${err.message}`, { meta: err.stack });
	}

}

async function newFacilityBP (bpData, rCounts) {

	// New Facility Blueprint here
	const bpFacility = bpData;
	try {

		if (
			bpData.site != '' &&
			bpData.site != 'undefined' &&
			bpData.site != undefined
		) {
			const site = await axios.get(`${gameServer}init/initSites/code/${bpData.site}`);
			const sData = site.data;

			if (!sData.type) {

				++rCounts.loadErrCount;
				logger.error(`New Facility Blueprint has Invalid Site: ${bpData.name} ${bpData.site}`);
				return;
			}
			else {
				bpFacility.site = sData._id;
			}
		}
		else {
			bpFacility.site = undefined;
		}

		await axios.post(`${gameServer}api/blueprints`, bpFacility);
		++rCounts.loadCount;
		logger.debug(`${bpFacility.name} add saved to Facility Blueprint collection.`);
	}
	catch (err) {
		++rCounts.loadErrCount;
		logger.error(`New Facility Blueprint Save Error: ${err.message}`, { meta: err.stack });
	}
}

async function newSquadBP (bpData, rCounts) {

	// New Squad Blueprint here
	const bpSquad = bpData;
	try {
		await axios.post(`${gameServer}api/blueprints`, bpSquad);
		++rCounts.loadCount;
		logger.debug(`${bpSquad.name} add saved to Squad Blueprint collection.`);
	}
	catch (err) {
		++rCounts.loadErrCount;
		logger.error(`New Squad Blueprint Save Error: ${err.message}`, { meta: err.stack });
	}

}

async function newUpgradeBP (bpData, rCounts) {
	// New Upgrade Blueprint here
	const bpUpgrade = bpData;
	try {
		await axios.post(`${gameServer}api/blueprints`, bpUpgrade);
		++rCounts.loadCount;
		logger.debug(`${bpUpgrade.name} add saved to Upgrade Blueprint collection.`);
	}
	catch (err) {
		++rCounts.loadErrCount;
		logger.error(`New Upgrade Blueprint Save Error: ${err.message}`, { meta: err.stack });
	}
}

module.exports = runBlueprintLoad;
