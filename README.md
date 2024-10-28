# JWT EXAMPLE
JWT and TypeScript with Express, following the structure and steps you've outlined. This example includes user registration, login, password hashing, token generation, and route protection.

### Project Setup

1. **Initialize a new TypeScript project**:
   ```bash
   mkdir jwt-auth-example
   cd jwt-auth-example
   npm init -y
   npm install express mongoose bcrypt jsonwebtoken dotenv @types/express @types/mongoose @types/bcrypt @types/jsonwebtoken typescript ts-node nodemon
   npx tsc --init
   ```

2. **Create the project structure**:
   ```
   jwt-auth-example/
   ├── src/
   │   ├── controllers/
   │   │   └── user.controller.ts
   │   ├── middleware/
   │   │   └── auth.ts
   │   ├── models/
   │   │   └── user.model.ts
   │   ├── routes/
   │   │   └── user.routes.ts
   │   ├── services/
   │   │   └── user.service.ts
   │   ├── utils/
   │   │   └── errors.util.ts
   │   ├── app.ts
   │   └── config.ts
   └── package.json
   ```

### Code Implementation

#### 1. **Configuration (config.ts)**

```typescript
import dotenv from 'dotenv';

dotenv.config();

export const SECRET_KEY = process.env.SECRET_KEY || 'your-secret-key-here';
export const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/jwt-auth-example';
```

#### 2. **User Model (models/user.model.ts)**

```typescript
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

export interface IUserDocument extends mongoose.Document {
    name: string;
    password: string;
}

const UserSchema = new mongoose.Schema<IUserDocument>({
    name: { type: String, unique: true },
    password: { type: String },
});

// Hash password before saving
UserSchema.pre('save', async function (next) {
    const user = this;
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8);
    }
    next();
});

const UserModel = mongoose.model<IUserDocument>('User', UserSchema);
export default UserModel;
```

#### 3. **User Service (services/user.service.ts)**

```typescript
import { DocumentDefinition } from 'mongoose';
import UserModel, { IUserDocument } from '../models/user.model';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { SECRET_KEY } from '../config';

export async function register(user: DocumentDefinition<IUserDocument>): Promise<void> {
    await UserModel.create(user);
}

export async function login(user: DocumentDefinition<IUserDocument>) {
    const foundUser = await UserModel.findOne({ name: user.name });
    if (!foundUser) throw new Error('User not found');

    const isMatch = await bcrypt.compare(user.password, foundUser.password);
    if (!isMatch) throw new Error('Invalid password');

    const token = jwt.sign({ _id: foundUser._id, name: foundUser.name }, SECRET_KEY, { expiresIn: '2d' });
    return { user: { _id: foundUser._id, name: foundUser.name }, token };
}
```

#### 4. **User Controller (controllers/user.controller.ts)**

```typescript
import { Request, Response } from 'express';
import * as userService from '../services/user.service';
import { getErrorMessage } from '../utils/errors.util';

export const registerOne = async (req: Request, res: Response) => {
    try {
        await userService.register(req.body);
        res.status(201).send('User registered successfully');
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
```

#### 5. **Error Utility (utils/errors.util.ts)**

```typescript
export function getErrorMessage(error: unknown) {
    if (error instanceof Error) return error.message;
    return String(error);
}
```

#### 6. **Authentication Middleware (middleware/auth.ts)**

```typescript
import jwt, { Secret, JwtPayload } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { SECRET_KEY } from '../config';

export interface CustomRequest extends Request {
    token: string | JwtPayload;
}

export const auth = (req: Request, res: Response, next: NextFunction) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).send('Please authenticate');

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        (req as CustomRequest).token = decoded;
        next();
    } catch (err) {
        res.status(401).send('Invalid token');
    }
};
```

#### 7. **User Routes (routes/user.routes.ts)**

```typescript
import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { auth } from '../middleware/auth';

const router = Router();

router.post('/register', userController.registerOne);
router.post('/login', userController.loginOne);
router.get('/protected', auth, (req, res) => {
    res.send('This is a protected route');
});

export default router;
```

#### 8. **Main Application (app.ts)**

```typescript
import express from 'express';
import mongoose from 'mongoose';
import userRoutes from './routes/user.routes';
import { MONGO_URI } from './config';

const app = express();
app.use(express.json());

mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

app.use('/api/users', userRoutes);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
```

### Running the Application

1. **Set up environment variables** in a `.env` file:
   ```
   SECRET_KEY=your-secret-key-here
   MONGO_URI=mongodb://localhost:27017/jwt-auth-example
   ```

2. **Run the application**:
   ```bash
   npx ts-node src/app.ts
   ```

### Testing the Application

You can use Postman or any API testing tool to test the following endpoints:

- **Register a user**: `POST /api/users/register` with body `{ "name": "John Doe", "password": "yourpassword" }`
- **Login a user**: `POST /api/users/login` with body `{ "name": "John Doe", "password": "yourpassword" }`
- **Access protected route**: `GET /api/users/protected` with `Authorization: Bearer <your_token>` in headers.
