const fileUpload = require('express-fileupload');
const { Router } = require('express');
const makeDir = require('make-dir');

// const { Module } = require('../../models');
const app = Router();
app.use(fileUpload());

app.post('/upload', (req) => {
  // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
  const startupFile = req.files.foo;
  // const fileName = req.body.fileName;
  console.log('DB1 ==> ', startupFile);
  // Use the mv() method to place the file somewhere on your server
  (async () => {
    const path = await makeDir(`${__dirname}/../../../uploads/directory`);

    console.log('DIR ', path, ' CREATED SUCCESSFULLY');
    //= > '/Users/sindresorhus/fun/unicorn/rainbow/cake'
  })();

  startupFile.mv(`${__dirname}/../../../uploads/directory/${startupFile.name}`, (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log('uploaded');
    }
  });
});

module.exports = app;
