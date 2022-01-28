const express = require('express')
const session = require('express-session')
const bodyParser = require('body-parser')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const app = express()

const TWO_HOURS = 1000 * 60 * 60 * 2

app.set('trust proxy', 1)

app.use(cors({
    credentials:true,
    origin: "http://127.0.0.1:5500",
}))
app.use(cookieParser())
app.use(session({
    name: 'sid',
    resave: false,
    saveUninitialized: false,
    secret: 'anyrandomstring',
    cookie: {
        maxAge: TWO_HOURS,
        sameSite: false,
        secure: false,
        httpOnly:false
    }
}))

app.use(express.json()) // accept as send json
app.use(bodyParser.urlencoded({ // accept form body
    extended: true
}))

app.use((req, res, next) => {
    const { userId } = req.session
    if (userId) {
        res.locals.user = users.find(user => user.id === userId)
    }
    next()
})

const users = [
    {
        id: 1,
        name: 'Franklin',
        email: 'franklin@gmail.com',
        password: '123'
    },
    {
        id: 2,
        name: 'Trevor',
        email: 'trevor@gmail.com',
        password: '321'
    },
]

const redirectLogin = (req, res, next) => {
    if (!req.session.userId) {
        res.redirect('/login')
    } else {
        next()
    }
}

const redirectHome = (req, res, next) => {
    console.log(req.sessionID)
    if (req.session.userId) {
        res.redirect('/home')
    } else {
        next()
    }
}

app.get('/', (req, res) => {
    console.log(req.session)
    const { userId } = req.session
    res.send(`
    <h1>Welcome!</h1>
    ${userId ? ` <a href='/home'>Home</a>
    <form method="post" action="/logout">
        <button>Logout</button>
    </form>` : `  <a href='/login'>Login</a>
    <a href='/register'>Register</a>
    `}`)
})

app.get('/home', redirectLogin, (req, res) => {
    const { user } = res.locals
    res.send(`
    <h1>Home</h1>
    <a href="/">Main</a>
    <ul>
        <li>Name: ${user.name} </li>
        <li>Email: ${user.password}</li>
    </ul>
    `)
})

app.get('/login', redirectHome, (req, res) => {
    res.send(`
    <h1>Login</h1>
    <form method="post" action="/login">
        <input type="email" name="email" placeholder="Email" required/>
        <input type="password" name="password" placeholder="Password" required/>
        <input type="submit" value="Submit"/>
    </form>
    <a href="/register">Register</a>
     `)
})

app.get('/register', redirectHome, (req, res) => {
    res.send(`
    <h1>Login</h1>
    <form method="post" action="/register">
        <input type="text" name="name" placeholder="Name" required/>
        <input type="email" name="email" placeholder="Email" required/>
        <input type="password" name="password" placeholder="Password" required/>
        <input type="submit" value="Submit"/>
        <a href="/login">Login</a>
    </form>
     `)
})


app.post('/login', redirectHome, (req, res) => {
    const { email, password } = req.body
    if (!email || !password) return res.status(400)
    const user = users.find(user => user.email === email && user.password === password)
    if (!user) return res.status(400)
    console.log(user.id)
    req.session.userId = user.id
    console.log(req.session)
    return res.status(200).json({
        sessionID:req.session.id
    })

})

app.post('/register', redirectHome, (req, res) => {
    const { name, email, password } = req.body
    if (!name || !email || !password) return res.status(400)
    const exist = users.some(user => user.email === email)
    if (exist) return res.status(400)
    const newUser = {
        id: users.length + 1,
        name,
        email,
        password
    }
    users.push(newUser)
    req.session.userId = newUser.id
    return res.redirect('/home')
})

app.post('/logout', redirectLogin, (req, res) => {
    req.session.destroy(err => {
        if (err) return res.redirect('/home')
        res.clearCookie('sid')
        res.redirect('/login')
    })
})

app.listen(5000, () => {
    console.log(`App running on PORT 5000`)
})