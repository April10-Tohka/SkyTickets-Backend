import express from 'express'
import  mysql  from 'mysql2/promise.js'
import flightAPI from "./src/modules/flightAPI.js"
import orderAPI from "./src/modules/orderAPI.js";
const sql=await mysql.createConnection({
    host:"localhost",
    user:"root",
    port:3306,
    password:"Tohka10xiang",
    database:"airline"
})
const origin='http://localhost:5173'
const setHeader=(req,res,next)=>{
    res.header('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS,PUT'); // 允许的请求方法
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type'); // 允许的请求头
    next();
}
const app=express();
app.use(express.json());
app.use(setHeader)
app.use('/api',flightAPI);
app.use('/api',orderAPI);



app.listen(3000,()=>{
    console.log("服务器启动！地址为:  http://localhost:3000");
})
