import express, {response} from "express"
import mysql from "mysql2/promise"
import {getLocalDate,formatTime,generateBookTime} from "../utils/formatTime.js"
import moment from "moment";
const router=express.Router();

const sql=await mysql.createConnection({
    host:"localhost",
    user:"root",
    port:3306,
    password:"Tohka10xiang",
    database:"airline"
})


const table='flightorder';//查询的表

/**
 * 获取订单列表接口
 */
router.get('/orders',(req,res)=>{
    console.log("获取订单列表接口，调用了/api/orders接口");
    sql.query(`select * from ${table} order by status desc,bookDate desc`)
        .then(response=>{
            let [data]=response;
            //处理数据库返回的utc时间转换为需要的北京时间
            for(let i=0;i<data.length;i++)
            {
                data[i].bookDate=getLocalDate(data[i].bookDate);
                data[i].departTime=formatTime(data[i].departTime);
                data[i].arriveTime=formatTime(data[i].arriveTime);
                data[i].bookTime=formatTime(data[i].bookTime);
            }
            console.log("输出data:",data);
            res.status(200).json({
                code:200,
                message:"Success",
                data
            })
        })
})

/**
 * 获取订单的详情接口
 * params orderID  订单号
 */
router.get('/orders/:orderID',(req, res)=>{
    console.log("获取订单的详情接口,调用了/api/oder/:orderID接口");
    try
    {
        const {orderID}=req.params;//获取orderID
        console.log("orderID:",orderID);
        sql.query(`select * from ${table} where orderID=${orderID}`)
            .then(response=>{
                let [[data]]=response;
                //处理数据库返回的utc时间转换为需要的北京时间
                data.bookDate=getLocalDate(data.bookDate);
                data.departTime=formatTime(data.departTime);
                data.arriveTime=formatTime(data.arriveTime);
                data.bookTime=formatTime(data.bookTime);
                console.log(data);
                res.status(200).json({
                    code:200,
                    message:"Success",
                    data
                })
            })
    }
    catch (e)
    {
        //TODO
    }
})

/**
 * 创建订单接口
 */
router.post('/orders',(req,res)=>{
    console.log("创建订单接口");
    try
    {
        console.log(req.body);
        //获取body中信息
        let {name, identity, phone, flightNo,  departCity, arriveCity, departTime, arriveTime, price,departPortName,arrivePortName,airlineCompanyName}=req.body;
        //生成预定日期
        let bookDate=moment().format().slice(0,10);
        //生成预定时间
        let bookTime=generateBookTime();
        console.log(name, identity, phone, flightNo, bookDate,bookTime, departCity, arriveCity, departTime, arriveTime, price,departPortName,arrivePortName,airlineCompanyName);
        //生成随机订单号
        let orderID=generateOrderId();
        const query=`insert into  ${table} (orderID, name, identity, phone, flightNo, bookDate,bookTime, departCity, arriveCity, departTime, arriveTime, price,departPortName,arrivePortName,airlineCompanyName) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) `;
        sql.query(query,[orderID,name, identity, phone, flightNo, bookDate,bookTime, departCity, arriveCity, departTime, arriveTime, price,departPortName,arrivePortName,airlineCompanyName])
            .then(response=>{
                console.log("创建订单成功",orderID);
                res.status(201).json({
                    message:"购票成功",orderID
                })
            })
            .catch(error=>{
                console.log("创建订单失败，errors:",error);
                res.status(400).json({error:"创建订单失败"})
            })
    }
    catch (e)
    {

    }
})
// 生成订单号的简单实现（可以根据实际情况进行更改）
function generateOrderId() {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2); // 获取当前年份的后两位
    const month = ('0' + (now.getMonth() + 1)).slice(-2); // 获取当前月份，如果是个位数则前面补0
    const day = ('0' + now.getDate()).slice(-2); // 获取当前日期，如果是个位数则前面补0
    let orderId = year + month + day;
    // 生成剩余部分的随机数字
    for (let i = 0; i < 5; i++) {
        orderId += Math.floor(Math.random() * 10); // 生成0-9之间的随机数字
    }
    return orderId;
}


/**
 * 更新订单状态接口
 * 请求参数：
     * 订单号
     * 新的订单状态（例如：已支付、已发货、已完成等）
 * 返回结果：更新后的订单状态信息。
 */
router.put('/orders/:orderID',(req,res)=>{
    console.log("更新订单状态接口");
    try {
        let {orderID}=req.params;//获取订单号
        let {status}=req.body;
        console.log(orderID,status);
        const query=`update ${table} set status=? where orderID=?`;
        sql.query(query,[status,orderID])
            .then(([result])=>{
                console.log(result.affectedRows);
                //如果更新成功，则返回成功消息
                if(result.affectedRows>0)
                {
                    res.status(200).json({ message: '更新订单状态成功' });
                }
                else
                {
                    // 如果没有找到订单，则返回404状态码
                    res.status(404).json({ error: '未找到该订单' });
                }
            })
    }
    catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ error: 'Internal server errors' });
    }
})

export default router;
