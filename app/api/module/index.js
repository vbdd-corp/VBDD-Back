const fileUpload = require('express-fileupload');
const { Router } = require('express');
const path = require('path');
const makeDir = require('make-dir');
const rimraf = require('rimraf');
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

const cleanDir = (dirPath, file, cb) => rimraf(path.join(`${dirPath}`, `${file}`), () => {
  logThis(`${path.join(`${dirPath}`, `${file}`)} removed`);
  cb();
});

const makeThisDir = async (dirPath) => {
  try {
    // await necessary here !!!
    await makeDir(dirPath);
    return 'makeThisDir Successfull :) .';
  } catch (err) {
    return `Error makeThisDir: ${err}`;
  }
};

/*
* USAGE: POST /api/module/upload/:studentID/:fileID/:moduleID
* si c est un fichier qui est envoyé, doit être envoyé dans une variable foo
* si c est un objet json qui est envoyé, l objet json correspond au champ
* infos dans chaque module
* */
app.post('/upload/:studentID/:fileID/:moduleID', (req, res) => {
  const basicFileMover = (startupFile, fullPath) => {
    startupFile.mv(fullPath, (err) => {
      if (err) {
        logThis(`startupFile.mv() ERROR == ${err}`);
        return res.status(500).json({ error: '<------- startupFile.mv() FAILED :/ ------->' });
      }
      logThis('startupFile.mv() SUCCESSFUL');
      logThis('<------- startupFile.mv() COMPLETED: SUCCESS ------->');
      return res.status(200).json({ uploadedFile: startupFile });
    });
  };
  try {
    const moduleId = parseInt(req.params.moduleID, 10);
    const filedId = parseInt(req.params.fileID, 10);
    const studentId = parseInt(req.params.studentID, 10);
    const theModule = getModuleSafely(moduleId);
    if (theModule === null) {
      res.status(403).json({ error: `Module n°${moduleId} not found.` });
    }
    const moduleTypeId = theModule.typeModuleId;

    let startupFile;
    let fullPath;
    let dirPath;
    switch (moduleTypeId) {
      case 1:
      case 9:
      case 2:
      case 4:
      case 5:
      case 6:
      case 10:
      case 12:
      case 13:
      case 15:
      case 16:
        logThis(`moduleTypeId == ${moduleTypeId}`);
        startupFile = req.files.foo;
        logThis(`myBasedir == ${global.myBasedir}`);
        logThis('\n');
        try {
          dirPath = path.join(
            global.myBasedir, 'uploads',
            `Student_${studentId}`,
            `Folder_${filedId}`,
            `Module_${moduleId}`,
          );
        } catch (err) {
          logThis(`ERROR building dirPath: ${err}`);
        }
        logThis('---------------');
        // logThis(`dirPath ==> ${dirPath}`);
        fullPath = path.join(`${dirPath}`, `${startupFile.name}`);
        logThis(`fullPath == ${fullPath}`);
        break;
      default:
        break;
    }

    let objInfos;
    switch (moduleTypeId) {
      case 0:
        objInfos = Object.assign({}, theModule.infos, {});
        if (typeof req.body.stayCardEndValidity !== 'undefined' && req.body.stayCardEndValidity.length > 0) {
          objInfos = Object.assign({}, objInfos,
            { stayCardEndValidity: req.body.stayCardEndValidity });
        }
        if (typeof req.body.currentUNSDiploma !== 'undefined' && req.body.currentUNSDiploma.length > 0) {
          objInfos = Object.assign({}, objInfos, { currentUNSDiploma: req.body.currentUNSDiploma });
        }
        if (typeof req.body.nextYearExchangeDiploma !== 'undefined' && req.body.nextYearExchangeDiploma.length > 0) {
          objInfos = Object.assign({}, objInfos,
            { nextYearExchangeDiploma: req.body.nextYearExchangeDiploma });
        }
        if (typeof req.body.shareMyDetails !== 'undefined' && (req.body.shareMyDetails === true
          || req.body.shareMyDetails === false)) {
          objInfos = Object.assign({}, objInfos, { shareMyDetails: req.body.shareMyDetails });
        } else if (typeof req.body.shareMyDetails !== 'undefined') {
          res.status(500).json({ error: 'Need defined one or more of the following fields: stayCardEndValidity, currentUNSDiploma, nextYearExchangeDiploma, shareMyDetails (true or false)' });
        }

        if (studentId === theModule.infos.studentId) {
          const moduleUpdated = Module.update(moduleId, { infos: objInfos });
          res.status(201).json({ updatedModule: moduleUpdated });
        } else {
          res.status(500).json({ error: 'Need defined one or more of the following fields: stayCardEndValidity, currentUNSDiploma, nextYearExchangeDiploma, shareMyDetails (true or false)' });
        }
        break;
      case 1:
        if (startupFile.name.startsWith('recto')) {
          /* remove all files in dir whose name begin with recto then upload file
          * with name beginning with recto
          * */
          makeThisDir(dirPath).then((obj) => {
            logThis(`makeThisDir Promise returns: ${obj}`);
            cleanDir(dirPath, 'recto*', () => {
              basicFileMover(startupFile, fullPath);
            });
          }).catch(err => logThis(err));
        } else if (startupFile.name.startsWith('verso')) {
          makeThisDir(dirPath).then((obj) => {
            logThis(`makeThisDir Promise returns: ${obj}`);
            cleanDir(dirPath, 'verso*', () => {
              basicFileMover(startupFile, fullPath);
            });
          }).catch(err => logThis(err));
        }
        break;

      case 9:
        // to test => 30/3/27
        makeThisDir(dirPath).then((obj) => {
          logThis(`makeThisDir Promise returns: ${obj}`);

          cleanDir(dirPath, '*', () => {
            startupFile.mv(fullPath, (err) => {
              if (err) {
                logThis(`startupFile.mv() ERROR == ${err}`);
                return res.status(500).json({ error: '<------- startupFile.mv() FAILED :/ ------->' });
              }
              logThis('startupFile.mv() SUCCESSFUL');
              // logThis(`ICI theModule.infos.moveonelineId === ${theModule.infos.moveonlineId}`);
              const moduleUpdated = Module.update(
                moduleId, {
                  infos: {
                    filePath: fullPath,
                    moveonlineId: theModule.infos.moveonlineId,
                  },
                },
              );
              logThis('<------- startupFile.mv() COMPLETED: SUCCESS ------->');
              return res.status(200).json({
                moduleUp: moduleUpdated, uploadedFile: startupFile,
              });
            });
          });
        }).catch(err => logThis(err));
        break;
      case
        2
        :
      case
        4
        :
      case
        5
        :
      case
        6
        :
      case
        10
        :
      case
        12
        :
      case
        13
        :
      case
        15
        :
      case
        16
        :
        // to test => 30/3/29
        makeThisDir(dirPath).then((obj) => {
          logThis(`makeThisDir Promise returns: ${obj}`);

          cleanDir(dirPath, '*', () => {
            startupFile.mv(fullPath, (err) => {
              if (err) {
                logThis(`startupFile.mv() ERROR == ${err}`);
                return res.status(500).json({ error: '<------- startupFile.mv() FAILED :/ ------->' });
              }
              logThis('startupFile.mv() SUCCESSFUL');
              const moduleUpdated = Module.update(
                moduleId, {
                  infos: {
                    filePath: fullPath,
                  },
                },
              );
              logThis('<------- startupFile.mv() COMPLETED: SUCCESS ------->');
              return res.status(200).json({
                moduleUp: moduleUpdated, uploadedFile: startupFile,
              });
            });
          });
        }).catch(err => logThis(err));
        break;
      default:
        break;
    }
  } catch
  (err) {
    if (err.name === 'ValidationError') {
      res.status(400).json(err.extra);
    } else {
      res.status(500).json(err);
    }
  }
});
module.exports = app;
