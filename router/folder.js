//manage Routing
const express = require('express')
    ,app = express()
    ,port = process.env.PORT || 3000
    ,router = express.Router()
    ,fs = require('fs')
    ,session = require('./sessionManager')
    ,sessionNeo4j = require('./db');
router.use(session);

  var text=''
router.get('/folder',(req,res)=>{//show own
    if (!req.session || !req.session.login){
      text = 'Please login'
      res.redirect('/')
    }else {
      sessionNeo4j
      .run('MATCH (p:Person{name:$nameParam})-[HAVE]->(d:Folder) RETURN d',{nameParam:req.session.name})
      .then(function(result) {
        const Folder =[]
        result.records.forEach(function(record,i) {
        Folder[i] = record._fields[0].properties
        });
          sessionNeo4j
          .run('MATCH (p:Person{name:$nameParam})-[OWNS]->(f:File) RETURN f',{nameParam:req.session.name})
          .then(function(result) {
            const File =[]
            result.records.forEach(function(record,i) {
                File[i] = record._fields[0].properties
            });
            
            Folder.sort((a,b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0))
            File.sort((a,b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0))
            res.render('file',{name:req.session.name,folder:Folder,file:File})
          })
          .catch((err) => {
            console.log(err)
          });
      })
      .catch((err) => {
        console.log(err)
      });
    }
})

router.post('/shareFolder',(req,res)=>{//select person to share
  if (!req.session || !req.session.login){
    text = 'Please login'
    res.redirect('/')
  }else {
    sessionNeo4j
    .run('MATCH (p:Person) WHERE NOT p.name IN [$nameParam] RETURN p'
    ,{nameParam:req.session.name})
    .then(function(result) {
      const Person =[]
      result.records.forEach(function(record,i) {
        Person[i] = record._fields[0].properties
      });
      Person.sort((a,b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0))
      res.render('shareFolderPerson',{person:Person,path:req.body.path,fname:req.body.fname})
    })
    .catch((err) => {
      console.log(err)
    });
  }
})

router.post('/shareFolderPerson',(req,res)=>{//show own
    sessionNeo4j
    .run('MATCH (p:Person{name:$nameParam}),(f:Folder{name:$fnameParam,path:$pathParam}) CREATE (p)<-[s:SHARE]-(f) RETURN p,s,f'
    ,{
      nameParam:req.body.name,
      fnameParam:req.body.fname,
      pathParam:req.body.path
    })
    .then(function(result) {
      console.log('share done')
      console.log(req.body.name)
      console.log(req.body.fname)
      console.log(req.body.path)
      res.redirect('/folder')
    })
    .catch((err) => {
      console.log(err)
    });
})

router.post('/shareFile',(req,res)=>{//select person to share
  if (!req.session || !req.session.login){
    text = 'Please login'
    res.redirect('/')
  }else {
    sessionNeo4j
    .run('MATCH (p:Person) WHERE NOT p.name IN [$nameParam] RETURN p'
    ,{nameParam:req.session.name})
    .then(function(result) {
      const Person =[]
      result.records.forEach(function(record,i) {
        Person[i] = record._fields[0].properties
      });
      Person.sort((a,b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0))
      res.render('shareFilePerson',{person:Person,path:req.body.path,fname:req.body.fname})
    })
    .catch((err) => {
      console.log(err)
    });
  }
})

router.post('/shareFilePerson',(req,res)=>{//show own
  sessionNeo4j
  .run('MATCH (p:Person{name:$nameParam}),(f:File{name:$fnameParam,path:$pathParam}) CREATE (p)<-[s:SHARE]-(f) RETURN p,s,f'
  ,{
    nameParam:req.body.name,
    fnameParam:req.body.fname,
    pathParam:req.body.path
  })
  .then(function(result) {
    console.log('share done')
    console.log(req.body.name)
    console.log(req.body.fname)
    console.log(req.body.path)
    res.redirect('/folder')
  })
  .catch((err) => {
    console.log(err)
  });
})

router.post('/showFolder',(req,res)=>{//show own
  console.log(req.body.path)
  if (!req.session || !req.session.login){
    text = 'Please login'
    res.redirect('/')
  }else {
    sessionNeo4j
    .run('MATCH (Person{name:$nameParam})-[OWNS]->(d:Folder{name:$folderParam}) MATCH (d)-[HAVE]->(f:File) RETURN f'
    ,{nameParam:req.body.name,folderParam:req.body.fname})

    .then(function(result) {
      const File =[]
      result.records.forEach(function(record,i) {
        File[i] = record._fields[0].properties
      });
      File.sort((a,b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0))
      console.log('f show '+req.body.fname)
      res.render('showFolder',{name:req.session.name,file:File,path:req.body.path,fname:req.body.fname})
    })
    .catch((err) => {
      console.log(err)
    });
  }
})

router.post('/showShareFolder',(req,res)=>{//show own
  console.log(req.body.path)
  if (!req.session || !req.session.login){
    text = 'Please login'
    res.redirect('/')
  }else {
    sessionNeo4j
    .run('MATCH (Person{name:$nameParam})<-[SHARE]-(d:Folder{name:$folderParam}) MATCH (d)-[HAVE]->(f:File) RETURN f'
    ,{nameParam:req.body.name,folderParam:req.body.fname})

    .then(function(result) {
      const File =[]
      result.records.forEach(function(record,i) {
        File[i] = record._fields[0].properties
      });
      File.sort((a,b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0))
      console.log('f show '+req.body.fname)
      res.render('showShareFolder',{name:req.session.name,file:File,path:req.body.path,fname:req.body.fname})
    })
    .catch((err) => {
      console.log(err)
    });
  }
})

router.post('/insertFolder',(req,res)=>{//insert folder
  var path = '/folder'+'/'+req.session.name
  var folderName = req.body.folderName
  sessionNeo4j
  .run('MATCH (f:Folder{name:$folderParam}) RETURN f',{folderParam:folderName})
  .then(function(result) {
    const found =[]
    result.records.forEach(function(record,i) {
      found[i] = record._fields[0].properties
    });
    if(found.length != 0){
      text='This email is already used'
      console.log(text)
      res.redirect('/folder');
    }else{
      path = path+'/'+folderName
      if (!fs.existsSync('.'+path)){
        fs.mkdirSync('.'+path, { recursive: true });
      }
      sessionNeo4j
      .run('MATCH (p:Person{name:$nameParam}) CREATE (p)-[o:OWNS]->(f:Folder{name:$folderParam,path:$pathParam}) RETURN p,o,f',
      {nameParam:req.session.name,folderParam:folderName,pathParam:path})
      .then(function(result) {
        const folder =[]
        result.records.forEach(function(record,i) {
          folder[i] = record._fields[0].properties
        });
        res.redirect('/folder');
      })
      .catch((err) => {
        console.log(err)
      });
    }
    
  })
  .catch((err) => {
    console.log(err)
  });
})

router.post('/deleteFolder',(req,res)=>{//delete folder
  if (fs.existsSync(req.body.deleteVar)){
    fs.rmdir(req.body.deleteVar, () => { 
    console.log("Folder Deleted!"); 
    }); 
  }
  console.log("delete node")
  sessionNeo4j
  .run('MATCH (f:Folder{path:$folderParam}) DETACH DELETE f RETURN f',{folderParam:req.body.deleteVar})
  .then(function(result) {
    console.log("delete node")
    res.redirect('/folder');
  })
  .catch((err) => {
    console.log(err)
  });
})


module.exports = router 