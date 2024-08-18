import {Sequelize} from 'sequelize';
const sequelize = new Sequelize("airline","root","Tohka10xiang",{
    host:"localhost",
    dialect:"mysql"
})

export default sequelize;
