import  bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import User from "../models/user.js";
import Verification from "../models/verification.js";
import 'dotenv/config'
const secretKey = process.env.SECRET_KEY;//密钥
const saltRounds = 10;


/**
 * 登录接口
 * 如果客户端传来的手机号和密码为空，表示请求不符合预期，您可以返回一个 400 Bad Request 错误。这是因为客户端发送的请求存在问题，不符合服务器的要求。因此，适合的状态码是 400
 * 状态码为 500 通常表示服务器内部错误，这意味着在处理请求时发生了意外的错误，导致服务器无法正确地处理请求。这种错误通常是由于代码中的 bug、数据库访问问题、其他服务的故障等原因引起的
 * 如果密码验证不通过，表示用户提供的密码与数据库中存储的密码不匹配，这属于客户端提供了无效的凭据。对于这种情况，适合返回的状态码是 401 Unauthorized（未授权）。这样客户端就会知道它提供的凭据是无效的，不允许继续进行请求。
 * 生成 token 的响应状态码通常是 200（OK）。这是因为生成 token 本身并没有出错，而且是预期的成功操作，所以使用状态码 200 是合适的。即使登录操作本身需要身份验证，但是生成 token 这一步并不需要验证，因此返回 200 表示操作成功。
 */
export function accountLogin(req,res)
{
    console.log("调用了login接口");
    try
    {
        //获取客户端传递来的数据
        const {phone,password}=req.body;
        console.log("传来的手机号和密码:",phone,password);
        if(!phone || !password)
        {
            throw {status:400,error:"需要手机号和密码"};
        }
        //查询数据库中是否有该手机号
        User.findOne({where:{phone}})
            .then(user=>{
                console.log("findOne返回的user",JSON.stringify(user));
                if(!user)
                {
                    //没有该手机号
                    return Promise.reject({status:401,error:"没有找到此手机号"})
                }
                //比对密码
                return bcrypt.compare(password,user.passwordHash)
                    .then(isMatch=>{
                        console.log("比对密码后的结果:",isMatch);
                        if(!isMatch)
                        {
                            //密码不正确
                            return Promise.reject({status:401,error:"密码不正确"});
                        }
                        return JSON.stringify(user);
                    })
            })
            .then(user=>{
                console.log("比对密码成功后生成token",user);
                //负载
                const payload={
                    phone,
                    id:user.id
                };
                //生成token
                const token=jwt.sign(payload,secretKey,{expiresIn: '1h'});
                res.status(200).json({
                    message:`该手机号${phone}成功登录`,
                    token
                })
            })
            .catch(err=>{
                // 捕获错误并处理
                console.log("// 捕获错误并处理",err);
                res.status(err.status).json({error:err.error});
            })
    }
    catch (err)
    {
        console.log("// try catch中catch，err:",err);
        res.status(err.status || 500).json({ error: err.error } || "服务器内部发生错误");
    }
}

/**
 *  注册时发送验证码
 */
export function sendCaptcha(req,res)
{
    console.log("调用了/register/send-captcha接口");
    try
    {
        //获取手机号
        let {phone}=req.body;
        console.log("手机号：",phone);
        //如果手机号为空
        if(!phone)
        {
            throw {status:400,error:"需要手机号"};
        }
        // 生成验证码
        let captcha="123456";
        console.log(`captcha for ${phone}: ${captcha}`);
        Verification.create({
            phone,
            captcha,
            expiresAt:new Date(Date.now() + 15 * 60 * 1000)
        })
            .then(()=>{
                console.log("成功往数据库Verification插入");
                res.status(200).json({
                    message:"验证码成功发送，请注意签收",
                    captcha
                })
            })
            .catch(err=>{
                console.log("往数据库Verification插入失败",err);
                switch (err.name)
                {
                    // 唯一约束错误：如果尝试插入的数据违反了数据库表中的唯一约束（例如，尝试插入的用户名已经存在于数据库中），则数据库会拒绝插入并返回唯一约束错误。
                    case "SequelizeUniqueConstraintError":
                        console.log("该手机号已经获取过验证码");
                        //生成新的验证码
                        captcha="123456";
                        // 更新验证码及过期时间
                        Verification.update({
                            captcha:captcha,
                            expiresAt: new Date(Date.now() + 15 * 60 * 1000)
                        },{where:{phone}})
                            .then(value => {
                                console.log("更新数据完成后调用",value);
                                res.status(200).json({
                                    message:"验证码成功发送，请注意签收",
                                    captcha
                                })
                            })
                }
            })
    }
    catch (err)
    {
        console.log("// try catch中catch，err:",err);
        res.status(err.status || 500).json({ error: err.error } || "服务器内部发生错误");
    }
}

