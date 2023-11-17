const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
//router
const auth = require('./router/auth')
const file = require('./router/file')
const folder = require('./router/folder')
const share = require('./router/share')
const download = require('./router/download')

    ,app = express()
    ,port = process.env.PORT || 3000

app.set('views',path.join(__dirname,'views'))
app.set('view engine','ejs')

app.use(express.urlencoded({extended:false}))// if use post
app.use(cookieParser())
app.use(express.json())
app.use(auth)
app.use(file)
app.use(folder)
app.use(share)
app.use(download)

app.use(express.static(__dirname + '/public'));




app.listen(port, ()=>console.log(`Server is running on port ${port}`))
