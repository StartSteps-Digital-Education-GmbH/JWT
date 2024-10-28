import { Request, Response } from "express";
import * as userService from "../services/user.service";
import { getErrorMessage } from "../utils/errors.util";

export const registerOne = async (req: Request, res: Response) => {
  try {
    await userService.register(req.body);
    res.status(201).send("User registered successfully");
  } catch (error) {
    res.status(500).send(getErrorMessage(error));
  }
};

export const loginOne = async (req: Request, res: Response) => {
  try {
    const foundUser = await userService.login(req.body);
    res.status(200).send(foundUser);
  } catch (error) {
    res.status(500).send(getErrorMessage(error));
  }
};
