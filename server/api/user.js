var express = require('express');
var router = express.Router();

const { User } = require('../models/User'); 

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

router.post('/signup', (req, res) => { 

    // Sign up
    const user = new User(req.body);
    user.save((err, user) => { 
        if (err) return res.json({ success: false, err })
        else { 
            res.json({status: "success"})
        }
    })
})

router.post('/checkemail', (req, res) => {

	User.findOne({email: req.body.email}, (err, user) => {
		if(!user) {
			return res.json({result: false})
		}
		return res.json({result: true})
	})
})

router.post('/signin', (req, res) => { 

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


router.get('/auth', auth, (req, res) => { 
    res.status(200).json({ 
        _id: req.user._id, 
        // isAdmin: req.user.role === 0 ? false : true,
        isAuth: true, 
        email: req.user.email, 
        name: req.user.name 
    })
})

router.get('/logout', auth, (req, res) => { 

    User.findOneAndUpdate({_id: req.user._id}, 
        { token: "" }, 
        (err, user) => { 
            if(err) return res.json({ success: false, err}); 
            return res.status(200).send({ 
                success: true
        })
    })
})

module.exports = router;