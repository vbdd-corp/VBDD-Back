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

/* const deleteDirFilesUsingPattern = (pattern, dirPath = __dirname) => {
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
}; */

/* let cleanDir = async (dirPath) => {
  await fs.readdir(path.resolve(dirPath), async (err, fileNames) => {
    if (err) return 'Error 1 while cleanDir';
    await fileNames.forEach(async (name) => {
      // logThis('name == ' + name);
      await fs.unlink(path.resolve(`${dirPath}/${name}`), async (errBis) => {
        await logThis(`Deleted ${name}`);
        if (errBis) return 'Error 2 while cleanDir';
        return 0;
      });
    });
    return 0;
  });
  logThis('END Function');
  return 'cleanDir finished :)';
}; */

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

/* const moveThatFile = async (fullPath, startupFile, moduleId, theModule) => {
    await startupFile.mv(fullPath, async (err) => {
      if (err) {
        logThis(`Strange ERR == ${err}`);
        return null;
      }
      await logThis('MV SUCCESSFUL');
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
      logThis('uploaded yessss ------->');
      return moduleUpdated;
    });
}; */

// logThis(`DIR ${path} CREATED SUCCESSFULLY`);


app.post('/upload/:studentID/:fileID/:moduleID', (req, res) => {
  const basicFileMover = (startupFile, fullPath) => {
    startupFile.mv(fullPath, (err) => {
      if (err) {
        logThis(`startupFile.mv() ERROR == ${err}`);
        return res.status(500).json({ error: '<------- startupFile.mv() FAILED :/ ------->' });
      }
      logThis('MV SUCCESSFUL');
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
    logThis(`moduleTypeId == ${moduleTypeId}`);
    const startupFile = req.files.foo;
    // logThis('DB1 ==> ', startupFile);
    logThis('HELLO =>  == \n');
    logThis(`__basedir == ${global.myBasedir}`);
    let dirPath;
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
    // makeThisDir(dirPath).catch(logThis);
    /* try { } catch (err) {
        logThis(err + 'ERROR JMD here');
      } */
    logThis('DB 2 => BEEN HERE.');
    logThis(`dirPath ==> ${dirPath}`);
    const fullPath = path.join(`${dirPath}`, `${startupFile.name}`);
    logThis(`fullPath == ${fullPath}`);

    /* (async () => {
      // await is necessary here !!!
      await makeThisDir(dirPath).then((obj) => {
        logThis(`makeThisDir Promise returns: ${obj}`);
      }).catch(err => logThis(err));
    })(); */

    switch (moduleTypeId) {
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
        cleanDir(dirPath, '*', () => {
          startupFile.mv(fullPath, (err) => {
            if (err) {
              logThis(`startupFile.mv() ERROR == ${err}`);
              res.status(500).json({ error: 'startupFile.mv() FAILED :/' });
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
            logThis('<------- MV COMPLETED SUCCESS ------->');
            res.status(200).json({
              moduleUp: moduleUpdated, startupFileDebug: startupFile,
            });
          });
        });

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
