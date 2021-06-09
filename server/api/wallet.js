var express = require('express');
var router = express.Router();

const { Wallet } = require('../models/Wallet'); 
const { KlaytnBalanceWallet } = require('./smart_contract/klaytn'); 

router.get('/:user_id', (req, res) => { 

    Wallet.find({user_id: req.params.user_id}, (err, wallets) => { 
        if (err) return res.json({status: false, err})
        else { return res.json({status: true, wallets}) }
    })
})

router.post('/import', (req, res) => { 

    const {user_id, address} = req.body; 

    Wallet.findOne({user_id, address}, (err, wallet) => {

        if (err) return res.json({status: false, err })
        if (wallet) { res.json({status: false, msg: 'duplicated wallet'})}
        else { 
            const wallet = new Wallet(req.body); 
            wallet.save((err, _) => { 
                if (err) return res.json({status: false, msg: err })
                else { res.json({status: true}) }
            })
        }
    })

})

router.post('/balance', (req, res) => { 
    const { address, atype } = req.body; 

    switch (atype) {
        case "KLAY":
            KlaytnBalanceWallet(address)
            .then((result => { 
                res.json({status: true, result})
            }))
            break;
    
        default:
            res.json({status: false, 'msg': 'wrong atype variable'})
            break;
    }
})


module.exports = router;