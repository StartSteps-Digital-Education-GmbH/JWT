import jwt, { Secret, JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { SECRET_KEY } from "../config";

export interface CustomRequest extends Request {
  token: string | JwtPayload;
}

export const auth = (req: Request, res: Response, next: NextFunction) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) return res.status(401).send("Please authenticate");

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    (req as CustomRequest).token = decoded;
    next();
  } catch (err) {
    res.status(401).send("Invalid token");
  }
};
