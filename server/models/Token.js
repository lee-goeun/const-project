const mongoose = require('mongoose'); 

var Schema = mongoose.Schema; 

var TokenSchema = new Schema({ 
    
    token: { 
        type: String, 
        required: true, 
    }, 
    address: { 
        type: String, 
        required: true, 
    }, 
    atype: { 
        type: String, 
        required: true, 
    },
    network: { 
        type: String, 
        required: true, 
    }, 
    price: { 
        type: Number, 
    }, 
    decimal: {
        type: Number,
    }, 
    update_at: { 
        type: Date, 
        default: Date.now 
    }
}); 

const Token = mongoose.model("Token", TokenSchema)
module.exports = { Token }

