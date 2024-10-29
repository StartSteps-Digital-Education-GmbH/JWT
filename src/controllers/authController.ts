import { Request, Response } from 'express';
import { User } from '../models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from 'dotenv';
// import {  } from ' ';  import by name: the name should be correct
// import jwt from 'jsonwebtoken'; import by default: give any name

config(); // Loads environment variables to the process

const JWT_SECRET = process.env.JWT_SECRET as string;

export const signUp = async (req: Request, res: Response) => {
    const { username, password } = req.body;

    try {
        // hash the password using bcryptjs
        const hashedPassword = await bcrypt.hash(password, 10); 
        // create a new user
        const user = new User({ username, password: hashedPassword });
        // save the user to the database
        await user.save();
        res.status(201).json({ message: "User created!" });
    } catch (error) {
        res.status(500).json({ message: "Error creating user", error });
    }

};


export const signIn = async (req: Request, res: Response) => {
    const { username, password } = req.body;
    try {
        // find user in the database with username
        const user = await User.findOne({ username });
        if (!user) {
          // return res. is wrong
          res.status(401).json({ message: "Invalid credentials" });
          return; // terminate the function
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          // return res. is wrong
          res.status(401).json({ message: "Invalid credentials" });
          return; // terminate the function
        }
        // create json web token 
        const token = jwt.sign(
            { userId: user._id }, JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ token });
      
    } catch (error) {
        res.status(500).json({ message: "server error", error });
       
    }
};