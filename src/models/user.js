import sequelize from "./index.js";
import {DataTypes} from "sequelize";


//User表字段配置
const UserModelOptions={
    phone:{
        type:DataTypes.STRING,
        allowNull: false,
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

export default User;
