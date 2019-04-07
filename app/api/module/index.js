const fileUpload = require('express-fileupload');
const { Router } = require('express');
// const makeDir = require('make-dir');
// const { Module } = require('../../models');
const app = Router();

app.use(fileUpload());

/* function getModuleSafely(moduleId) {
  try {
    return Module.getById(moduleId);
  } catch (err) {
    if (err.name === 'NotFoundError') {
      return null;
    }
    throw err;
  }
} */
/*
app.post('/upload/:studentID/:fileID/:moduleID', (req) => {
  // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
  // const moduleId = parseInt(req.params.moduleID, 10);
  // const typeModuleId = getModuleSafely(moduleId).typeModuleId;
  const startupFile = req.files.foo;
  // console.log('DB1 ==> ', startupFile);

  switch (moduleId) {
    case 1:
      if (startupFile.name.startsWith('recto')) {}
      // remove all files in dir whose name begin with recto
      // https://stackoverflow.com/questions/44076455/delete-all-files-in-a-certain-directory-that-there-names-start-with-a-certain-st


      break;
    default:
      break;
  }

  (async () => {
    const path = await makeDir(`${__dirname}/../../../uploads/directory`);

    console.log('DIR ', path, ' CREATED SUCCESSFULLY');
    //= > '/Users/sindresorhus/fun/unicorn/rainbow/cake'
  })();

  startupFile.mv(`${__dirname}/../../../uploads/directory/${startupFile.name}`, (err) => {
    if (err) {
      // console.log(err);
    } else {
      // console.log('uploaded');
    }
  });
}); */

module.exports = app;
