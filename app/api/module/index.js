const fileUpload = require('express-fileupload');
const { Router } = require('express');
const path = require('path');
const makeDir = require('make-dir');
const rimraf = require('rimraf');
const logger = require('../../utils/logger');
const { Module, Student, File } = require('../../models');


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
    res.status(200).json(Module.update(req.params.moduleId, req.body));
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
  let infos;
  switch (module.typeModuleId) {
    case 0:
      // informations-generales
      infos = {
        studentId: null,
        stayCardEndValidity: null,
        currentUNSDiploma: null,
        nextYearExchangeDiploma: null,
        shareMyDetails: null,
      };
      break;
    case 1:
      // CNI
      infos = { recto: null, verso: null };
      break;
    case 7:
      // Budget prévisionnel json
      infos = {
        country: null,
        city: null,
        stayDuration: null,
        travelCost: null,
        accommodationCost: null,
        foodCost: null,
        transportationHobbiesCost: null,
        studyCost: null,
        othersCost: null,
        frenchCROUSScholarship: null,
        mobilityScholarship: null,
        travelHelp: null,
        summerJobSalaries: null,
        personalResources: null,
        familyResources: null,
        othersResources: null,
        notes: null,
      };
      break;
    case 8:
      // Hors Europe Annexe 1
      // Contrat d'études
      infos = {
        schoolID: null,
        semester: null,
        BCICode: null,
        BCIProgramName: null,
        S1courses: null,
        S2courses: null,
      };
      break;
    case 11:
      // Erasmus Learning Agreement A FAIRE CAMILLE!
      infos = {};
      // 11 à faire Contrat d'études gros truc json
      break;
    case 9:
      // Fiche Inscription MoveOnline Outgoing
      infos = { filePath: null, moveonlineId: null };
      break;

    case 2:
    case 4:
    case 5:
    case 6:
    case 10:
    case 12:
    case 13:
    case 15:
    case 16:
      // 2 passeport
      // 4 CV Europass
      // 5 Relevé Notes Supérieur
      // 6 Lettre de motivation
      // 10 Autorisation professeur responsable
      // 12 Evaluation des compétences Linguistiques
      // 13 Carte Européenne d'Assurance Maladie
      // 15 Lettre de Recommandation Enseignant
      // 16 Acte Naissance avec Filiation
      infos = { filePath: null };
      break;
    case 17:
      // 17 Voeux Universités
      infos = {
        choice1: {
          schoolID: null,
          semester: null,
        },
        choice2: {
          schoolID: null,
          semester: null,
        },
        choice3: {
          schoolID: null,
          semester: null,
        },
      };
      break;
    default:
      infos = {};
      break;
  }
  Module.update(module.id, { infos });
};

function putInFile(moduleId, fileId) {
  const file = File.getById(fileId);
  file.moduleIds.push(moduleId);
  File.update(file.id, file);
}

router.post('/:fileId', (req, res) => {
  try {
    // check if the file exists before doing anything
    File.getById(req.params.fileId);

    const module = Module.create(req.body);
    fillInfos(module);
    putInFile(module.id, req.params.fileId);

    res.status(201).json(module);
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

// *****************  UPLOAD  *****************

/*
* USAGE: POST /api/module/upload/:studentID/:fileID/:moduleID
* si c est un fichier qui est envoyé, doit être envoyé dans une variable foo
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

    logThis(`moduleTypeId == ${moduleTypeId}`);

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
    const fullPath = path.join(`${dirPath}`, `${startupFile.name}`);
    logThis(`fullPath == ${fullPath}`);

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
    } else {
      makeThisDir(dirPath).then((obj) => {
        logThis(`makeThisDir Promise returns: ${obj}`);

        cleanDir(dirPath, '*', () => {
          startupFile.mv(fullPath, (err) => {
            if (err) {
              logThis(`startupFile.mv() ERROR == ${err}`);
              return res.status(500).json({ error: '<------- startupFile.mv() FAILED :/ ------->' });
            }
            logThis('startupFile.mv() SUCCESSFUL');
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

module.exports = router;
