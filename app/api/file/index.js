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

/*
* getDossiers d'un studentID donné
* getDossiers (tous)
* getDossiers du filetypeId donné (ex filtypeId 1 pour Asie).
* */

/*
*post
* url => studentId
* body =>
*   filetypeID
* */
// module.mocks.json seulement jusqu a 24 inclus. file.mocks.json jusqu a 2 inclus.
router.post('/:studentID', (req, res) => {
  try {
    const student = getStudentSafely(req.params.studentID);
    if (student === null) {
      res.status(403).json({ error: `Student n°${req.params.studentId} not found.` });
    }
    const theStudentId = parseInt(student.id, 10);
    const myFileType = getFileTypeSafely(req.body.fileTypeId);
    if (myFileType === null) {
      res.status(403).json({ error: `Filetype n°${req.body.fileTypeId} not found.` });
    }
    const myFileTypeId = parseInt(myFileType.id, 10);

    let moduleIdMax = Module.get().reduce((max, p) => (p.id > max ? p.id : max), 0);
    // logThis(`actuel Max == ${moduleIdMax}`);

    const myList = [];
    myFileType.moduleTypeList.forEach((elt) => {
      logThis(`moduleIdMax == ${moduleIdMax + 1}`);
      const newModuleId = moduleIdMax + 1;

      const tempModule = Module.createWithGivenId({
        typeModuleId: elt,
        infos: {},
      }, newModuleId);
      tempModule.id = newModuleId;
      myList.push(tempModule.id);
      moduleIdMax += 1;
    });
    /* logThis('===objFile===');
    logThis(`File.get().length ${File.get().length}`); */
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
