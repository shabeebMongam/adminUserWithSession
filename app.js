const express = require('express');
const PORT = 4000;
const ejs = require('ejs');
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const User = require('./models/users');
const Admin = require('./models/admin');
const session = require('express-session')
const nocache = require("nocache");
const oneHour= 1000 * 60 * 60;

const app = express();
const atlasDB = 'mongodb+srv://shabeeb:shabeeb123@nodetaskmanager.cmu7pt6.mongodb.net/registerLogin?retryWrites=true&w=majority';



mongoose.connect(atlasDB, {
    useNewUrlParser: true,
    // useCreateIndex: true,
    // useFindAndModify: false,
    useUnifiedTopology: true
})

app.use(session({
    name: 'newOne',
    secret: 'keyboard cat',
    cookie: { maxAge:oneHour},
    resave: false,
    saveUninitialized: true,
  }))

  app.use(nocache());

// app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(express.urlencoded({extended:true}))


const isThereAuser = (req,res,next)=>{
   
    if(req.session.userLoggedIn){
       return res.redirect('/home');
    }
    next()
}
const isThereAadmin = (req,res,next)=>{
    
    if(req.session.adminLoggedIn){
       return res.redirect('/adminpanel');
    }
    next()
}


app.get('/',isThereAuser,(req,res)=>{
    res.render('index')
})

app.get('/home', (req,res)=>{
    console.log(req.session.user);
    if(req.session.userLoggedIn){
        res.render('user/userHomePage')
    }
    else{
        res.redirect('/login')
    }

})

app.get('/register',isThereAuser,(req,res)=>{
    res.render('user/register')
})

app.get('/login',isThereAuser,(req,res)=>{
 
    res.render('user/login')

    
})
app.get('/admin',isThereAadmin,(req,res)=>{
    res.render('admin/adminLogin')
})
app.get('/adminpanel',(req,res)=>{
    console.log(req.session);
        if(req.session.adminLoggedIn){
            // console.log("reached here");
           return res.render('admin/adminPanel');
        }
    
    res.redirect('/admin');
    
})


//////////////////////////  POST   //////////////////////

app.post('/register',(req,res)=>{
    console.log(req.body);
    const email =req.body.email;
    const password =req.body.password;
    
    User.findOne({email:email},(err,foundEmail)=>{
        if(err){
          console.log(err);
        }else{
            if(foundEmail){
                res.redirect('/register');
                console.log("email exist");
            }
        }
    })

    const newUser = new User ({
        email: email,
        password:password
    });

    newUser.save((err)=>{
        err?console.log(err):res.redirect('/login');
    })
    

        
  


})

app.post('/login',(req,res)=>{
    console.log(req.body);
    const email =req.body.email;
    const password =req.body.password;

    User.findOne({email:email},(err,foundResult)=>{
        if(err){
            console.log(err);
        }
        else{
            if(foundResult.password === password){
                req.session.userLoggedIn = true
                res.redirect('/home')
            }else{
                console.log("Invalid Credentials");
                res.redirect("/login")
            }
        }
    })
})

app.post('/admin',(req,res)=>{
    const email =req.body.adminemail;
    const password =req.body.adminpassword;

    // console.log(req.body);

    
    Admin.findOne({adminemail:email},(err,foundResult)=>{
        if(err){
            console.log(err);
        }
        else{
            // console.log(foundResult);
            if(foundResult.adminpassword === password){

                req.session.adminLoggedIn = true
                res.redirect('/adminpanel');
            }else{
                console.log("Invalid Credentials");
                res.redirect("/admin")
            }
            // console.log(foundResult);
        }
    })
})

app.post('/user/logout',(req,res)=>{
    req.session.userLoggedIn = null;
    
    res.redirect('/login');
})
app.post('/admin/logout',(req,res)=>{
    req.session.adminLoggedIn = null;
    
    res.redirect('/admin');
})




app.listen(PORT,()=>{
    console.log(`Server started on port ${PORT}  http://localhost:${PORT}/`);
})