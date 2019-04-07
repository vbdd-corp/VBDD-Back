const fileUpload = require('express-fileupload');
const { Router } = require('express');
// const { Module } = require('../../models');
// var things = require('./things.js');
const app = Router();

// app.set('view engine', 'ejs');
app.use(fileUpload());
// app.use('/things', things);

/*
app.post('/upload', (req) => {
  // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
  const startupFile = req.files.foo;
  const fileName = req.body.fileName;
  console.log('DB1 ==> ', startupFile);
  // Use the mv() method to place the file somewhere on your server
  startupFile.mv(`${__dirname}/../../../uploads/${fileName}.jpg`, (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log('uploaded');
    }
  });
}); */

// app.listen(9428);

module.exports = { app };
