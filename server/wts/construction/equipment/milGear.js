const fs = require('fs')
const config = require('config');

const file = fs.readFileSync(require.resolve(config.get('initPathWTS') + 'json/equipment/milGear.json'));
const gearData = JSON.parse(file);

equipmentDebugger = require('debug')('app:equipment');

const gears = []

const { Gear } = require('../../../models/gov/equipment/gear');

// Load function to load all equipment.
async function loadMilGears () {
    let count = 0;

    await gearData.forEach(gear => {
        equipmentDebugger(gear);
        gears[count] = new Equip(gear);
        count++;
    });

    return `${count} military equipment availible in WTS...`
};

// Knowledge Constructor Function
function Equip(gear) {
    this.name = gear.name;
    this.cost = gear.cost;
    this.prereq = gear.prereq;
    this.desc = gear.desc;
    this.category = gear.category;
    this.stats = gear.stats

    this.build = async function() {
        let newGear = new Gear(this)

        await newGear.save();

        console.log(`${newGear.name} has been built...`)

        return newGear;
    }
}

module.exports = { loadMilGears, gears };