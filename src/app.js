const express=require("express");
const app=express();
const path=require("path");
const hbs=require("hbs");
const Razorpay=require("razorpay");
const cors=require("cors");

app.use(cors())

//giving env variable
const dotenv=require("dotenv")
dotenv.config()

//connecting the app to the database

const mongoose=require("mongoose");
mongoose.connect(process.env.DB_URL,{
useNewUrlParser:true,
useUnifiedTopology:true,
}
  
).then(()=>{
    console.log("connection successful from Comment");
}).catch((e)=>{
    console.log("connection unsuccessful");
}) 



//kis type kaa data aa rha hai
app.use(express.json())

const Comment= require("./models/comment")
//creating routes
app.post("/api/comments",(req,res)=>{
    const comment=new Comment({
        username:req.body.username,
        comment:req.body.comment
    })

    comment.save().then(response=>{
        res.send(response)
    })
})

app.get("/api/comments",(req,res)=>{
    Comment.find().then(function(comments){
        res.send(comments)
    })
})

//using razorpay api to integrate in the website

app.post("/payment",async(req ,res)=>{
    let{amount}=req.body;
    
    var instance = new Razorpay({ key_id: 'rzp_test_9aY4T4XHynL1Hi', key_secret: '7VVVUcoi3c7vI1lUf2LxvWQf' })

let order = await instance.orders.create({
  amount: amount*100,
  currency: "INR",
  receipt: "receipt#1",
  
})
res.status(201).json({
    success:true,
    order,amount
});
});
 
const port=process.env.PORT || 3000;

const static_path=path.join(__dirname,"../public");
const template_path=path.join(__dirname,"../templates/views");
const partials_path=path.join(__dirname,"../templates/partials");

app.use(express.static(static_path))
app.set("view engine","hbs");
app.set("views",template_path);
hbs.registerPartials(partials_path);

app.get('/',(req,res)=>{
    res.render("home");
});
app.get('/sector',(req,res)=>{
    res.render("sector");
});
app.get('/services',(req,res)=>{
    res.render("services");
});
app.get('/impacts',(req,res)=>{
    res.render("impact");
});
app.get('/donate',(req,res)=>{
    res.render("donate");
});
app.get('/comments',(req,res)=>{
    res.render("comments");
});



const server=app.listen(port, ()=>{
    console.log(`the server is running on port no. ${port}`);
})
let io=require("socket.io")(server);
io.on("connection",(socket)=>{
    
    //recieve event
    socket.on('comment',(data)=>{
        data.time=Date();
        socket.broadcast.emit("comment",data)
    })
    socket.on("typing",(data)=>{
        socket.broadcast.emit("typing",data)
    })
})