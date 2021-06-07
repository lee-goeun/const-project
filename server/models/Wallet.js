const mongoose = require('mongoose'); 

var Schema = mongoose.Schema; 

var WalletSchema = new Schema({ 
    
    user_id: { 
        type: mongoose.Schema.Types.ObjectId,
        required: true, 
        ref: 'User' 
    }, 
    address: { 
        type: String, 
        required: true, 
    }, 

    atype: {
        type: String, 
        required: true
    },
    new: { 
        type: Boolean, 
        required: true, 
        default: false
    }, 
    nick_name: {
        type: String, 
    }, 
    create_at: { 
        type: Date, 
        default: Date.now
    }, 
    // update_at: { 
    //     type: Date, 
    //     default: Date.now
    // }
});


const Wallet = mongoose.model("Wallet", WalletSchema)
module.exports = { Wallet }