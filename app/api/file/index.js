const { Router } = require('express');
const {
  File, FileType, Student, Module, ModuleType,
} = require('../../models');
const logger = require('../../utils/logger');

const router = new Router();

function getStudentSafely(studentId) {
  try {
    return Student.getById(studentId);
  } catch (err) {
    if (err.name === 'NotFoundError') {
      return null;
    }
    throw err;
  }
}

function getFileTypeSafely(fileTypeId) {
  try {
    return FileType.getById(fileTypeId);
  } catch (err) {
    if (err.name === 'NotFoundError') {
      return null;
    }
    throw err;
  }
}

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

function logThis(elt) {
  logger.log(`debug ==> ${elt}`);
}

const attachStudents = (file) => {
  const resFile = Object.assign({}, file, {
    student: getStudentSafely(file.studentId),
  });
  delete resFile.studentId;
  return resFile;
};

const attachModules = (file) => {
  const resFile = Object.assign({}, file, {
    moduleIds: file.moduleIds.map(moduleId => getModuleSafely(moduleId)),
  });
  logThis(`file => ${resFile.moduleIds[0]}`);
  resFile.modules = resFile.moduleIds;
  delete resFile.moduleIds;
  resFile.modules.forEach((value, index) => {
    // log_this("value == " + value.typeModuleId);
    logThis(resFile.modules);
    resFile.modules[index] = Object.assign({}, resFile.modules[index], {
      typeModule: getModuleTypeSafely(value.typeModuleId),
    });
    // array[index].typeModule = getModuleTypeSafely(value.typeModuleId);
    delete resFile.modules[index].typeModuleId;
  });
  resFile.fileType = getFileTypeSafely(resFile.fileTypeId);
  delete resFile.fileTypeId;
  return resFile;
};

/* GET /api/file/:fileID
** renvoie le dossier d'id :fileID
*/
router.get('/:fileID', (req, res) => {
  try {
    let reqFile = attachStudents(File.getById(req.params.fileID));
    // logThis(`debug 1 => ${reqFile}`);
    reqFile = attachModules(reqFile);
    // logThis(`debug 2 => ${reqFile}`);
    res.status(200).json(reqFile);
  } catch (err) {
    if (err.name === 'NotFoundError') {
      res.status(404).end();
    } else {
      res.status(500).json(err);
    }
  }
});

/* GET /api/file/by-studentId/:studentID
** renvoie la liste des dossiers du student d'id :studentID
*/
router.get('/by-studentId/:studentID', (req, res) => {
  try {
    const resList = File.get()
      .filter(file => file.studentId === parseInt(req.params.studentID, 10))
      .map(file => attachStudents(file)).map(file => attachModules(file));
    res.status(200).json(resList);
  } catch (err) {
    if (err.name === 'NotFoundError') {
      res.status(404).end();
    } else {
      res.status(500).json(err);
    }
  }
});

/* GET /api/file
** renvoie la liste de tous les dossiers
*/
router.get('/', (req, res) => {
  try {
    const resList = File.get()
      .map(file => attachStudents(file)).map(file => attachModules(file));
    res.status(200).json(resList);
  } catch (err) {
    if (err.name === 'NotFoundError') {
      res.status(404).end();
    } else {
      res.status(500).json(err);
    }
  }
});

/*
* GET /api/file/by-fileTypeId/:fileTypeID
* renvoie les dossiers qui correspondent au filetype d'id :fileTypeID
* (ex filtypeId 1 pour Asie).
* */
router.get('/by-fileTypeId/:fileTypeID', (req, res) => {
  try {
    const resList = File.get()
      .filter(file => file.fileTypeId === parseInt(req.params.fileTypeID, 10))
      .map(file => attachStudents(file)).map(file => attachModules(file));
    res.status(200).json(resList);
  } catch (err) {
    if (err.name === 'NotFoundError') {
      res.status(404).end();
    } else {
      res.status(500).json(err);
    }
  }
});

// module.mocks.json seulement jusqu a 24 inclus. file.mocks.json jusqu a 2 inclus.

/*
* POST /api/file/:studentID
* crée un nouveau dossier pour l'étudiant d'id :studentID et les modules associées (vides)
* dans la base avec dans le body de la requete POST {filetypeID: number}
* */
router.post('/:studentID', (req, res) => {
  try {
    const myStudent = getStudentSafely(req.params.studentID);
    if (myStudent === null) {
      res.status(403).json({ error: `Student n°${req.params.studentId} not found.` });
    }
    const theStudentId = parseInt(myStudent.id, 10);
    const myFileType = getFileTypeSafely(req.body.fileTypeId);
    if (myFileType === null) {
      res.status(403).json({ error: `Filetype n°${req.body.fileTypeId} not found.` });
    }
    const myFileTypeId = parseInt(myFileType.id, 10);

    let moduleIdMax = Module.get().reduce((max, p) => (p.id > max ? p.id : max), 0);

    const myList = [];
    myFileType.moduleTypeList.forEach((elt) => {
      logThis(`moduleIdMax == ${moduleIdMax + 1}`);
      const newModuleId = moduleIdMax + 1;

      /** *** */
      let theInfos;
      switch (elt) {
        case 0:
          // informations-generales
          theInfos = {
            studentId: myStudent.id,
            stayCardEndValidity: null,
            currentUNSDiploma: null,
            nextYearExchangeDiploma: null,
            shareMyDetails: null,
          };
          break;
        case 1:
          // CNI
          theInfos = { recto: null, verso: null };
          break;
        case 7:
          // Budget prévisionnel json
          theInfos = {
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
          theInfos = {
            institutionName: null,
            country: null,
            semester: null,
            BCIcode: null,
            BCIProgramName: null,
            S1courses: null,
            S2courses: null,
          };
          break;
        case 11:
          theInfos = {};
          // 8 et 11 à faire Contrat d'études gros truc json
          break;
        case 9:
          theInfos = { filePath: null, moveonlineId: null };
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
          // autorisation responsable pédagogique pdf
          theInfos = { filePath: null };
          break;
        case 17:
          // Voeux Universités
          theInfos = {
            choice1: {
              university: null,
              country: null,
              semester: null,
            },
            choice2: {
              university: null,
              country: null,
              semester: null,
            },
            choice3: {
              university: null,
              country: null,
              semester: null,
            },
          };
          break;
        default:
          theInfos = {};
          break;
      }
      /** *** */

      const tempModule = Module.createWithGivenId({
        typeModuleId: elt,
        infos: theInfos,
      }, newModuleId);
      tempModule.id = newModuleId;
      myList.push(tempModule.id);
      moduleIdMax += 1;
    });
    const maxIdFile = File.get().reduce((max, p) => (p.id > max ? p.id : max), 0);
    const newFileId = maxIdFile + 1;
    /* logThis(`maxFileId == ${maxIdFile}`);
    logThis(`myList == ${myList}`);
    logThis(`req.params.studentID == ${req.params.studentID}`);
    logThis(`req.body.fileTypeId == ${req.body.fileTypeId}`);
    logThis(`name: ${myFileType.typeName}`); */
    const objFile = {
      studentId: theStudentId,
      moduleIds: myList,
      fileTypeId: myFileTypeId,
      name: myFileType.typeName,
    };

    const resFile = File.createWithGivenId(objFile, newFileId);
    resFile.id = newFileId;
    res.status(201).json(resFile);
  } catch (err) {
    if (err.name === 'ValidationError') {
      res.status(400).json(err.extra);
    } else {
      res.status(500).json(err);
    }
  }
});

module.exports = router;
