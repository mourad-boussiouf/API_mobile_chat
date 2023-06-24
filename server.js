var express = require('express');
var app = express();

var cors = require('cors')

const cookieParser = require('cookie-parser');
app.use(cookieParser())

/* Listening port */
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log(`L'appli marche sur le port ${PORT}`)
})

app.use(
  cors({
    credentials: true,
  })
);

app.use(express.urlencoded({extended: true}))

app.use(express.json())

app.use(express.static('public')); 
app.use('/public', express.static('images'));


const usersRouter = require('./routes/users.routes')
const conversationsRouter = require('./routes/conversations.routes')
const adminRouter = require('./routes/admin.routes')
const invitationsRouter = require('./routes/invitations.routes')

app.use('/user', usersRouter)
app.use('/conversations', conversationsRouter)
app.use('/admin', adminRouter)
app.use('/invitations', invitationsRouter)

// respond with "hello world" when a GET request is made to the homepage
app.get('/', function(req, res) {
  res.send('Home');
});
