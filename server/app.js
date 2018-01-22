var express = require('express');
var path = require('path');
var sizeOf = require('image-size');
var bodyParser = require('body-parser');

//setup aws
var AWS = require('aws-sdk');
AWS.config.loadFromPath('./awsconfig.json');

//setup multer for file upload
var multer  = require('multer');
var storage = multer.memoryStorage()
var upload = multer({ storage: storage });

//allow loading a single file
var type = upload.single('sampleFile');

var app = express();
app.set('view engine', 'ejs');

//enable CORS
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(bodyParser.json());

var rekognition = new AWS.Rekognition();

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname + '/index.html'));
});

app.post('/upload', type, function (req,res) {
  //var dimensions = sizeOf(req.body.image);
  //console.log(dimensions.width, dimensions.height);
  console.log(req.body);

  var base64image = new Buffer(req.body.image).toString('base64');
  var base64imageForAWS = new Buffer(req.body.image, 'base64');
  
  var params = {
   Attributes: ["ALL"],
   Image: {
    Bytes: base64imageForAWS
   }
  };
  
  
  rekognition.detectFaces(params, function(err, data) {
    if (err) {
      console.log(err, err.stack); // an error occurred
    } else {

      var leftEye = data.FaceDetails[0].Landmarks.find(o => o.Type === 'eyeLeft');
      var rightEye = data.FaceDetails[0].Landmarks.find(o => o.Type === 'eyeRight');
    }
  
    var imageSrc = 'data:image/gif;base64,' + base64image;
    res.json({ title: 'Hey', uploadedImage: imageSrc, faceDetails: data.FaceDetails, imageWidth: dimensions.width, imageHeight: dimensions.height});
  });
  
  //res.status(204).end();
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})
