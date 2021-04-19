const bodyParser = require('body-parser'); 
const cookieParser = require('cookie-parser'); 
const express = require('express'); 
const mongoose = require('mongoose');
const cors = require('cors'); 
const app = express(); 


// Environment Setting ===========================
const dotenv = require('dotenv'); 
const path = require('path'); 

dotenv.config({ 
    path: path.resolve(
        process.cwd(), 
        ".env"
    )
})

const { User } = require('./models/User'); 

app.use(bodyParser.json()); 
app.use(cookieParser()); 
app.use(cors()); 

// Test  ========================================
app.get('/api/test', (req, res) => { 
    const test_data = {
        userName: 'Const-User1'
    }; 
    console.log("test_data: ", test_data); 
    res.json(test_data); 
})

// MongoDB Setting ==============================
const {
    DB_ADDRESS, DB_PORT, 
    DB_USER, DB_PASSWORD, DB_DATABASE
} = process.env; 
const DB_URI = `mongodb://${DB_USER}:${DB_PASSWORD}@${DB_ADDRESS}:${DB_PORT}`

mongoose.connect(DB_URI, {
    dbName: DB_DATABASE, 
	useNewUrlParser: true, useUnifiedTopology: true,
	useCreateIndex: true, useFindAndModify: true
}).then( () => console.log("MongoDB Connected..")).catch(err => console.log(err)) 


const auth = (req, res, next) => { 
    // authentication 

    // get token in clinet's cookie 
    let token = req.cookies.x_auth; 

    // decode token and find user 
    User.findByToken(token, (err, user) => { 
        if(err) throw err; 
        if(!user) return res.json({ isAuth: false, error: true })
        
        req.token = token; 
        req.user = user; 
        next(); 
    })
    // if user exist, authentication complete
}

app.post('/api/users/signup', (req, res) => { 

    // Sign up
    const user = new User(req.body);

    user.save((err, user) => { 
        if (err) return res.json({ success: false, err })
        else { 
            // res.cookie("x_auth", user.token).status(200).json({ 
            //     success: true, 
            //     userId: user._id
            // }) 
            res.json({status: "success"})
        }
    })
})

app.post('/api/users/signin', (req, res) => { 

    // Log in
    User.findOne({ email: req.body.email }, (err, user) => { 
        if(!user) { 
            return res.json({ 
                success: false, 
                message: "Not found: email address.."
            })
        }
        
        user.comparePassword(req.body.password, (err, isMatch) => { 
            if(!isMatch) return res.json({
                success: false, 
                message: "Wrong Password"
            })

            // Generate token if password is correct 
            user.generateToken( (err, user) => { 
                if (err) return res.status(400).send(err); 

                // Save token in Cookie
                res.cookie("x_auth", user.token).status(200).json({ 
                    success: true, 
                    userId: user._id
                })
            }) 
        })
    })
})


app.get('/api/users/auth', auth, (req, res) => { 
    res.status(200).json({ 
        _id: req.user._id, 
        // isAdmin: req.user.role === 0 ? false : true,
        isAuth: true, 
        email: req.user.email, 
        name: req.user.name 
    })
})

app.get('/api/users/logout', auth, (req, res) => { 

    User.findOneAndUpdate({_id: req.user._id}, 
        { token: "" }, 
        (err, user) => { 
            if(err) return res.json({ success: false, err}); 
            return res.status(200).send({ 
                success: true
        })
    })
})

const port = process.env.PORT || 5000; 
app.listen(port, () => { 
    console.log(`express is running on ${port}`); 
})