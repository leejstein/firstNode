var express = require('express');
let { authJWT } = require('../middlewares/authJWT');
const { refresh } = require('../middlewares/refresh');

var router = express.Router();

router.get('/example', authJWT, (req, res, next) => {
    console.log('example 함수가 실행됩니다.');
    console.log(req.user);
    if (req.session.accessToken) {
        res.render('example', { user: req.user.user });
    } else {
        res.redirect('/users/login');
    }
});
module.exports = router;