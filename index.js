const express = require('express')
const exec = require('exec')
const app = express()
const keys = require('./keys.json')

let token = keys.authToken
let username = keys.username
let password = keys.password
let AUTH_TOKEN = process.env.AUTH_TOKEN || token

app.all('/*', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  next()
})

app.options(/(.*)/, (req, res, next) => {
  res.sendStatus(200) // Always respond OK on OPTIONS requests.
})

const checkAccess = (req, res, next) => {
  let {authorization} = req.headers
  if (authorization === AUTH_TOKEN) {
    next()
  } else {
    res.sendStatus(401)
  }
}

// if (process.env.NODE_ENV === 'production') {
// }
app.use(checkAccess)

function execAuthScript () {
  console.log('Running auth script...')
  return new Promise((resolve, reject) => {
    exec(`python authscript.py ${username} ${password}`, (err, stdout, stderr) => {
      console.log(stdout)
      resolve(String(stdout))
      if (err) reject(stderr)
    })
  })
}

const PORT = process.env.PORT || 9000

app.listen(PORT, function () {
  console.log(`App listening on port ${PORT}`)
})

app.get('/', function (req, res) {
  res.send('Ready!')
})

app.get('/auth', function (req, res) {
  execAuthScript()
    .then(token => res.send({token}))
    .catch(err => console.log(err))
})
