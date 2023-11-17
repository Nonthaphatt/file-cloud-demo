//manage Routing
//manage Routing
const express = require('express')
    ,app = express()
    ,port = process.env.PORT || 3000
    ,router = express.Router()
    ,fs = require('fs')
    ,session = require('./sessionManager')
    ,sessionNeo4j = require('./db')
    ,multer = require('multer')
router.use(session);


  
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'folder/'+req.body.name); // Specify the directory where uploaded files will be stored
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname); // Use the original file name for storage
    },
  });
  
  const upload = multer({ storage: storage });
  
  
  // Handle file upload
  router.post('/upload', upload.single('file'), (req, res) => {
    try {
      if (!req.file) {
        throw new Error('No file uploaded.');
      }
      console.log(req.file.originalname)
      // Your code for handling the uploaded file
      sessionNeo4j
        .run('MATCH (p:Person{name:$nameParam}) CREATE (p)-[o:OWNS]->(f:File{name:$folderParam,path:$pathParam}) RETURN p,o,f',
        {nameParam:req.body.name,folderParam:req.file.originalname,pathParam:'folder/'+req.session.name})
        .then(function(result) {
          console.log('upload done ---'+req.file.originalname)
          res.redirect('/folder');
        })
        .catch((err) => {
          console.log(err)
        });
    } catch (error) {
      console.error('Error during file upload:', error);
      res.status(500).send('Internal Server Error');
    }
  });

  const storage1 = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, '.'+req.body.path); // Specify the directory where uploaded files will be stored
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname); // Use the original file name for storage
    },
  });
  
  const upload1 = multer({ storage: storage1 });
  
  // Handle file upload
  router.post('/upload1', upload1.single('file'), (req, res) => {
    try {
      if (!req.file) {
        throw new Error('No file uploaded.');
      }
      
      // Your code for handling the uploaded file
      sessionNeo4j
        .run('MATCH (p:Folder{name:$nameParam}) CREATE (p)-[o:HAVE]->(f:File{name:$folderParam,path:$pathParam}) RETURN f',
        {nameParam:req.body.fname,folderParam:req.file.originalname,pathParam:req.body.path})
        .then(function(result) {
          console.log('upload done ---'+req.file.originalname)
          res.redirect('/folder');
        })
        .catch((err) => {
          console.log(err)
        });
    } catch (error) {
      console.error('Error during file upload:', error);
      res.status(500).send('Internal Server Error');
    }
  });
  
  router.post('/deleteFile',(req,res)=>{//delete folder
    console.log(req.body.fname,req.body.path)
    fs.unlinkSync('.'+req.body.path+'/'+req.body.fname, () => { 
      console.log("File Deleted!"); 
      }); 
    sessionNeo4j
    .run('MATCH (f:File{name:$nameParam,path:$pathParam}) DETACH DELETE f RETURN f',{nameParam:req.body.fname,pathParam:req.body.path})
    .then(function(result) {
      console.log('node deleted')
      res.redirect('/folder');
    })
    .catch((err) => {
      console.log(err)
    });
  })


module.exports = router 