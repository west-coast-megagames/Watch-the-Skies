const researchDebugger = require('debug')('app:research');
const nexusEvent = require('../../startup/events');
const { logger } = require('../../middleware/winston');

const Research = require('../../models/sci/research') // Imports the Research object which is the base Model for Technology, Knowledge and Analysis
const { d6 } = require('../../util/systems/dice'); // Import of the dice randomizer found in `dice.js`

const techCost = [ 30, 80, 120, 250, 300, 350 ] // Arbitratily set at increments of 50 currently
const fundingCost = [ 0, 4, 9, 15, 22 ] // A cost of 3 + funding level per roll currently

const { Facility } = require('../../models/gov/facility/facility');
const { Team } = require('../../models/team/team');
const { ResearchReport } = require('../reports/reportClasses');

async function startResearch () {
    for await (let lab of await Facility.find({ type: 'Lab' })) {
        if (lab.research.length < 1) {
            researchDebugger(`${lab.name} does not have research to conduct...`);
        } else {
            researchDebugger(`${lab.name} has research to conduct`);
            await calculateProgress(lab);
        }
    }
    nexusEvent.emit('updateResearch');
    nexusEvent.emit('updateFacilities');
}

// FUNCTION for calculating the progress applied to a single RESEARCH project
async function calculateProgress(lab) {
    let report = new ResearchReport
    try {
        console.log(lab._id); // Future await request to get lab information from DB
        let tech = await Research.findById(lab.research[0]).populate('team'); // Imports the specific Research object by _id
        report.progress.startingProgress = tech.progress;
        researchDebugger(tech)
        let team = await Team.findById(tech.team);
        report.project = tech._id;
        report.lab = lab._id;
        // researchDebugger(lab)
        // researchDebugger(team);
        // let test = team.sciRate;
        // researchDebugger(`Team Sci Rate: ${test} - type: ${typeof test}`);
        // researchDebugger(`Lab Sci Rate: ${lab.sciRate} - type: ${typeof lab.sciRate}`);
        let sciRate = team.sciRate + lab.sciRate
        let sciBonus = lab.bonus
        researchDebugger(`Science Rate: ${sciRate}`)
        researchDebugger(typeof sciRate)
        let progressInfo = await researchMultiplyer(sciRate, lab.funding, sciBonus); // Calculates progress by getting the teams sciRate, the funding level, and any relevant multiplery bonus

        tech.progress += progressInfo.progress; // Adds progress to the current Research

        tech.progress > techCost[tech.level] ? tech.status.completed = true : null; // Checks for compleation of current research

        if (tech.status.completed === true) {
            researchDebugger(`${tech.name} completed!`)
            tech = await completeTech(tech);
            lab.research = [];
        } else {
            researchDebugger(`${tech.progress} progress towards ${tech.name}...`);
        }

        report.team = team._id;
        report.lab = lab._id;
        report.project = tech._id;
        report.funding = lab.funding;
        report.progress.endingProgress = tech.progress;
        report.stats.sciRate = sciRate;
        report.stats.sciBonus = sciBonus;
        report.stats.completed = tech.status.completed;
        report.stats.finalMultiplyer = progressInfo.multiplyer
        report.rolls = progressInfo.rolls
        report.outcomes = progressInfo.outcomes
        report.stats.breakthroughCount = progressInfo.breakthroughs

        await report.saveReport();
     
        lab.funding = 0;
        lab = await lab.save() // Saves the modified lab
        tech = await tech.save(); // Saves the current project to the database

        researchDebugger(lab);
        researchDebugger(tech);

        return tech;

    } catch (err) {
        logger.error(err)
        researchDebugger(`CalcProgress Error: ${err}`);
        return
    }
};

// Calculates the multiplier for the current research project and returns the progress
function researchMultiplyer(sciRate, funding, sciBonus) {
    let multiplyer = 1 + sciBonus; // Gives the base multiplier calculated as 1 + any sciBonus the team or lab have
    let rolls = [];
    let outcomes = [];
    let breakthroughs = 0;
    // For loop that rolls a d6 per funding level, and either adds or subtracts from the base multiplier
    for (let i = 0; i < funding + 1; i++) {
        let roll = d6(); // Roll of a d6
        rolls.push(roll);

        researchDebugger(roll);

        // Switch for assigning the outcome of the multiplier roll.
        switch (true) {
            case (roll <= 1):
                researchDebugger('Set Back');
                multiplyer -= 0.5 // Reduction of the multiplier due to a set-back in the research
                outcomes.push('Setback')
                break;
            case (roll <= 3):
                researchDebugger('Progress');
                multiplyer += 0.25 // Progress, an increase speed of 25% | TODO, make each level variable rather then hard coded
                outcomes.push('Progress');
                break;
            case (roll <= 5):
                researchDebugger('Fast Progress');
                multiplyer += 0.6 // Fast Progress, an increase speed of 60% | TODO, make each level variable rather then hard coded
                outcomes.push('Development');
                break;
            case (roll === 6):
                researchDebugger('Breakthrough');
                multiplyer += 0.2 // Breakthrough, an increase speed of 20% | TODO, make each level variable rather then hard coded
                outcomes.push('Breakthrough');
                breakthroughs += 1;
                break;
            default:
                researchDebugger('Got to default...'); // This should never happen, if it does we have a coding error....
        }
    };

    researchDebugger(`Research Multiplyer: ${multiplyer}`);
    let progress = sciRate * multiplyer // Final calculation of progress on the technology
    researchDebugger(`Progress: ${progress}...`);
    return { progress, multiplyer, rolls, outcomes, breakthroughs } // Returns progress to the Calculate Progress function.
};

async function completeTech (research) {
    knowledgeDebugger(`Enough progress has been made to complete ${research.name}...`);
    research.status.availible = false;
    research.status.completed = true;

    for await (let item of research.unlocks) {
        techDebugger(`${item.type} - ${item.name}`);
    }

    reserach = await research.save();
  
    return research;
};

module.exports = { startResearch, calculateProgress, techCost, fundingCost };