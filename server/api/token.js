var express = require('express');
var router = express.Router();

// const { Token } = require('../models/Token'); 
const { getKlaytnTokenPrice } = require('./smart_contract/klaytn'); 

router.get('/klaytnTokenPrice', (req, res) => {
    getKlaytnTokenPrice().then(
        klaytn_token_price => res.json({status: true, data: klaytn_token_price})
    ); 
})

module.exports = router;