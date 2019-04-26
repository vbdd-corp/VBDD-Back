const { Router } = require('express');
const {
  File, FileType, Student, Module, ModuleType,
} = require('../../models');
const fillInfos = require('../module/index.js').fillInfos; // eslint-disable-line
// TODO: use correctly the function from { ModuleFunc } = ...
const logger = require('../../utils/logger');

function logThis(elt) {
  logger.log(`debug ==> ${elt}`);
}

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

function getFileSafely(fileTypeId) {
  try {
    return File.getById(fileTypeId);
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

// module.mocks.json seulement jusqu a 29 inclus. file.mocks.json jusqu a 3 inclus.

/* DELETE /api/file/:fileID
* */
router.delete('/:fileID', (req, res) => {
  try {
    const fileId = parseInt(req.params.fileID, 10);
    const fileToDel = getFileSafely(fileId);
    if (fileToDel === null) {
      res.status(403).json({ error: `File n°${fileId} not found.` });
    }
    fileToDel.moduleIds.forEach((moduleId) => {
      const theModuleId = parseInt(moduleId, 10);
      Module.delete(theModuleId);
    });
    File.delete(fileId);
    res.status(204).end();
  } catch (err) {
    if (err.name === 'NotFoundError') {
      res.status(404).end();
    } else {
      res.status(500).json(err);
    }
  }
});

/*
* POST /api/file
* crée un nouveau dossier pour l'étudiant d'id :studentID et les modules associées (vides)
* dans la base avec dans le body de la requete POST
* {studentId: number, fileTypeId: number, name: string}
* */
router.post('/', (req, res) => {
  try {
    const myStudent = getStudentSafely(req.body.studentId);
    if (myStudent === null) {
      res.status(403).json({ error: `Student n°${req.body.studentId} not found.` });
    }
    const theStudentId = parseInt(myStudent.id, 10);
    const myFileType = getFileTypeSafely(req.body.fileTypeId);
    if (myFileType === null) {
      res.status(403).json({ error: `Filetype n°${req.body.fileTypeId} not found.` });
    }
    logThis(`myFileTYpe ==> ${myFileType}`);

    const myFileTypeId = parseInt(myFileType.id, 10);

    let moduleIdMax = Module.get().reduce((max, p) => (p.id > max ? p.id : max), 0);

    const myList = [];
    myFileType.moduleTypeList.forEach((moduleId) => {
      logThis(`moduleIdMax == ${moduleIdMax + 1}`);
      const newModuleId = moduleIdMax + 1;

      const module = Module.createWithGivenId({
        typeModuleId: moduleId,
        infos: {},
      }, newModuleId);
      fillInfos(module);
      myList.push(module.id);
      moduleIdMax += 1;
    });
    const maxIdFile = File.get().reduce((max, p) => (p.id > max ? p.id : max), 0);
    const newFileId = maxIdFile + 1;
    const objFile = {
      studentId: theStudentId,
      moduleIds: myList,
      fileTypeId: myFileTypeId,
      name: req.body.name,
      isValidated: false,
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

router.put('/:fileID', (req, res) => {
  try {
    res.status(200).json(File.update(req.params.fileID, req.body));
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

module.exports = router;
