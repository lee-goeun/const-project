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


app.use('/api', bodyParser.urlencoded({extended: false})); 
app.use('/api', bodyParser.json()); 
app.use(cookieParser()); 
app.use(cors()); 

// Production ===================================
// if (process.env.NODE_ENV === "production") {
//     app.use(express.static(path.join(__dirname, "../build"))); 
//     app.get("/", (req, res) => { 
//         res.sendFile(path.join(__dirname, "../build", "index.html")); 
//     })
// }

// Test  ========================================
app.get('/api/test', (req, res) => { 
    const test_data = {
        userName: 'Const-User1'
    }; 
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


var userRouter = require('./api/user');
app.use('/api/users', userRouter);

var walletRouter = require('./api/wallet'); 
app.use('/api/wallets', walletRouter)



const port = process.env.PORT || 5000; 
app.listen(port, () => { 
    console.log(`express is running on ${port}`); 
})