/*
    header에서 아래와 같은 형식으로 오는 경우를 가정하고 있슴
    {
        "Authorization" : "Bearer access-token",
        "Refresh" : "refresh-token",
    }
*/
const { sign, verify, refreshVerify } = require("../utils/jwt_utils");
const jwt = require('jsonwebtoken');

const refresh = async (req, res) => {
    if (req.user) return;

    if (req.session.accessToken && req.cookies.refreshToken) {
        const authToken = req.session.accessToken;
        const refreshToken = req.cookies.refreshToken;

        const authResult = verify(authToken); // expired 여야 함
        const decoded = jwt.decode(authToken);

        if (decoded === null) {
            res.status(401).send({
                ok: false,
                message: "not authorized",
            });
        }

        const refreshResult = refreshVerify(refreshToken, decoded.id);

        // 재발급의 기본 가정은 access token이 만료되어야 함
        if (authResult.ok === false && authResult.message === 'jwt expired') {
            if (refreshResult.ok === false) {
                // 1. access token이 만료되고, refresh token도 만료된 경우, => 새로 로그인해야 함
                console.log('key refresh case 1');
                res.status(401).send({
                    ok: false,
                    message: 'not authorized!',
                });
            } else {
                // 2. access token만 만료되고, refresh token은 만료되지 않은 경우 => access token을 새로 발급
                console.log('key refresh case 2');
                const newAccessToken = sign(user);

                res.status(200).send({
                    ok: true,
                    data: {
                        accessToken: newAccessToken,
                        refreshToken,
                    },
                });
            }
        } else {
            // 3. access token이 만료되지 않은 경우 => refresh가 필요없음.
            console.log('key refresh case 3');
            res.status(400).send({
                oK: false,
                message: "Access token is not expired!",
            });
        }
    } else {
        console.log('key refresh case 4');
        res.status(400).send({
            ok: false,
            message: 'Access token and refresh token are need for refresh!',
        });
    }
    next();
};

const renewAccessToken = async (refreshToken, user) => {
    if (!refreshToken)
        return {
            ok: false,
            message: "Refresh token is missing",
        };
    const refreshResult = refreshVerify(refreshToken, user.id);
    if (!refreshResult.ok) {
        return {
            ok: false,
            message: refreshResult.message,
        };
    }
    const newAccessToken = sign(user);

    return {
        ok: true,
        accessToken: newAccessToken,
    };


}

module.exports = { refresh, renewAccessToken };