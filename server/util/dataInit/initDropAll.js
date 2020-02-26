const { Zone } = require('../../models/zone');
const { Country } = require('../../models/country'); 
const { Team } = require('../../models/team/team');
const Research = require('../../models/sci/research');
const Log = require('../../models/logs/log');
const { Site } = require('../../models/sites/site');
const { Aircraft } = require('../../models/ops/aircraft');
const { Account } = require('../../models/gov/account');
const { Equipment } = require('../../models/gov/equipment/equipment');
const { Facility } = require('../../models/gov/facility/facility');
const { Military } = require('../../models/ops/military/military');
const { Squad } = require('../../models/ops/squad');
const { User } = require('../../models/user');

async function dropAll(doDrop) {
  
    if (!doDrop) return;
  
    // drop all tables
    await Zone.deleteMany();
    await Country.deleteMany();
    await Team.deleteMany();
    await Site.deleteMany();
    await Account.deleteMany();
    await Aircraft.deleteMany();
    await Equipment.deleteMany();
    await Facility.deleteMany();
    await Military.deleteMany();
    await Research.deleteMany();
    await Log.deleteMany();
    await Squad.deleteMany();
    await User.deleteMany();

    return true;
}

module.exports = dropAll;