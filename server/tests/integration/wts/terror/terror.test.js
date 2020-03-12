const request = require('supertest');
const { Zone }  = require('../../../../models/zone');
const { Country }  = require('../../../../models/country');
const mongoose = require('mongoose');

const { battle, coverage, crisis, cityDestruction, nuclearStrike, industryDestruction, alienActivity, alienRaid, alienGroundForces, orbitalStrike, invasion, publicAnnouncement }
       = require('../../../../wts/terror/terror');

let server;

describe('wts terrror', () => {
  beforeEach(() => { server = require('../../../../server'); });
  afterEach(async () => { 
    await Zone.deleteOne({ zoneCode: 'Z1'});
    await Zone.deleteOne({ zoneCode: 'Z2'});
    await Zone.deleteOne({ zoneCode: 'Z3'});
    await Zone.deleteOne({ zoneCode: 'Z4'});
    await Zone.deleteOne({ zoneCode: 'Z5'});
    await Country.deleteOne({ code: 'C1'});
    await Country.deleteOne({ code: 'C2'});
    await Country.deleteOne({ code: 'C3'});
    await Country.deleteOne({ code: 'C4'});
    await Country.deleteOne({ code: 'C5'});
    await Country.deleteOne({ code: 'Q5'});
    server.close(); 
    });

  describe('crisis', () => {

    it('it should return updated terror', async () => {
      const zone = new Zone(
        { zoneCode: 'Z1', 
          zoneName: 'Zone Test 1',
          terror: 5 
        });
      await zone.save();
      const country = new Country(
        { code: 'C1', 
          name: 'Country Test 1' ,
          zone: zone._id
        });
      await country.save();
      
      let saveId = zone._id;
      crisisObj = {name: "Bio-Scare"};
      let reason = await crisis(zone._id, crisisObj);
      
      zoneUpd = await Zone.findById(saveId);

      // starts out at 5  + d6
      expect(zoneUpd.terror).toBeGreaterThanOrEqual(6);
      expect(zoneUpd.terror).toBeLessThanOrEqual(11);
      expect(reason).toMatch(/Current Terror/);

    });    

    it('It should send message if invalid zone passed in', async () => {
      const country = new Country(
        { code: 'C2', 
          name: 'Country Test 2' ,
          zone: zone._id
        });
      await country.save();
      testId = country._id
      
      crisisObj = {name: "Bio-Scare"};
      let reason = await crisis(country._id, crisisObj);

      expect(reason).toMatch(/Zone not available/);

    });

  });
  // end of crisis tests

  describe('battle', () => {

    it('it should return updated terror', async () => {
      const zone = new Zone(
        { zoneCode: 'Z3', 
          zoneName: 'Zone Test 3',
          terror: 5 
        });
      await zone.save();
      const country = new Country(
        { code: 'C3', 
          name: 'Country Test 3' ,
          zone: zone._id
        });
      
      await country.save();
      
      let saveId = zone._id;
      let reason = await battle(country._id);
      
      zoneUpd = await Zone.findById(saveId);

      // starts out at 5  + 10
      expect(zoneUpd.terror).toBeGreaterThanOrEqual(15);
      expect(reason).toMatch(/A battle/);

    });    

    it('It should send message if invalid country passed in', async () => {
      
      // pass in invalid id ... don't need to create a record
      testId = new mongoose.Types.ObjectId();
      let reason = await battle(testId);
      
      // starts out at 0  + 10
      expect(reason).toMatch(/Country not available/);

    });

    it('It should send message if country does not have valid zone ', async () => {
      
      // pass in invalid id ... don't need to create a record
      testId = new mongoose.Types.ObjectId();
      const country = new Country(
        { code: 'Q5', 
          name: 'Country Test Q5' ,
          zone: testId
        });
     
      await country.save();
     
      let reason = await battle(country._id);
     
      // starts out at 0  + 10
      expect(reason).toMatch(/Zone not available/);

    });

  });
  // end of battle tests

  describe('invasion', () => {

    it('it should return updated terror', async () => {
      const zone = new Zone(
        { zoneCode: 'Z4', 
          zoneName: 'Zone Test 4',
          terror: 5 
        });
      await zone.save();
      const country = new Country(
        { code: 'C4', 
          name: 'Country Test 4' ,
          zone: zone._id
        });
      
      await country.save();
      
      let saveId = zone._id;
      let reason = await invasion(country._id);
      
      zoneUpd = await Zone.findById(saveId);

      // starts out at 5  + 2
      expect(zoneUpd.terror).toBeGreaterThanOrEqual(7);
      expect(reason).toMatch(/An invasion/);

    });    

    it('It should send message if invalid country passed in', async () => {
      
      // pass in invalid id ... don't need to create a record
      testId = new mongoose.Types.ObjectId();
      let reason = await invasion(testId);
      
      // starts out at 0  + 2
      expect(reason).toMatch(/Country not available/);

    });

    it('It should send message if country does not have valid zone ', async () => {
      
       // pass in invalid id ... don't need to create a record
       testId = new mongoose.Types.ObjectId();
      const country = new Country(
        { code: 'C5', 
          name: 'Country Test 5' ,
          zone: testId
        });
      
      await country.save();
      
      let reason = await invasion(country._id);
      
      // starts out at 0  + 2
      expect(reason).toMatch(/Zone not available/);

    });

  });
  // end of invasion tests
});  

