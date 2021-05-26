const mongoose = require('mongoose'); 
const bcrpyt = require('bcrypt'); 
const saltRounds = 10
const jwt = require('jsonwebtoken')

var Schema = mongoose.Schema; 

var UserSchema = new Schema({ 
    
    email: { 
        type: String, 
        trim: true, 
        unique: 1
    }, 
    name: { 
        type: String, 
        trim: true, 
        unique: 1, 
        maxlength: 50
    }, 
    password: { 
        type: String, 
        minlength: 5
    },
    agree_section: {
        type: Object, 
    }, 
    token: { 
        type: String
    }
});


UserSchema.pre('save', function(next)  { 

    var user = this; 

    var token = jwt.sign(user._id.toHexString(), 'secretToken')
    user.token = token 
    
    if(user.isModified('password')) { 

        // password Encrypting 
        bcrpyt.genSalt(saltRounds, function (err, salt) { 
            if(err) return next(err);

            bcrpyt.hash(user.password, salt, function(err, hash) { 
                if(err) return next(err);

                user.password = hash;
                next()
            })
        })
    } else { 
        next() 
    }
}) 

UserSchema.methods.comparePassword = function(plainPassword, cb) { 
    bcrpyt.compare(plainPassword, this.password, function(err, isMatch) { 
        if(err) return cb(err);
        cb(null, isMatch)
    })
}

UserSchema.methods.generateToken = function(cb) { 

    var user = this; 

    // Generate Token via jsonwebtoken
    var token = jwt.sign(user._id.toHexString(), 'secretToken')
    user.token = token 

    user.save(function(err, user) { 
        if(err) return cb(err) 
        cb(null, user) 
    })
}


UserSchema.statics.findByToken = function(token, cb) { 
    var user = this; 
    // decode token 
    jwt.verify(token, 'secretToken', function(err, decoded) { 
        // find user by user._id
        // check if token is equal with clinet's token
        user.findOne({"_id": decoded, "token": token}, function(err, user) { 
            if(err) return cb(err); 
            cb(null, user) 
        })
    }) 
}

const User = mongoose.model("User", UserSchema)
module.exports = { User }