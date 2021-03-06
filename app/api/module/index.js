const fileUpload = require('express-fileupload');
const { Router } = require('express');
const path = require('path');
const makeDir = require('make-dir');
const rimraf = require('rimraf');
const fs = require('fs');
const logger = require('../../utils/logger');
const {
  Module, Student, File, ModuleType,
} = require('../../models');


function logThis(elt) {
  logger.log(`debug ==> ${elt}`);
}

const router = Router();
router.use(fileUpload());


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

function getModuleTypeSafely(moduleTypeId) {
  try {
    return ModuleType.getById(moduleTypeId);
  } catch (err) {
    if (err.name === 'NotFoundError') {
      return null;
    }
    throw err;
  }
}

const attachModuleType = (module) => {
  const newModule = Object.assign({}, module, {
    typeModule: getModuleTypeSafely(module.typeModuleId),
  });
  delete newModule.typeModuleId;
  return newModule;
};

router.get('/:moduleId', (req, res) => {
  try {
    res.status(200).json(Module.getById(req.params.moduleId));
  } catch (err) {
    if (err.name === 'NotFoundError') {
      res.status(404).end();
    } else {
      res.status(500).json(err);
    }
  }
});

router.put('/:moduleId', (req, res) => {
  try {
    res.status(200).json(attachModuleType(Module.update(req.params.moduleId, req.body)));
  } catch (err) {
    if (err.name === 'NotFoundError') {
      res.status(404).end();
    } else if (err.name === 'ValidationError') {
      res.status(400).json(err.extra);
    } else {
      res.status(500).json(err);
    }
  }
});

function getParentFiles(moduleId) {
  return File.get().filter(file => file.moduleIds.includes(moduleId));
}

function remove(array, element) {
  const index = array.indexOf(element);
  array.splice(index, 1);
}

router.delete('/:moduleId', (req, res) => {
  let moduleId = req.params.moduleId; // eslint-disable-line
  if (typeof moduleId === 'string') moduleId = parseInt(moduleId, 10);
  try {
    getParentFiles(moduleId).forEach((file) => {
      remove(file.moduleIds, moduleId);
      File.update(file.id, file);
    });
    Module.delete(moduleId);
    res.status(204).end();
  } catch (err) {
    if (err.name === 'NotFoundError') {
      res.status(404).end();
    } else {
      res.status(500).json(err);
    }
  }
});

const fillInfos = function (module) {
  const moduleType = ModuleType.getById(module.typeModuleId);
  Module.update(module.id, { infos: moduleType.infos });
};

function putInFile(moduleId, fileId) {
  const file = File.getById(fileId);
  file.moduleIds.push(moduleId);
  File.update(file.id, file);
}

