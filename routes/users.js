const express = require('express');
const router = express.Router();
const path = require('path');
const db = require("../config/mysql");
const conn = db.init();
const bcrypt = require('bcrypt');
const jwt = require("../utils/jwt_utils")

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});


router.get("/login", (req, res) => {
  res.render('login');
});

router.post("/login", (req, res) => {
  console.log("login 함수가 실행됩니다.");

  console.log("user ID:", req.body.id);
  console.log("password", req.body.pw);

  const paramID = req.body.id || req.query.id;
  const pw = req.body.pw || req.query.pw;

  if (req.session.user) {
    console.log("이미 로그인이 되어 있습니다.");
    res.writeHead(200, { "Content-Type": "text/html; charset=utf8" });
    res.write("<h1>aleady logged</h1>");
    res.write(`<div>[ID} : ${req.session.user.id} [PW] : ${req.session.user.name}</div>`);
    res.write('<a href="/process/example">예시로</a>');
    res.end();
  } else {
    console.log("로그인하여 세션을 생성합니다.");
    // 사용자의 요청에 대한 session을 형성함.
    // 실질적으로는 id와 pw를 확인하고 성공을 한 경우에 session을 만들어야 함.
    // 사용자의 정보는 DB에서 읽어와서 처리함
    let sql = "SELECT * from user where user_id = ?";
    let params = [paramID];
    conn.query(sql, params, (err, rslt) => {
      if (err) console.log("SQL문을 실행할 수 없습니다. 이유: " + err);
      else {
        if (rslt[0] === undefined) {
          res.send("unknown user");
          return;
        }
        const same = bcrypt.compareSync(pw, rslt[0].password);
        if (same) {
          const accessKey = jwt.sign({ id: paramID, name: rslt[0].user_name, role: rslt[0].role });
          req.session.user = {
            id: paramID,
            name: rslt[0].user_name,
            role: rslt[0].role,
          };
          req.session.accessToken = accessKey;

          let refreshKey = rslt[0].refresh;
          const decoded = jwt.refreshVerify(refreshKey, paramID);
          if (!decoded.ok && decoded.ok === 'jwt expired') {
            refreshKey = jwt.refresh();
            res.cookie("refreshToken", refreshKey, {
              maxAge: 14 * 24 * 60 * 60 * 1000,
              sameSite: "none",
              secure: true,
              httpOnly: true,
            });
            sql = 'UPDATE user SET refresh = ? WHERE user_id = ?';
            params = [refreshKey, paramID];
            conn.query(sql, params, function (err, result) {
              if (err) console.log("SQL문을 실행할 수 없습니다. 이유: " + err);
            });
          }
          res.render('loggedin', { id: paramID, userName: rslt[0].user_name, role: rslt[0].role, accessKey: accessKey, refreshKey: refreshKey });
        } else {
          res.send("user id or password do not matched");
        }
      }
    });
  }
});

router.get("/logout", (req, res) => {
  console.log("로그아웃 함수가 실행됩니다.")

  if (req.session.user) {
    console.log("로그아웃 중입니다.");
    req.session.destroy((err) => {
      if (err) {
        console.log("세션을 삭제하는 과정에 오류가 발생했습니다.");
        return;
      }
      console.log("세션이 삭제되었습니다.");
      let sql = "UPDATE user SET refresh = NULL WHERE user_id = ?";
      params = [req.cookies.id];
      conn.query(sql, params, function (err, rslt) {
        if (err) {
          console.log("UPDATE query 실헹에서 오류가 발생했습니다.");
        }
      });
      res.clearCookie("id");
      res.clearCookie("name");
      res.render("login");
    });
  } else {
    console.log("로그인이 안되어 있습니다.");
    res.render("login");
  }
});

router.get('/signup', (req, res) => {
  res.render('signup');
});

router.post('/signup', (req, res) => {
  const { id, name, pw } = req.body;
  let sql = "SELECT user_id AS cnt FROM user WHERE user_id = ?";
  let params = [id];
  conn.query(sql, params, function (err, rslt) {
    if (err) console.log("SQL문을 실행할 수 없습니다. 이유: " + err);
    else {
      if (rslt.length == 0) {
        const encrypted = bcrypt.hashSync(pw, 10);
        sql = "INSERT INTO user (user_id, password, user_name) VALUES (?, ?, ?)";
        params = [id, encrypted, name];
        conn.query(sql, params, function (err, result) {
          if (err) console.log("SQL문을 실행할 수 없습니다. 이유: " + err);
          else {
            res.redirect('/process/example');
          }
        })
      } else {
        res.send(id + " is already registered!");
      }

    }
  });
});

module.exports = router;
