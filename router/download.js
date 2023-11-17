//manage Routing
const express = require('express')
    ,app = express()
    ,port = process.env.PORT || 3000
    ,router = express.Router()
    ,fs = require('fs')
    ,session = require('./sessionManager')
    ,sessionNeo4j = require('./db')
    ,archiver = require('archiver')
    const createZipArchive = require('./createZipArchive'); 
router.use(session);


router.post('/downloadFolder', (req, res) => {
  const folderPath = '.'+req.body.path;
  const folderName = req.body.name;
  
  createZipArchive(folderPath, folderName)
  .then((zipFilePath) => {
    res.download(zipFilePath, `${folderName}.zip`, (err) => {
      if (err) {
        console.error('Download error:', err);
        res.status(500).send('Internal Server Error');
      }
    });
    fs.unlinkSync(zipFilePath, () => { 
      console.log("Zip Deleted!"); 
      }); 
  })
  .catch((error) => {
    console.error('Zip creation error:', error);
    res.status(500).send('Internal Server Error');
  });
  // Assuming 'archiver' is used to create a ZIP archive, and 'archiver' is properly configured
  
});

router.post('/downloadFile', (req, res) => {
  const filename = req.body.name;

  // Specify the path to the file you want to download
  const filePath = req.body.path+'/'+filename;

  // Use res.download to prompt the user to download the file
  res.download(filePath, (err) => {
    if (err) {
      // Handle error, such as file not found or permission issues
      console.error('Download error:', err);
      res.status(404).send('File not found');
    }
  });
});

module.exports = router 