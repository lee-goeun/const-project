const express = require('express'); 
const app = express(); 
const cors = require('cors'); 
const bodyParser = require('body-parser'); 
const port = process.env.PORT || 5000; 

app.use(cors()); 

app.use(bodyParser.json()); 
app.use('/api/test', (req, res) => { 
    const test_data = {
        userName: 'Const-User1'
    }; 
    console.log("test_data: ", test_data); 
    res.json(test_data); 
})

app.listen(port, () => { 
    console.log(`express is running on ${port}`); 
})