import {Sequelize,DataTypes} from 'sequelize';
const sequelize = new Sequelize("airline","root","Tohka10xiang",{
    host:"localhost",
    dialect:"mysql"
})
sequelize.authenticate()
    .then((res)=>{
        console.log("测试链接成功");
    })
    .catch((error)=>{
        console.log("链接失败");
    })

//User表字段配置
const UserModelOptions={
    phone:{
        type:DataTypes.STRING,
        unique:true
    },
    passwordHash:{
        type:DataTypes.STRING,
        allowNull:false
    }
}
const User=sequelize.define('User',UserModelOptions,{
    timestamps:false,
    tableName:"User"
})

User.sync()
    .then((r)=>{
        console.log(`${r}模型刚刚（重新）创建`);
    })

export default User;


