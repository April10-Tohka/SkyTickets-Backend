import express from "express";
//路由
import auth from "./src/routes/auth.js";
import restapi from "./src/routes/restapi.js";
import ctripApiRoute from "./src/routes/ctrip-api-route";
//模型
import sequelize from "./src/models/index.js";

import flightAPI from "./src/modules/flightAPI.js";
import orderAPI from "./src/modules/orderAPI.js";
import mysql from "mysql2/promise.js";

// 中间件
import { requestLogger, requestErrorLogger } from "./src/middlewares/logger.js";
const sql = await mysql.createConnection({
    host: "localhost",
    user: "root",
    port: 3306,
    password: "Tohka10xiang",
    database: "airline",
});
const origin = "http://localhost:5173";
const setHeader = (req, res, next) => {
    res.header("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS,PUT"); // 允许的请求方法
    res.setHeader("Access-Control-Allow-Headers", "Content-Type"); // 允许的请求头
    next();
};
const app = express();
app.use(requestLogger);

app.use(express.json());
app.use(setHeader);
app.use("/api", flightAPI);
app.use("/api", orderAPI);
app.use("/auth", auth);
app.use("/restapi", restapi);
app.use("/ctrip", ctripApiRoute);

//错误处理中间件
app.use(requestErrorLogger);
/**
 这样，您的应用程序就会在启动时检查数据库是否已经存在，并且仅在必要时同步数据库结构。
 这种方式可以有效防止每次启动应用程序时都重新创建表，同时确保在初次运行时正确初始化数据库。
**/
// Function to check if the database has been initialized
function checkDatabase() {
    try {
        // Attempt to authenticate the connection
        return sequelize
            .authenticate()
            .then(() => {
                console.log("测试链接数据库成功");
                // Sync the database
                return sequelize.sync();
            })
            .then(() => {
                console.log("同步数据库成功");
            });
    } catch (error) {
        console.error("Unable to connect to the database:", error);
    }
}

checkDatabase().then(() => {
    app.listen(3000, () => {
        console.log("服务器启动！地址为:  http://localhost:3000");
    });
});
