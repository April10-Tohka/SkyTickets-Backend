import express, {json, response} from "express"
import mysql from "mysql2/promise"
import {formatTime} from "../utils/formatTime.js";

const router=express.Router();

const sql=await mysql.createConnection({
    host:"localhost",
    user:"root",
    port:3306,
    password:"Tohka10xiang",
    database:"airline"
})

/**
 * 获取所有的航班数据
 *  query参数：page 页码
 */
router.get('/getAllFlights',(req,res)=>{
    console.log("调用了/api/getFlights接口");
    try
    {
        //每页大小
        let pageSize=10;
        //获取页码
        console.log("页码",req.query);
        let {page}=req.query;
        // 计算查询起始偏移量
        const offset = (page - 1) * pageSize;
        //查询数据库
        sql.query(`select * from flightmanage limit ?,?`,[offset,parseInt(pageSize)])
            .then(([data])=>{
                //格式化时间
                data.forEach((item)=>{
                    item.departTime=formatTime(item.departTime);
                    item.arriveTime=formatTime(item.arriveTime);
                })
                console.log(data);
                //查询总记录数
                return sql.query(`select count(*) as total from flightmanage`)
                    .then(([[{total}]])=>{
                        console.log("total",total);
                        //构建分页对象
                        const pagination={
                            total,
                            currentPage:page,
                            pageSize
                        }
                        // 返回查询结果和分页信息
                        res.status(200).json({data,pagination})
                    })
            })
            .catch(error=>{
                console.error('Error fetching data:', error);
                res.status(500).json({ error: 'Error fetching data' });
            })
    }
    catch (error)
    {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'Error fetching data' });
    }

})

/**
 * 获取热门航线
 */
router.get('/getHotFlight',(req,res)=>{
    console.log("调用了/api/getHotFlight接口");
    /**
     * 返回  热门景点图片，出发地，目的地，飞机舱类型，机票售价，出发日期
     */
    sql.query('select * from flightmanage order by rand()<=0.5 limit 4;')
        .then(response=>{
            console.log("response:",response);
            let [data]=response;
            res.json({
                code:200,
                message:"Success",
                data
            })
        })
})

/**
 * 获取数据库中所需要字段的所有数据
 */
router.get('/getData/:column',(req,res)=>{
    console.log("调用了/api/getData接口");
    let column=req.params.column;
    console.log(column);
    sql.query(`select ${column} from flightmanage group by ${column}`).then((response)=>{
        let [array]=response;
        const data=array.map(item=>item[column]);
        console.log("data:",data);
        res.json({
            code:200,
            message:"Success",
            data
        })
    })

})

/**
 * 获取某个城市所拥有的机场
 */
router.get('/getCityPort',(req,res)=>{
    console.log("调用了getCityPort接口",req.query);
    let {city}=req.query;
    sql.query(`select departPortName from flightmanage where departCity='${city}' group by departPortName`).then(response=>{
        let [array]=response;
        const data=array.map(item=>item.departPortName);
        console.log("data:",data);
        res.json({
            code:200,
            message:"Success",
            data
        })
    })

})
/**
 * 获取某个航班的信息
 */
router.get('/getFlightDetail/:flightNo',(req,res)=>{
    console.log("调用了/getFlightDetail/:flightNo接口");
    let {flightNo}=req.params;
    console.log("flightNo:",flightNo);
    sql.query(`select * from flightmanage where flightNo='${flightNo}'`)
        .then(response=>{
        let [[data]]=response;
        console.log("获取该航班的信息:",data);
        if(data)
        {
            console.log("返回航班信息不是空数组,代表查询成功，存在该航班");
            //格式化时间
            data.departTime=formatTime(data.departTime);
            data.arriveTime=formatTime(data.arriveTime);
            console.log(data);
            res.json({
                code:200,
                message:"Success",
                data:data
            })
        }
        else
        {
            console.log("返回航班信息是空数组,代表查询失败，不存在该航班");
            throw new Error(`未查询到该航班 ${flightNo}!`);
        }
    })
        .catch(error=>{
        console.log("查询不到该航班!error:",error);
        res.json({
            code:400,
            message:error.message,
        })
    })

})

/**
 * 获取某个航班的所有飞机票
 */
router.get('/getFlightTickets',(req,res)=>{
    console.log("调用了/api/getFlightTickets接口");
    let {departCity,arriveCity}=req.query;
    console.log(departCity,arriveCity);
    sql.query(`select * from flightmanage where departCity='${departCity}' and arriveCity='${arriveCity}'`).then(response=>{
        let [data]=response;
        data.forEach(item=>{
            item.departTime=formatTime(item.departTime);
            item.arriveTime=formatTime(item.arriveTime);
        })
        console.log(data);
        res.json({
            code:200,
            message:"Success",
            data
        })
    })

})

/**
 * 新增航班信息接口
 */
router.post('/flight',(req,res)=>{
    console.log("调用了/api/flight接口");
    try
    {
        //从请求中获取数据
        let {flightNo,airlineCompanyName,aircraftType,departCity,departPortName
            ,departTime,arriveCity,arrivePortName,arriveTime,seatCount,price}=req.body._value;
        sql.query(`insert into flightmanage
            (flightNo,airlineCompanyName,aircraftType,departCity,departPortName
            ,departTime,arriveCity,arrivePortName,arriveTime,seatCount,price)
            values (?,?,?,?,?,?,?,?,?,?,?)`,[flightNo,airlineCompanyName,aircraftType,departCity,departPortName
            ,departTime,arriveCity,arrivePortName,arriveTime,seatCount,price])
            .then(response=>{
                console.log("插入成功")
                // 如果插入成功，返回成功响应
                res.status(200).json({ message: '录入航班信息成功' });
            })
            .catch(error=>{
                console.log("插入失败,err",error);
                res.status(400).json({ message: '重复录入，该航班信息已经存在' });
            })
    }
    catch (error)
    {
        //无法从请求中获取到数据
        console.error('Error inserting data:', error);
        res.status(500).json({ error: 'Error inserting data' });
    }
})

/**
 * 修改航班信息接口
 * params参数： flightNo航班号
 */
router.put('/flight/:flightNo',(req,res)=>{
    console.log("调用了/flight/:flightNo接口");
    try
    {
        let {flightNo}=req.params;
        let {departCity,arriveCity, departPortName, arrivePortName, departTime, arriveTime, price, airlineCompanyName, aircraftType,  seatCount, bookedCount, remainingCount}=req.body;
        console.log("航班号:",flightNo);
        console.log("传递来的数据:",req.body);
        sql.query('update flightmanage set departCity=?,arriveCity=?,departPortName=?,arrivePortName=?,departTime=?,arriveTime=?,price=?,airlineCompanyName=?,aircraftType=?,seatCount=?,bookedCount=?,remainingCount=? where flightNo=?',
            [departCity,arriveCity,departPortName,arrivePortName,departTime,arriveTime,price,airlineCompanyName,aircraftType,seatCount,bookedCount,remainingCount,flightNo])
            .then(response=>{
                console.log("修改成功");
                res.status(200).json({ message: '修改航班信息成功' });
            })
            .catch(error=>{
                console.log("修改失败")
                res.status(404).json({ error: 'Flight not found' });
            })
    }
    catch (error)
    {
        console.error('Error updating flight:', error);
        res.status(500).json({ error: 'Error updating flight' });
    }
})
export default router;
