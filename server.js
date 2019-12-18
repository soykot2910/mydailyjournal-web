//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
const path=require('path');
const hbs=require('hbs');
const multer=require('multer');

const homeStartingContent = "Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Magnis dis parturient montes nascetur ridiculus mus mauris vitae ultricies. Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus. Ultrices vitae auctor eu augue ut lectus arcu bibendum at. Odio euismod lacinia at quis risus sed vulputate odio ut. Cursus mattis molestie a iaculis at erat pellentesque adipiscing.";
const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));


const publicDirectoryPath=path.join(__dirname,'public')
const viewPath=path.join(__dirname,'views')

app.set('views',viewPath)

app.use(express.static(publicDirectoryPath))

mongoose.connect("mongodb://localhost:27017/blogDB", {useNewUrlParser: true,useUnifiedTopology:true},(err)=>{
 
  if(!err){
    console.log("Mongod connection succeeded");
  }else{
    console.log("Error in Db connection");
  }

});

const postSchema = {
  title: String,
  content: String,
  imagePath:String
};

const userSchema={
  userName:String,
  userEmail:String,
  password:String
};


const Post = mongoose.model("Post", postSchema);

const User=mongoose.model("User",userSchema);

const post1=new Post({
  title:"Deafult day",
  content:"Enter Your Daily plan"
});
const deafultPost=[post1];

app.get("/",function(req,res){
  res.render("login");
});

app.get("/home", function(req, res){

  Post.find({}, function(err, posts){
    res.render("home",{
      startingContent: homeStartingContent,
      posts: posts
      });
    if(posts.length===0){
      Post.insertMany(deafultPost,function(err){
        if(err){
          console.log(err);
        }else{
          console.log("Successlly saved deafult post on database");
        }
      });
    }
  });
});

app.get('/home',function(req,res){
  res.render('home');
})

app.get("/compose", function(req, res){
  res.render("compose");
});
//adding image
const storage=multer.diskStorage({
  destination: './public/images/',
  filename:function(req,file,cb){
    cb(null,file.fieldname + '_'+ Date.now()+path.extname(file.originalname));
  }
});


const upload=multer({
  storage:storage
}).single('imagePath');//input file name should be myImage


app.post("/upload",function(req,res){
  upload(req,res,(err)=>{
    if(err){
      res.send("Error in image upload" + err);
    }else{
      console.log(req.file);
      
    }
  })
})

app.post("/compose", function(req, res){
  const post = new Post({
    title: req.body.postTitle,
    content: req.body.postBody,
    imagePath:req.body.imagePath
  });


  post.save().then( ()=>{
    res.redirect('/');;
  }).catch((error) =>{
    console.log("Error",error);
  });
});


app.get("/posts/:postId", function(req, res){

const requestedPostId = req.params.postId;

  Post.findOne({_id: requestedPostId}, function(err, post){
    res.render("post", {
      title: post.title,
      content: post.content
    });
  });

});

app.get("/register",function(req,res){
  res.render("registration");
});

app.post("/register",function(req,res){
   
  const user=new User({
    userName:req.body.userName,
    userEmail:req.body.userEmail,
    password:req.body.password
  });

  user.save().then( (err)=>{
      res.render('login');
   
  }).catch((err)=>{
    console.log("Error in registration",err);
  })

})

app.get("/login",function(req,res){
  res.render("login");
})

app.post("/login",function(req,res){
  const enterEmail=req.body.userEmail;
  const enterPassword=req.body.password;
   
  User.findOne({userEmail:enterEmail},(err,foundUser)=>{
    if(err){
      console.log(err);
      
    }else{
      if(foundUser){
        if(foundUser.password===enterPassword){
          res.redirect('/home');
        }else{
          res.send("Password not matching");
        }
      }else{
        res.send("Use Name not found");

      }
    }
  })
});

app.get("/about", function(req, res){
  res.render("about", {aboutContent: aboutContent});
});

app.get("/contact", function(req, res){
  res.render("contact", {contactContent: contactContent});
});


app.listen(3000, function() {
  console.log("Server started on port 3000");
});
