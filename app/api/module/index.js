const fileUpload = require('express-fileupload');
const { Router } = require('express');
const { resolve } = require('path');
const makeDir = require('make-dir');
const fs = require('fs');
const logger = require('../../utils/logger');
const { Module } = require('../../models');

function logThis(elt) {
  logger.log(`debug ==> ${elt}`);
}
const app = Router();
app.use(fileUpload());

function getModuleSafely(moduleId) {
  try {
    return Module.getById(moduleId);
  } catch (err) {
    if (err.name === 'NotFoundError') {
      return null;
    }
    throw err;
  }
}

const deleteDirFilesUsingPattern = (pattern, dirPath = __dirname) => {
  // get all file names in directory
  fs.readdir(resolve(dirPath), (err, fileNames) => {
    if (err) throw err;
    // iterate through the found file names

    fileNames.forEach((name) => {
      // if file name matches the pattern
      logThis(`name == ${name}`);
      if (pattern.test(name)) {
        logThis(`--> ${name}`);
        fs.unlink(resolve(`${dirPath}/${name}`), (errbis) => {
          if (errbis) throw errbis;
          logThis(`Deleted ${name}`);
        });
      }
    });
  });
};

const cleanDir = (dirPath) => {
  fs.readdir(resolve(dirPath), (err, fileNames) => {
    if (err) throw err;
    fileNames.forEach((name) => {
      // logThis('name == ' + name);
      fs.unlink(resolve(`${dirPath}/${name}`), (errbis) => {
        if (errbis) throw errbis;
        console.log(`Deleted ${name}`);
      });
    });
  });
};

const makeThisDir = async (dirPath) => {
  const path = await makeDir(dirPath);
  logThis(`DIR ${path} CREATED SUCCESSFULLY`);
};

app.post('/upload/:studentID/:fileID/:moduleID', (req, res) => {
  const moduleId = parseInt(req.params.moduleID, 10);
  const filedId = parseInt(req.params.fileID, 10);
  const studentId = parseInt(req.params.studentID, 10);
  const theModule = getModuleSafely(moduleId);
  if (theModule === null) {
    res.status(403).json({ error: `Module n°${moduleId} not found.` });
  }
  const moduleTypeId = theModule.typeModuleId;
  logThis(`moduleTypeId == ${moduleTypeId}`);
  const startupFile = req.files.foo;
  // logThis('DB1 ==> ', startupFile);
  const dirPath = `${__dirname}/../../../uploads/Student_${studentId}/Folder_${filedId}/Module_${moduleId}`;

  try { makeThisDir(dirPath).catch(logThis); } catch (err) {
    logThis(err);
  }

  switch (moduleTypeId) {
    case 1:
      if (startupFile.name.startsWith('recto')) {
        // remove all files in dir whose name begin with recto
        try {
          deleteDirFilesUsingPattern(/^recto+/, `${dirPath}`).catch(logThis);
          // un peu bizarre le .catch ici... .
        } catch (err) { logThis(err); }
      } else if (startupFile.name.startsWith('verso')) {
        try {
          deleteDirFilesUsingPattern(/^verso+/, `${dirPath}`).catch(logThis);
        } catch (err) { logThis(err); }
      }
      break;
    case 2:
    case 4:
    case 5:
    case 6:
    case 9:
    case 10:
    case 12:
    case 13:
    case 15:
    case 16:
      logThis(`myPath ==> ${dirPath}`);
      cleanDir(dirPath); // function block works :)
      break;
    default:
      break;
  }

  startupFile.mv(`${dirPath}/${startupFile.name}`, (err) => {
    if (err) { logThis(err); } else { logThis('uploaded'); }
  });
});

module.exports = app;
