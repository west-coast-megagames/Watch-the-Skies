const express = require('express');
const router = express.Router();
const routeDebugger = require('debug')('app:routes');
const airMission = require('../../wts/intercept/missions');
const nexusEvent = require('../../middleware/events/events');
const nexusError = require('../../middleware/util/throwError');

const { Account } = require('../../models/account');
const { Aircraft } = require('../../models/aircraft');
const { Facility } = require('../../models/facility');
const { Site } = require('../../models/site');

const { newUnit } = require('../../wts/construction/construction');
const banking = require('../../wts/banking/banking');

// @route   PUT game/interceptors   ... update
// @Desc    Find Attacker/Defender and activate intercept
// @access  Public
router.put('/', async (req, res) => {
	let result = '';
	let { aircraft, target } = req.body;
	const { mission } = req.body;
	routeDebugger(req.body);

	aircraft = await Aircraft.findById(aircraft).populate('systems').populate('site').populate('origin');

	if (mission === 'Interception' || mission === 'Escort' || mission === 'Recon Aircraft') {
		target = await Aircraft.findById(target).populate('systems').populate('site');
		aircraft.site = target.site._id;
	}
	else if (mission === 'Diversion' || mission === 'Transport' || mission === 'Recon Site' || mission === 'Patrol') {
		target = await Site.findById(target);
		aircraft.site = target._id;
	}

	result = `${aircraft.name} launching...`;
	aircraft.country = target.country;
	aircraft.zone = target.zone;
	aircraft.mission = mission;

	aircraft = await aircraft.launch(mission); // Changes attacker status
	result = `${result} ${aircraft.name} en route to attempt ${mission.toLowerCase()}.`;

	await airMission.start(aircraft, target, mission);
	routeDebugger(result);
	res.status(200).send(result);
	nexusEvent.emit('updateAircrafts');
});

// @route   POST game/interceptors/build
// @Desc    Takes in blueprint and name and facility(?) and starts construction on a new aircraft
// @access  Public
router.post('/build', async (req, res) => {
	const { name, facility, type, team } = req.body; // please give me these things
	try {
		const aircraft = await newUnit(name, facility, type, team); // just the facility ID
		res.status(200).send(aircraft);
	}
	catch (err) {
		res.status(404).send(err); // This returns a really weird json... watch out for that
	}
});

// @route   POST game/interceptors/transfer
// @Desc
// @access  Public
router.put('/transfer', async (req, res) => {// work in progress, still broken
	let { aircraft } = req.body; // please give me these things
	const { facility } = req.body;
	try {
		const target = await Facility.findById(facility).populate('site');
		aircraft = await Aircraft.findById(aircraft);
		if (!aircraft || aircraft == null) {
			nexusError('Could not find aircraft!', 404);
		}

		aircraft.status.deployed = true;
		aircraft.status.ready = false;
		aircraft.site = target._id;

		const mission = 'Transfer';
		aircraft.mission = mission;
		aircraft.origin = facility._id;

		aircraft = await aircraft.save();
		await airMission.start(aircraft, target, mission);

		res.status(200).send(`Transfer of ${aircraft.name} to ${target.name} initiated...`);
	}
	catch (err) {
		res.status(400).send(`Error in transfer route: ${err}`);
	}
});

// @route   PUT game/interceptors/repair
// @desc    Update aircraft to max health
// @access  Public
router.put('/repair', async function (req, res) {
	const aircraft = await Aircraft.findById(req.body._id);
	console.log(req.body);
	let account = await Account.findOne({
		name: 'Operations',
		team: aircraft.team
	});
	if (account.balance < 2) {
		res
			.status(402)
			.send(
				`No Funding! Assign more money to your operations account to repair ${aircraft.name}.`
			);
	}
	else {
		account = await banking.withdrawal(
			account,
			2,
			`Repairs for ${aircraft.name}`
		);
		await account.save();

		aircraft.status.repair = true;
		aircraft.ready = false;
		await aircraft.save();

		res.status(200).send(`${Aircraft.name} put in for repairs...`);
		nexusEvent.emit('updateAircrafts');
	}
});

// @route   PUT game/repairAircraft
// @desc    Update aircraft to max health
// @access  Public
router.put('/repairAircraft', async function (req, res) {
	const aircraft = await Aircraft.findById(req.body._id);
	console.log(req.body);
	console.log(aircraft);
	let account = await Account.findOne({
		name: 'Operations',
		team: aircraft.team
	});
	if (account.balance < 2) {
		routeDebugger('Not enough funding...');
		res
			.status(402)
			.send(
				`No Funding! Assign more money to your operations account to repair ${aircraft.name}.`
			);
	}
	else {
		account = await banking.withdrawal(
			account,
			2,
			`Repairs for ${aircraft.name}`
		);
		await account.save();
		routeDebugger(account);

		aircraft.status.repair = true;
		aircraft.status.ready = false;
		await aircraft.save();

		routeDebugger(`${aircraft.name} put in for repairs...`);

		res.status(200).send(`${aircraft.name} put in for repairs...`);
		nexusEvent.emit('updateAircrafts');
	}
});

module.exports = router;