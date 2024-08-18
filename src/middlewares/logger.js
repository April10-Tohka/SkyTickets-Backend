import log4js from "log4js"

// 配置log4js
log4js.configure({
    // 定义日志如何输出
    appenders:{
        console:{type:"console"},
        httpRequest:{
            type:"file",
            filename:"src/logs/httpRequest.log",
            pattern:"yyyy-MM-dd.log",
            compress:true,
        },
        httpRequestError:{
            type:"file",
            filename:"src/logs/httpRequestError.log",
            pattern:"yyyy-MM-dd.log",
            compress:true
        }
    },
    // 定义日志的类别
    categories:{
        default:{appenders:["console"],level:"debug"},
        "requestLogger": {appenders: ["httpRequest","console"], level: "info" },
        "requestErrorLogger":{appenders:["httpRequestError","console"],level:"error"}
    }
})


//记录http请求的中间件
export const requestLogger=(req,res,next)=>{
    console.log("记录http请求的中间件");
    log4js.getLogger("requestLogger").info(`请求开始: ${req.method} ${req.originalUrl}`);
    //在请求结束时记录成功或失败的请求。
    res.on('finish',()=>{
        if(res.statusCode>=400)
        {
            //http请求响应失败
            log4js.getLogger("requestLogger").error(`请求失败: ${req.method} ${req.originalUrl} - ${res.statusCode}`);
        }
        else
        {
            //http请求响应成功
            log4js.getLogger("requestLogger").info(`请求成功: ${req.method} ${req.originalUrl} - ${res.statusCode}`);
        }

    })
    next()
}


// 记录http请求失败的中间件
export const requestErrorLogger=(err,req,res,next)=>{
    console.log("记录http请求失败的中间件!!!",err);
    log4js.getLogger("requestErrorLogger").error(`请求失败: ${req.method} ${req.originalUrl} - ${err.status}  ${err.message}`);
    res.status(err.status).json({
        message:err.message
    })
}


