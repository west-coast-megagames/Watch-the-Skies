const { Upgrade } = require('../../models/upgrade');
const { Military } = require('../../models/military');
const { Squad } = require('../../models/squad');
const { Aircraft } = require('../../models/aircraft');
const { Facility } = require('../../models/facility');

/*
function that applies upgrade to any unit

make a funtion that takes the upgrade array of a unit and returns
the desired numerical stat effect
*/
async function upgradeValue (upgradeArray, desiredStat) {
	let total = 0;
	for(const element of upgradeArray) {// for every upgrade in the upgrade array and for every element in the stat object of the upgrade
		for(const stat in element.stats) {
			if(stat.type === desiredStat) total = total + element.stats.effect[stat]; // if the key (stat) is the stat we want add it to total
			// if you are reading this, this has been untested and likely doesn't work cause scott is a terrible programmer oh god
		}
	}
	return total;
}

// pass me the full unit
async function addUpgrade (upgrade, unit) {
	upgrade = await Upgrade.findById(upgrade);

	if (!upgrade.status.storage) return 'This Upgrade is already in use somewhere!';

	switch(unit.model) {
	case 'Military':
		unit = await Military.findById(unit._id);
		break;
	case 'Squad':
		unit = await Squad.findById(unit._id);
		break;
	case 'Aircraft':
		unit = await Aircraft.findById(unit._id);
		break;
	case 'Facility':
		unit = await Facility.findById(unit._id);
		break;
	default:
		return 'UwU could not find the right Unit for addUpgrade! someone made an oopsie-woopsie!';

	}
	try{
		unit.upgrades.push(upgrade);
		upgrade.status.storage = false;
		upgrade = await upgrade.save();
		unit = await unit.save();
		return `Added "${upgrade.name}" to unit "${unit.name}"`;
	}
	catch(err) {
		return `ERROR IN addUpgrade: ${err}`;
	}

}

async function removeUpgrade (upgrade, unit) {
	upgrade = await Upgrade.findById(upgrade);
	switch(unit.model) {
	case 'Military':
		unit = await Military.findById(unit._id);
		break;
	case 'Squad':
		unit = await Squad.findById(unit._id);
		break;
	case 'Aircraft':
		unit = await Aircraft.findById(unit._id);
		break;
	case 'Facility':
		unit = await Facility.findById(unit._id);
		break;
	default:
		return 'UwU could not find the right Unit for removeUpgrade! someone made an oopsie-woopsie!';
	}
	let response = 'Could not find desired Upgrade to remove from unit';
	const index = unit.upgrades.indexOf(upgrade._id);
	if (index > -1) {
		unit.upgrades.splice(index, 1);
		response = `Removed "${upgrade.name}" from unit "${unit.name}"`;
	}
	try{
		unit = await unit.save();
		upgrade.status.storage = true;
		upgrade = await upgrade.save();

		return response;
	}
	catch(err) {
		return `ERROR IN removeUpgrade: ${err}`;
	}

}

module.exports = { upgradeValue, addUpgrade, removeUpgrade };