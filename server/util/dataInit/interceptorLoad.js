const fs = require('fs')
const config = require('config');
const file = fs.readFileSync(config.get('initPath') + 'init-json/initinterceptor.json', 'utf8');
const interceptorDataIn = JSON.parse(file);
//const mongoose = require('mongoose');
const interceptorLoadDebugger = require('debug')('app:interceptorLoad');

const supportsColor = require('supports-color');

const express = require('express');
const bodyParser = require('body-parser');

//mongoose.set('useNewUrlParser', true);
//mongoose.set('useFindAndModify', false);
//mongoose.set('useCreateIndex', true);

// Interceptor Model - Using Mongoose Model
const { Interceptor, validateInterceptor } = require('../../models/ops/interceptor');
const { Zone } = require('../../models/zone');
const { Country } = require('../../models/country'); 
const { Team } = require('../../models/team');
const { Base } = require('../../models/base');

const app = express();

// Bodyparser Middleware
app.use(express.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

async function runinterceptorLoad(runFlag){
  try {  
    //interceptorLoadDebugger("Jeff in runinterceptorLoad", runFlag);    
    if (!runFlag) return false;
    if (runFlag) {
      await deleteAllInterceptors(runFlag);
      await initLoad(runFlag);
    }
    return true;
  } catch (err) {
    interceptorLoadDebugger('Catch runinterceptorLoad Error:', err.message);
    return false; 
  }
};

async function initLoad(doLoad) {
  
  //interceptorLoadDebugger("Jeff in initLoad", doLoad, interceptorDataIn.length);    
  if (!doLoad) return;

  for (let i = 0; i < interceptorDataIn.length; ++i ) {
    
    //interceptorLoadDebugger("Jeff in runinterceptorLoad loop", i, interceptorDataIn[i].name );    
    //interceptorLoadDebugger("Jeff in runinterceptorLoad loop", i, interceptorDataIn[i] );
    
    await loadInterceptor(interceptorDataIn[i]);
  }
};

async function loadInterceptor(iData){
  try {   
    interceptorLoadDebugger("Jeff in loadInterceptor ", iData.name); 
    let interceptor = await Interceptor.findOne( { designation: iData.name } );
    if (!interceptor) {
       // New Interceptor here
       let interceptor = new Interceptor({ 
           designation: iData.name,
           type: iData.type,
           code: iData.code
        }); 

        let { error } = validateInterceptor(interceptor); 
        if (error) {
          interceptorLoadDebugger("New Interceptor Validate Error", team.designation, error.message);
          return;
        }
        
        interceptor.stats  = iData.stats;
        interceptor.status = iData.status;

        if (iData.parentCode1 != ""){
          let team = await Team.findOne({ teamCode: iData.parentCode1 });  
          if (!team) {
            interceptorLoadDebugger("Interceptor Load Team Error, New Interceptor:", iData.name, " Team: ", iData.parentCode1);
          } else {
            interceptor.team = team._id;
            interceptorLoadDebugger("Interceptor Load Team Found, Interceptor:", iData.name, " Team: ", iData.parentCode1, "Team ID:", team._id);
          }
        }      

        if (iData.parentCode2 != "" && iData.parentCode2 != "undefined" ){
          let base = await Base.findOne({ baseCode: iData.parentCode2 });  
          if (!base) {
            interceptorLoadDebugger("Interceptor Load Base Error, New Interceptor:", iData.name, " Base: ", iData.parentCode2);
          } else {
            interceptor.base = base._id;
            interceptorLoadDebugger("Interceptor Load Base Found, Interceptor:", iData.name, " Base: ", iData.parentCode2, "Base ID:", base._id);
          }
        }      

        if (iData.location.zone != ""){
          let zone = await Zone.findOne({ zoneCode: iData.location.zone });  
          if (!zone) {
            interceptorLoadDebugger("Interceptor Load Zone Error, New Interceptor:", iData.name, " Zone: ", iData.location.zone);
          } else {
            interceptor.location.zone = zone._id;
            interceptorLoadDebugger("Interceptor Load Zone Found, New Interceptor:", iData.name, " Zone: ", iData.location.zone, "Zone ID:", zone._id);
          }      
        }

        if (iData.location.country != ""){
          let country = await Country.findOne({ code: iData.location.country });  
          if (!country) {
            interceptorLoadDebugger("Interceptor Load Country Error, New Interceptor:", iData.name, " Country: ", iData.location.country);
          } else {
            interceptor.location.country = country._id;
            interceptorLoadDebugger("Interceptor Load Country Found, New Interceptor:", iData.name, " Country: ", iData.location.country, "Country ID:", country._id);
          }      
        }
        
        await interceptor.save((err, interceptor) => {
          if (err) return console.error(`New Interceptor Save Error: ${err}`);
          interceptorLoadDebugger(interceptor.designation + " add saved to interceptor collection.");
        });
    } else {       
      // Existing Interceptor here ... update
      let id = interceptor._id;
      
      interceptor.designation = iData.name;
      interceptor.type        = iData.type;
      interceptor.code        = iData.code;
      interceptor.stats       = iData.stats;
      interceptor.status      = iData.status;

      if (iData.parentCode1 != ""){
        let team = await Team.findOne({ teamCode: iData.parentCode1 });  
        if (!team) {
          interceptorLoadDebugger("Interceptor Load Team Error, Update Interceptor:", iData.name, " Team: ", iData.parentCode1);
        } else {
          interceptor.team = team._id;
          interceptorLoadDebugger("Interceptor Load Update Team Found, Interceptor:", iData.name, " Team: ", iData.parentCode1, "Team ID:", team._id);
        }
      }  
      
      if (iData.parentCode2 != "" && iData.parentCode2 != "undefined" ){
        let base = await Base.findOne({ baseCode: iData.parentCode2 });  
        if (!base) {
          interceptorLoadDebugger("Interceptor Load Base Error, Update Interceptor:", iData.name, " Base: ", iData.parentCode2);
        } else {
          interceptor.base = base._id;
          interceptorLoadDebugger("Interceptor Load Update Base Found, Interceptor:", iData.name, " Base: ", iData.parentCode2, "Base ID:", base._id);
        }
      }      

      if (iData.location.zone != ""){
        let zone = await Zone.findOne({ zoneCode: iData.location.zone });  
        if (!zone) {
          interceptorLoadDebugger("Interceptor Load Zone Error, Update Interceptor:", iData.name, " Zone: ", iData.location.zone);
        } else {
          interceptor.location.zone = zone._id;
          interceptorLoadDebugger("Interceptor Load Zone Found, Update Interceptor:", iData.name, " Zone: ", iData.location.zone, "Zone ID:", zone._id);
        }      
      }

      if (iData.location.country != ""){
        let country = await Country.findOne({ code: iData.location.country });  
        if (!country) {
          interceptorLoadDebugger("Interceptor Load Country Error, Update Interceptor:", iData.name, " Country: ", iData.location.country);
        } else {
          interceptor.location.country = country._id;
          interceptorLoadDebugger("Interceptor Load Country Found, Update Interceptor:", iData.name, " Country: ", iData.location.country, "Country ID:", country._id);
        }      
      }

      const { error } = validateInterceptor(interceptor); 
      if (error) {
        interceptorLoadDebugger("Interceptor Update Validate Error", iData.name, error.message);
        return
      }
   
      await interceptor.save((err, interceptor) => {
      if (err) return console.error(`Interceptor Update Save Error: ${err}`);
      interceptorLoadDebugger(interceptor.designation + " update saved to interceptor collection.");
      });
    }
  } catch (err) {
    interceptorLoadDebugger('Catch Interceptor Error:', err.message);
    return;
}

};

async function deleteAllInterceptors(doLoad) {
  
  interceptorLoadDebugger("Jeff in deleteAllInterceptors", doLoad);    
  if (!doLoad) return;

  try {
    for await (const interceptor of Interceptor.find()) {    
      let id = interceptor._id;

      interceptorLoadDebugger("Jeff in deleteAllInterceptors loop", interceptor.designation); 
      try {
        let interceptorDel = await Interceptor.findByIdAndRemove(id);
        if (interceptorDel = null) {
          interceptorLoadDebugger(`The Interceptor with the ID ${id} was not found!`);
        }
        interceptorLoadDebugger("Jeff in deleteAllInterceptors loop after remove", interceptor.designation); 
      } catch (err) {
        interceptorLoadDebugger('Interceptor Delete All Error:', err.message);
      }
    }        
    interceptorLoadDebugger("All Interceptors succesfully deleted!");
  } catch (err) {
    interceptorLoadDebugger(`Delete All Interceptors Catch Error: ${err.message}`);
  }
};  

module.exports = runinterceptorLoad;