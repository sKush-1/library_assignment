import {Request, Response} from 'express';
import { User } from '../models/userModel';
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import {z} from 'zod';

export const register = async(req: Request, res: Response) => {
    try {
        const {email, username, password} = req.body;

        const userSchema = z.object({
            email: z.string().min(3).max(30),
            username: z.string().min(3).max(20),
            password: z.string().min(8).max(20)
        })

        userSchema.parse(req.body);

        const alreadyRegistered = await User.findOne({email});

        if(alreadyRegistered){
            return res.status(400).json({
                message: "User Already registered"
            })
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            email,
            username,
            password: hashedPassword,
        })
        return res.status(201).json({
            message: "User created",
            id: user._id,
        })
        
    } catch (error) {
        console.log(error);
        return res.status(201).json({
            message: "Failed to create user",
            error : error.issues[0].message || "Something went wrong"
        })
    }
}

export const login = async(req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const userSchema = z.object({
            email: z.string().min(3).max(30),
            password: z.string().min(8).max(20)
        })

        userSchema.parse(req.body);
    
        const user = await User.findOne({ email });
    
        if (!user) {
          return res.status(400).json({
            message: "Incorrect username or password",
            success: false,
          });
        }
    
        const isPasswordMatch = await bcrypt.compare(password, user.password);
    
        const tokenData = {
          userId: user._id,
        };
    
        const token = jwt.sign(tokenData, process.env.JWT_SECRET_KEY, {
          expiresIn: "1d",
        });
    
        return res
          .status(200)
          .cookie("token", token, {
            maxAge: 1 * 24 * 60 * 60 * 1000,
            httpOnly: true,
            sameSite: "none",
            secure: true,
          })
          .json({
            _id: user._id,
            username: user.username,
          });
      } catch (error) {
        console.log(error);
        return res.status(400).json({
          success: false,
          message: "Failed to login",
        });
      }
}

export const logout = (req: Request, res: Response) => {
    try {
      return res.status(200).cookie("token", "", { maxAge: 0 }).json({
        message: "logged successfully",
      });
    } catch (error) {
      return res.status(401).json({
        message: "Failed to logout"
      })
    }
  };
  
