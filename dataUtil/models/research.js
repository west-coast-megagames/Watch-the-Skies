const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UnlockSchema = new Schema({
	code: { type: String },
	type: { type: String }
});

const BreakthroughSchema = new Schema({
	code: { type: String },
	type: { type: String }
});

const fields = [
	'Biology',
	'Computer Science',
	'Electronics',
	'Engineering',
	'Genetics',
	'Material Science',
	'Physics',
	'Psychology',
	'Social Science',
	'Quantum Mechanics'
];

const ProgressSchema = new Schema({
	team: {
		_id: { type: Schema.Types.ObjectId, ref: 'Team', required: true },
		name: { type: String, required: true }
	},
	progress: { type: Number, default: 0, required: true },
	funding: { type: Number, default: 0, required: true },
	totalFunding: { type: Number, default: 0, required: true }
});

const ResearchSchema = new Schema({
	model: { type: String, default: 'Research' },
	name: { type: String },
	code: { type: String },
	level: { type: Number },
	progress: { type: Number, default: 0 },
	prereq: [UnlockSchema],
	desc: { type: String },
	unlocks: [UnlockSchema],
	breakthrough: [BreakthroughSchema],
	gameState: [],
	researchHistory: [{ type: Schema.Types.ObjectId, ref: 'Log' }]
});

const Research = mongoose.model('Research', ResearchSchema, 'research');

const KnowledgeResearch = Research.discriminator(
	'KnowledgeResearch',
	new Schema({
		type: { type: String, default: 'Knowledge' },
		field: { type: String, enum: fields },
		credit: { type: Schema.Types.ObjectId, ref: 'Team' },
		status: {
			pending: { type: Boolean, default: false },
			available: { type: Boolean, default: true },
			completed: { type: Boolean, default: false },
			published: { type: Boolean, default: false }
		},
		teamProgress: [ProgressSchema]
	})
);

const AnalysisResearch = Research.discriminator(
	'AnalysisResearch',
	new Schema({
		type: { type: String, default: 'Analysis' },
		team: { type: Schema.Types.ObjectId, ref: 'Team' },
		salvage: [
			{
				gear: { type: Schema.Types.ObjectId, ref: 'Upgrade' },
				system: { type: Schema.Types.ObjectId, ref: 'Upgrade' },
				infrastructure: { type: Schema.Types.ObjectId, ref: 'Upgrade' },
				facility: { type: Schema.Types.ObjectId, ref: 'Facility' },
				site: { type: Schema.Types.ObjectId, ref: 'Site' },
				outcome: { type: String, enum: ['Destroy', 'Damage', 'Kill', 'Preserve'] }
			}
		],
		status: {
			available: { type: Boolean },
			completed: { type: Boolean }
		}
	})
);

const TheorySchema = new Schema({
	name: { type: String },
	level: { type: Number },
	type: { type: String },
	prereq: [UnlockSchema],
	code: { type: String },
	desc: { type: String },
	field: { type: String }
});

const FieldSchema = new Schema({
	field: { type: String },
	rolls: { type: Number }
});

const TechResearch = Research.discriminator(
	'TechResearch',
	new Schema({
		type: { type: String, default: 'Technology' },
		field: {
			type: String,
			enum: [ 'Military', 'Infrastructure', 'Biomedical', 'Agriculture', 'Analysis', 'Placeholder' ]
		},
		team: { type: Schema.Types.ObjectId, ref: 'Team' },
		funding: { type: Number, default: 0 },
		status: {
			visible: { type: Boolean, default: true },
			available: { type: Boolean, default: false },
			completed: { type: Boolean, default: false }

		},
		theoretical: [TheorySchema],
		knowledge: [FieldSchema]
	})
);

module.exports = {
	Research,
	KnowledgeResearch,
	AnalysisResearch,
	TechResearch
};
