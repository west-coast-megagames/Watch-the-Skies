const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LogSchema = new mongoose.Schema({
    type: String,
    desc: String,
    date: { type: Date, defualt: Date.now },
    isPublished: Boolean
});


// log: [
//     {_ID: Number,
//     time: {type: Number},
//     turn: {type: String},
//     type: {type: String},
//     results: {
//       interception: {type: Boolean, default: false},
//       unitDamaged: {type: Boolean, default: false},
//       unitDestroyed: {type: Boolean, default: false},
//         enemy: {
//           _ID: Number,
//           enemyDamaged: {type: Boolean, default: false},
//           enemyDestroyed: {type: Boolean, default: false},
//           debris: [
//             {
//               _ID: Number,
//               class: {type: String},
//               type: {type:String},
//               country: {type:String}, 
//               required: {type: Boolean, deffault: true}, 
//               }
//             ]
//           }
//         }
//       }
//     ]