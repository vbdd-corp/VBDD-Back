const { Router } = require('express');
const { ModuleType, FileType } = require('../../models');
const logger = require('../../utils/logger');

const router = new Router();

/* function logThis(elt) {
  logger.log(`debug ==> ${elt}`);
} */

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

/* GET /api/fileType/:fileTypeID
* RETOURNE [{1, "CNI"}, {2, "PASSEPORT"}, ... ]
* */
router.get('/:fileTypeID', (req, res) => {
  try {
    // let reqFile = attachStudents(File.getById(req.params.fileID));
    // reqFile = attachModules(reqFile);
    const resFile = [];
    const fTypeId = parseInt(req.params.fileTypeID, 10);
    const myFileType = getFileTypeSafely(fTypeId);
    logger.log(`myFileTYpe == ${myFileType.moduleTypeList}`);
    if (myFileType === null) {
      res.status(403).json({ error: `Filetype n°${fTypeId} not found.` });
    }
    myFileType.moduleTypeList
      .forEach(
        moduleTypeId => resFile.push(getModuleTypeSafely(parseInt(moduleTypeId, 10))),
      );
    // resFile.forEach(elt => logThis(`${resFile.id}\n`));

    res.status(200).json(resFile);
  } catch (err) {
    if (err.name === 'NotFoundError') {
      res.status(404).end();
    } else {
      res.status(500).json(err);
    }
  }
});
module.exports = router;
