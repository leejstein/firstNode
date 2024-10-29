const cookieParser = require('cookie-parser');
var express = require('express');

var router = express.Router();


/* GET home page. */
router.get('/', function (req, res, next) {
  let ar = {
    'row': 3,
    'col': 3,
    'data': [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
  };
  console.log("javascript array: " + ar.row);
  let jsonAr = JSON.stringify(ar);
  console.log('json array: ' + jsonAr);
  let br = JSON.parse(jsonAr);
  console.log('recovered javascript array: ' + br.data);


  if (req.cookies !== undefined) {
    console.log(req.cookies);
    var cNum = 234;
    if (req.cookies['my cookie'] !== undefined) {
      cNum = Number(req.cookies['my cookie']) + 1;
    } else {
      res.cookie('cookieKey', 'cookieValue', { maxAge: 900000, httpOnly: true });
    }

    res.cookie('my cookie', cNum, { maxAge: 900000, httpOnly: true });
    res.render('index', {
      title: {
        hello: "hehe",
        id: "coding",
      },
      gold: {
        meme: "my",
        num: 23,
      },
    });
  }
});

router.get("/map", (req, res) => {
  let info = [{ name: "Korea", x_pos: 800, y_pos: 600 },
  { name: "USA", x_pos: 1400, y_pos: 300 }
  ];
  console.log("this is for testing");
  res.render('map', { pos: info });
});

module.exports = router;
