const fileUpload = require('express-fileupload');
const { Router } = require('express');
const path = require('path');
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
  fs.readdir(path.resolve(dirPath), (err, fileNames) => {
    if (err) throw err;
    // iterate through the found file names

    fileNames.forEach((name) => {
      // if file name matches the pattern
      logThis(`name == ${name}`);
      if (pattern.test(name)) {
        logThis(`--> ${name}`);
        fs.unlink(path.resolve(`${dirPath}/${name}`), (errbis) => {
          if (errbis) throw errbis;
          logThis(`Deleted ${name}`);
        });
      }
    });
  });
};

const cleanDir = dirPath => new Promise((resolveArg, reject) => {
  fs.readdir(path.resolve(dirPath), (err, fileNames) => {
    if (err) return reject(Error('Error 1 while cleanDir'));
    fileNames.forEach((name) => {
      // logThis('name == ' + name);
      fs.unlink(path.resolve(`${dirPath}/${name}`), async (errbis) => {
        await logThis(`Deleted ${name}`);
        if (errbis) return reject(Error('Error 2 while cleanDir'));
        return 0;
      });
    });
    return 0;
  });
  logThis('END Function');
  return resolveArg('cleanDir finished :) .');
});

// logThis(`--> DIRPATH == ${dirPath}`);
const makeThisDir = dirPath => new Promise((resolveArg, reject) => {
  try {
    makeDir(dirPath);
    return resolveArg('makeThisDir Successfull :) .');
  } catch (err) {
    return reject(Error(`Error makeThisDir: ${err}`));
  }
});

function moveThatFile(fullPath, startupFile, moduleId, theModule) {
  return new Promise((resolveArg, reject) => {
    startupFile.mv(fullPath, (err) => {
      if (err) {
        logThis(`Strange ERR == ${err}`);
        return reject(Error(`moveThatFile FAILED: ${err}`));
      }
      logThis('MV SUCCESSFUL');
      // logThis(`ICI theModule.infos.moveonelineId === ${theModule.infos.moveonlineId}`);
      const moduleUpdated = Module.update(
        moduleId,
        {
          infos: {
            // filePath: `${dirPath}/${startupFile.name}`,
            filePath: fullPath,
            moveonlineId: theModule.infos.moveonlineId,
          },
        },
      );
      resolveArg(moduleUpdated);
      logThis('uploaded yessss ------->');
      return 0;
    });
  });
}
// logThis(`DIR ${path} CREATED SUCCESSFULLY`);

app.post('/upload/:studentID/:fileID/:moduleID', (req, res) => {
  try {
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
    logThis('HELLO =>  == \n');
    logThis(`__basedir == ${global.myBasedir}`);
    let someDir;
    try {
      someDir = path.join(
        global.myBasedir, 'uploads',
        `Student_${studentId}`,
        `Folder_${filedId}`,
        `Module_${moduleId}`,
      );
    } catch (err) {
      logThis(`HHEEE => ${err}`);
    }
    logThis(`someDir == ${someDir}`);
    logThis('---------------');
    let dirPath = `${__dirname}/../../../uploads/Student_${studentId}/Folder_${filedId}/Module_${moduleId}`;
    dirPath = someDir;
    // makeThisDir(dirPath).catch(logThis);
    /* try { } catch (err) {
        logThis(err + 'ERROR JMD here');
      } */
    logThis('DB 2 => BEEN HERE.');

    switch (moduleTypeId) {
      case 1:
        if (startupFile.name.startsWith('recto')) {
          // remove all files in dir whose name begin with recto
          try {
            deleteDirFilesUsingPattern(/^recto+/, `${dirPath}`).catch(logThis);
            // un peu bizarre le .catch ici... .
          } catch (err) {
            logThis(err);
          }
        } else if (startupFile.name.startsWith('verso')) {
          try {
            deleteDirFilesUsingPattern(/^verso+/, `${dirPath}`).catch(logThis);
          } catch (err) {
            logThis(err);
          }
        }
        break;
      case 9:
        logThis(`dirPath ==> ${dirPath}`);
        makeThisDir(dirPath).then((obj) => {
          logThis(`makeThisDir Promise returns: ${obj}`);

          cleanDir(dirPath).then((objbis) => {
            logThis(`cleanDir Promise returns: ${objbis}`);
            const fullPath = path.join(`${dirPath}`, `${startupFile.name}`);
            logThis(`fullPath == ${fullPath}`);
            logThis(`!!!! startupFile == ${startupFile.toString()}`);

            moveThatFile(fullPath, startupFile, moduleId, theModule)
              .then((moduleUpdated) => {
                logThis('moveThatFile COMPLETED! .');
                res.status(200).json({
                  moduleUp: moduleUpdated, startupFileDebug: startupFile,
                });
              }).catch((err) => {
                logThis(err);
                res.status(500).send(err);
              });
          }).catch(err => logThis(err));
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
