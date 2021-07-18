const mongoose = require('mongoose'); 

var Schema = mongoose.Schema; 

var HistorySchema = new Schema({ 
    
    address: { 
        type: String,
        required: true, 
    }, 
    network: {
        type: String, 
        required: true
    },
    total_value: { 
        type: Object
    }, 
    detail: {
        type: Object, 
    }, 
    update_at: { 
        type: Date, 
        default: Date.now
    }
});

const History = mongoose.model("History", HistorySchema)
module.exports = { History }