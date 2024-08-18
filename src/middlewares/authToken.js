import jwt from "jsonwebtoken";
import 'dotenv/config'
const secretKey = process.env.SECRET_KEY;//密钥
// 中间件---校验token
export const authToken = (req, res, next) => {
    // get token from headers
    let token =req.headers['authorization'].split(" ").pop();
    if (token)
    {
        // 校验token
        jwt.verify(token, secretKey, (err, user) => {
            if (err)
            {
                // if errors send Forbidden (403)
                return res.sendStatus(403);
            }

            // If token is successfully verified, we can send the autorized data
            req.user = user;
            next();
        });
    }
    else
    {
        // If there is no token

        res.sendStatus(401);
    }
};
