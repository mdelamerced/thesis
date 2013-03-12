var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//main topic schema
var generalTopic = new Schema({
	topic : { type: String, required: true },
})
// entry schema
var citadelSchema = new Schema({
    slug : { type: String, lowercase: true, unique: true },
	headline : { type: String, required: true },
	urlO : { type: String, required: true },
	postdate : Date,
	twitter : [String],
	media : [String],
	category : String,
	text : String,
	breakingnews : Boolean,
	vetted : Boolean,
	atags : [String],
	
    lastupdated : { type: Date, default: Date.now }
});

// export 'citadel' model
module.exports = mongoose.model('research',citadelSchema);