/**
 * 注册时验证验证码
 */
export function verifyCaptcha(req,res)
{
    console.log("调用了/register/verify-captcha接口");
    try
    {
        //获取手机号和验证码
        let {phone,captcha}=req.body;
        console.log("手机号：",phone);
        console.log("验证码：",captcha);
        //如果手机号或者验证码为空
        if(!phone || !captcha)
        {
            throw {status:400,error:"需要手机号和验证码"};
        }
        //查询用户数据库中是否有该手机号
        User.findOne({where:{phone}})
            .then(existingUser=>{
                console.log("查询数据库中是否有该手机号", JSON.stringify(existingUser));
                if (existingUser)
                {
                    //存在该手机号，返回rejected的Promise
                    return Promise.reject({status: 400, error: "该手机号已注册",to:"请直接登录"})
                }
            })
            .then(()=>{
                //验证是否匹配
                return  Verification.findOne({where:{phone,captcha}})
                    .then(verification => {
                        console.log("verification:",JSON.stringify(verification));
                        if(!verification)
                        {
                            return Promise.reject({status:400,error:"无效验证码",success:false});
                        }
                        console.log("现在的时间:",new Date());
                        console.log("验证码的过期时间",verification.expiresAt);
                        if (new Date() > verification.expiresAt)
                        {
                            return Promise.reject({status:400,error:"验证码已过期,请重新获取",success:false});
                        }
                        return {message:"验证码有效",success:true};
                    })
            })
            .then((responseInformation)=>{
                //验证通过后删除验证码
                console.log("验证通过后删除验证码及手机号记录",responseInformation);
                return  Verification.destroy({where: {phone}})
                    .then(value => {
                        console.log("删除验证码成功!",value);
                        res.status(200).json(responseInformation)
                    })
                    .catch(err=>{
                        console.log("删除验证码失败！！！",err);
                    })
            })
            .catch(err=>{
                // 捕获错误并处理
                console.log("// 捕获错误并处理",err);
                res.status(err.status).json({success:err.success,error:err.error,to:err.to});
            })

    }
    catch (err)
    {
        console.log("// try catch中catch，err:",err);
        res.status(err.status || 500).json({ error: err.error } || "服务器内部发生错误");
    }
}

/**
 * 注册时设置密码
 */
export function setPassword(req,res)
{
    console.log("调用了/register/set-password接口");
    try
    {
        //获取客户端传来的手机号和密码
        const {phone,password}=req.body;
        console.log("传来的手机号和密码:",phone,password);
        //如果手机号或者密码为空
        if(!phone || !password)
        {
            throw {status:400,error:"需要手机号和密码"};
        }
        //查询数据库中是否有该手机号
        User.findOne({where:{phone}})
            .then(existingUser=>{
                console.log("查询User数据库中是否有该手机号",JSON.stringify(existingUser));
                if(existingUser)
                {
                    //存在该手机号，返回rejected的Promise
                    return Promise.reject({status:400,error:"该手机号已注册"})
                }
                //加密密码
                return bcrypt.hash(password,saltRounds)
            })
            .then(hash=>{
                //存储在User数据库中
                console.log("拿到加密密码的hash",hash);
                //插入到数据库中的字段
                const insertFields={
                    phone,
                    passwordHash: hash
                }
                return  User.create(insertFields)
                    .then((newUser)=>{
                        console.log("插入到User数据库后成功!!!",JSON.stringify(newUser));
                        //负载
                        const payload={
                            phone,
                            id:newUser.id
                        };
                        //生成token
                        const token=jwt.sign(payload,secretKey,{expiresIn: '1h'});
                        res.status(201).json({message:`该手机号${phone}注册成功`,token});
                    })
                    .catch(err=>{
                        console.log("插入到User数据库失败！！！！",err);
                        switch (err.name)
                        {
                            // 唯一约束错误：如果尝试插入的数据违反了数据库表中的唯一约束（例如，尝试插入的用户名已经存在于数据库中），则数据库会拒绝插入并返回唯一约束错误。
                            case "SequelizeUniqueConstraintError":
                                return Promise.reject({status:400,error:"该手机号已注册，违反了唯一约束"})
                        }
                        return Promise.reject(err);
                    })
            })
            .catch(err=>{
                // 捕获错误并处理
                console.log("// 捕获错误并处理",err);
                res.status(err.status).json({error:err.error});
            })
    }
    catch (err)
    {
        console.log("// try catch中catch，err:",err);
        res.status(err.status || 500).json({ error: err.error } || "服务器内部发生错误");
    }
}
