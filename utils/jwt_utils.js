// jwtUtil-util.js
const jwt = require('jsonwebtoken');
const secret = process.env.JWT_KEY;
const db = require("../config/mysql");
const conn = db.init();


module.exports = {
    sign: (user) => { // access token 발급
        const payload = { // access token에 들어갈 payload
            id: user.id,
            user: user.name,
            role: user.role
        };
        return jwt.sign(payload, secret, { // secret으로 sign하여 발급하고 return
            expiresIn: '1m',       // 유효기간
            algorithm: 'HS256', // 암호화 알고리즘
            issuer: 'C3coding Dongtan',
        });
    },
    verify: (token) => { // access token 검증
        let decoded = null;
        try {
            decoded = jwt.verify(token, secret);
            return {
                ok: true,
                user: decoded,
            };
        } catch (err) {
            return {
                ok: false,
                message: err.message,
            };
        }
    },
    refresh: () => { // refresh token 발급
        return jwt.sign({}, secret, { // refresh token은 payload 없이 발급
            algorithm: 'HS256',
            expiresIn: '14d',
            issuer: 'C3codingDongtan',
        });
    },
    refreshVerify: (token, userId) => { // refresh token 검증
        let sql = "SELECT refresh FROM user WHERE user_id = ?";
        let params = [userId];
        return conn.query(sql, params, (err, rslt) => {
            if (err) {
                console.log("SQL문을 실행할 수 없습니다. 이유: " + err);
                return {
                    ok: false,
                    message: "Query doesn't executed",
                };
            } else {
                const data = rslt[0].refresh;
                if (token === data) {
                    try {
                        jwt.verify(token, secret);
                        return {
                            ok: true,
                            message: 'vefified',
                        };
                    } catch (err) {
                        return {
                            ok: false,
                            message: err.message,
                        }
                    }
                } else {
                    console.log("verify refresh token 2");
                    return {
                        ok: false,
                        message: "refreshe token does not matched!",
                    };
                }
            }
        });
    },
};