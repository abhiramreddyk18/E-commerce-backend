const mongoose=require('mongoose');

const url='mongodb://localhost:27017/shopping';

const connectDB=async()=>{
    mongoose.connect(url).then(()=>console.log("mongoose connected"))
    .catch(err=>console.error("MongoDB connection error"));

}


module.exports=connectDB;