import {DataTypes} from "sequelize";
import sequelize from "./index.js";

//Verification表字段配置
const VerificationModelOptions={
    phone:{
        type:DataTypes.STRING,
        allowNull: false,
        unique:true
    },
    captcha:{
        type:DataTypes.STRING,
        allowNull: false
    },
    expiresAt:{
        type: DataTypes.DATE,
        allowNull: false,
    }
}

const Verification=sequelize.define('User',VerificationModelOptions,{
    timestamps:false,
    tableName:"Verification"
})

export default Verification
