//manage Routing
const express = require('express')
    ,app = express()
    ,port = process.env.PORT || 3000
    ,router = express.Router()
    ,fs = require('fs')
    ,session = require('./sessionManager')
    ,sessionNeo4j = require('./db');
router.use(session);

var text = ''
router.get('/',(req,res)=>{
  if (!req.session || !req.session.login){
    res.render('index',{text:text})
    text = ''
  }
  else res.redirect('folder')
})

router.post('/login',(req, res) =>{
    var email = req.body.email
    var password = req.body.password
    sessionNeo4j
    .run('MATCH (p:Person{email:$emailParam}) RETURN p',{emailParam:email})
    .then(function(result) {
      const properties =[]
      result.records.forEach(function(record,i) {
          properties[i] = record._fields[0].properties
      });
      if(properties.length == 0){
        text = 'Have no this ID'
        console.log(text)
        res.redirect('/')
      }else if(properties[0].password != password){
        text = 'Wrong passord'
        console.log(text)
        res.redirect('/')
      }
      else{
        console.log("Login success")
        req.session.login = true
        req.session.email = email 
        req.session.name =  properties[0].name
        if (!fs.existsSync('./folder/'+req.session.name)){
          fs.mkdirSync('./folder/'+req.session.name);
        }
        res.redirect('/folder')
      } 
    })
    .catch((err) => {
      console.log(err)
    });
});
router.get('/logout',(req,res)=>{
  req.session.destroy();
  res.redirect('/')
})
router.get('/register',(req,res)=>{
    res.render('reg',{text:text})
    text = ''
})

router.post('/insertregister',(req, res) =>{
  var name = req.body.name
  var email = req.body.email
  var password = req.body.password
  sessionNeo4j
  .run('MATCH (p:Person{email:$emailParam}) RETURN p',{emailParam:email})
  .then(function(result) {
    const properties =[]
    result.records.forEach(function(record,i) {
        properties[i] = record._fields[0].properties
    });
    if(properties.length != 0){
      text='This email is already used'
      console.log(text)
      res.redirect('/register');
    }else{
      sessionNeo4j
      .run('CREATE (p:Person{name:$nameParam,email:$emailParam,password:$passwordParam}) RETURN p',{nameParam:name,emailParam:email,passwordParam:password})
      .then(function(result) {
        const properties =[]
        result.records.forEach(function(record,i) {
            properties[i] = record._fields[0].properties
        });
        console.log(properties)
        res.redirect('/');
      })
      .catch((err) => {
        console.log(err)
      });
    }
  })
  .catch((err) => {
    console.log(err)
  });
});


module.exports = router 