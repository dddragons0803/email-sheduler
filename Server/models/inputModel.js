const { Timestamp } = require("mongodb")
const mongoose = require("mongoose")
const inputSchema = mongoose.Schema({
time:{
    type:Date,
    require:true,
},
interval:{
    type:String,
},
emailBody: {
    type: String,
    required: true
},
subject: {
    type: String,
    required: true
},
emailAddresses: {
    type: [String],  // Array of strings to handle multiple emails
    required: true,
    validate: [arrayLimit, '{PATH} exceeds the limit of 100']  // Optional: limits the number of emails
}

},
{
    Timestamp:true,
});

function arrayLimit(val) {
    return val.length <= 100;  // Ensures no more than 100 emails can be stored
} 

module.exports = mongoose.model('Input', inputSchema);