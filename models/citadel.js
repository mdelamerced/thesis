var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// define a new schema
var citadelSchema = new Schema({
    slug : { type: String, lowercase: true, unique: true },
	topic : String,
	headline : String,
	urlO : String,
	postdate : Date,
	twitter : [String],
	media : String,
	category : String,
	text : String,
	breakingnews : Boolean,
	vetted : Boolean,
	tags : [String],
	
    lastupdated : { type: Date, default: Date.now }
});

// export 'citadel' model
module.exports = mongoose.model('research',citadelSchema);