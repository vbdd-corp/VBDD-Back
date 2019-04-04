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
    /* let temp = File.getById(req.params.fileID);
    log_this(temp.moduleIds);
    let attach = attachStudents(temp);
    log_this(attach);
    log_this(getStudentSafely(2).lastName); */
    let reqFile = attachStudents(File.getById(req.params.fileID));
    logThis(`debug 1 => ${reqFile}`);
    reqFile = attachModules(reqFile);
    logThis(`debug 2 => ${reqFile}`);
    res.status(200).json(reqFile);
  } catch (err) {
    if (err.name === 'NotFoundError') {
      res.status(404).end();
    } else {
      res.status(500).json(err);
    }
  }
});

module.exports = router;