function responseFile(fileName, filePath, response) {
  // filePath is full path of file.
  // Check if file specified by the filePath exists
  fs.exists(filePath, (exists) => {
    if (exists) {
      // Content-type is very interesting part that guarantee that
      // Web browser will handle response in an appropriate manner.
      response.writeHead(200, {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename=${fileName}`,
      });
      fs.createReadStream(filePath).pipe(response);
    } else {
      response.writeHead(400, { 'Content-Type': 'text/plain' });
      response.end('ERROR File does not exist');
    }
  });
}

/*
* POST /api/module/download
* {"filePath": "/path/to/file.pdf"}
* example.com/user/000000?sex=female
* */
router.post('/download', (req, res) => {
  try {
    logThis(`global.myBaseDir ${global.myBasedir}`);
    const filePath = path.join(global.myBasedir, req.body.filePath);
    logThis(`filePath --> ${filePath}`);
    const array = filePath.split('/');
    const fileName = array[array.length - 1];
    logThis((`--> filePath: ${filePath}`));
    responseFile(fileName, filePath, res);
  } catch (err) {
    if (err.name === 'ValidationError') {
      res.status(400).json(err.extra);
    } else if (err.name === 'NotFoundError') {
      res.status(404).json({ error: 'student or file or module not found' });
    } else {
      res.status(500).json(err);
    }
  }
});

router.post('/:fileId', (req, res) => {
  try {
    // check if the file exists before doing anything
    File.getById(req.params.fileId);

    const module = Module.createWithNextId(req.body);
    fillInfos(module);
    putInFile(module.id, req.params.fileId);

    res.status(201).json(attachModuleType(module));
  } catch (err) {
    if (err.name === 'ValidationError') {
      res.status(400).json(err.extra);
    } else if (err.name === 'NotFoundError') {
      res.status(400).json(err);
    } else {
      res.status(500).json(err);
    }
  }
});

/* *****************  UPLOAD  *****************
**
* USAGE: POST /api/module/upload/:studentID/:fileID/:moduleID
* le fichier doit être envoyé dans une variable foo
* */
router.post('/upload/:studentID/:fileID/:moduleID', (req, res) => {
  const basicFileMover = (startupFile, fullPath) => {
    startupFile.mv(fullPath, (err) => {
      if (err) {
        logThis(`startupFile.mv() ERROR == ${err}`);
        throw err;
      }
      logThis('startupFile.mv() SUCCESSFUL');
      logThis('<------- startupFile.mv() COMPLETED: SUCCESS ------->');
    });
  };

  try {
    const moduleId = parseInt(req.params.moduleID, 10);
    const filedId = parseInt(req.params.fileID, 10);
    const studentId = parseInt(req.params.studentID, 10);

    const theModule = Module.getById(moduleId);
    File.getById(filedId);
    Student.getById(studentId);

    const moduleTypeId = theModule.typeModuleId;

    const startupFile = req.files.foo;
    let dirPath;
    let moduleUpdated;

    try {
      dirPath = path.join('uploads', `Student_${studentId}`,
        `Folder_${filedId}`, `Module_${moduleId}`);
      dirPath = `./${dirPath}`;
    } catch (err) {
      logThis(`ERROR building dirPath: ${err}`);
    }
    const fullPath = path.join(`${dirPath}`, `${startupFile.name}`);

    if (moduleTypeId === 1) {
      if (startupFile.name.startsWith('recto')) {
        /* remove all files in dir whose name begin with recto then upload file
        * with name beginning with recto
        * */
        makeThisDir(dirPath).then((obj) => {
          logThis(`makeThisDir Promise returns: ${obj}`);
          cleanDir(dirPath, 'recto*', () => {
            basicFileMover(startupFile, fullPath);
            moduleUpdated = Module.update(moduleId, {
              infos: {
                recto: fullPath,
                verso: theModule.infos.verso,
              },
            });
            return res.status(200).json({ moduleUp: moduleUpdated });
          });
        }).catch(err => logThis(err));
      } else if (startupFile.name.startsWith('verso')) {
        makeThisDir(dirPath).then((obj) => {
          logThis(`makeThisDir Promise returns: ${obj}`);
          cleanDir(dirPath, 'verso*', () => {
            basicFileMover(startupFile, fullPath);
            moduleUpdated = Module.update(moduleId, {
              infos: {
                recto: theModule.infos.recto,
                verso: fullPath,
              },
            });
            return res.status(200).json({ moduleUp: moduleUpdated });
          });
        }).catch(err => logThis(err));
      }
    } else if (moduleTypeId === 9) {
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
            moduleUpdated = Module.update(
              moduleId, {
                infos: {
                  filePath: fullPath,
                  moveonlineId: theModule.infos.moveonlineId,
                },
              },
            );
            logThis('<------- startupFile.mv() COMPLETED: SUCCESS ------->');
            return res.status(200).json({ moduleUp: moduleUpdated });
          });
        });
      }).catch(err => logThis(err));
    } else if (moduleTypeId === 8) {
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
            theModule.infos.filePath = fullPath;
            moduleUpdated = Module.update(
              moduleId, {
                infos: theModule.infos,
              },
            );
            logThis('<------- startupFile.mv() COMPLETED: SUCCESS ------->');
            return res.status(200).json({ moduleUp: moduleUpdated });
          });
        });
      }).catch(err => logThis(err));
    } else {
      makeThisDir(dirPath).then(() => {
        cleanDir(dirPath, '*', () => {
          startupFile.mv(fullPath, (err) => {
            if (err) {
              logThis(`startupFile.mv() ERROR == ${err}`);
              return res.status(500).json({ error: '<------- startupFile.mv() FAILED :/ ------->' });
            }
            moduleUpdated = Module.update(
              moduleId, {
                infos: {
                  filePath: fullPath,
                },
              },
            );
            logThis('<------- startupFile.mv() COMPLETED: SUCCESS ------->');
            return res.status(200).json({ moduleUp: moduleUpdated });
          });
        });
      }).catch(err => logThis(err));
    }
  } catch (err) {
    if (err.name === 'ValidationError') {
      res.status(400).json(err.extra);
    } else if (err.name === 'NotFoundError') {
      res.status(404).json({ error: 'student or file or module not found' });
    } else {
      res.status(500).json(err);
    }
  }
});

module.exports = {
  router,
  fillInfos,
};
