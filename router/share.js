//manage Routing
//manage Routing
const express = require('express')
    ,app = express()
    ,port = process.env.PORT || 3000
    ,router = express.Router()
    ,fs = require('fs')
    ,session = require('./sessionManager')
    ,sessionNeo4j = require('./db');
router.use(session);
  

router.get('/share',(req,res)=>{
    if (!req.session || !req.session.login){
      text = 'Please login'
      res.redirect('/')
    }else {
      sessionNeo4j
      .run('MATCH (p:Person{name:$nameParam})<-[SHARE]-(d:Folder) RETURN d',{nameParam:req.session.name})
      .then(function(result) {
        const Folder =[]
        result.records.forEach(function(record,i) {
        Folder[i] = record._fields[0].properties
        });
          sessionNeo4j
          .run('MATCH (p:Person{name:$nameParam})<-[SHARE]-(f:File) RETURN f',{nameParam:req.session.name})
          .then(function(result) {
            const File =[]
            result.records.forEach(function(record,i) {
                File[i] = record._fields[0].properties
            });
            Folder.sort((a,b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0))
            File.sort((a,b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0))
            res.render('share',{name:req.session.name,folder:Folder,file:File})
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



module.exports = router 