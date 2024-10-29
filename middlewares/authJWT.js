/*
    header에서 아래와 같은 형식으로 오는 경우를 가정하고 있슴
    {
        "Authorization" : "Bearer jwt-token"
    }
*/
const jwt_utils = require("../utils/jwt_utils");
const { verify } = require("../utils/jwt_utils");
const { renewAccessToken } = require('./refresh');

module.exports = {
    authJWT: (req, res, next) => {
        if (req.session.user) {
            const token = req.session.accessToken;
            const result = verify(token);
            if (result.ok) {
                req.user = result;
                next();
            } else {
                if (result.message === 'jwt expired') {
                    refreshToken = req.cookies.refreshToken;
                    const renewResult = renewAccessToken(refreshToken, req.session.user);
                    if (verifyResult.ok) {
                        req.session.accessToken = renewResult.accessToken;
                    }
                    req.user = result;
                    next();
                } else
                    res.status(401).send({
                        ok: false,
                        message: result.message,
                    });
            }
        } else {
            next();
        }
    },
};