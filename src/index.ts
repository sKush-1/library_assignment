import express from 'express';
import http from 'http';
import cors from 'cors'
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import connectDB from './config/db';
import dotenv from 'dotenv'
import userRoute from './routes/userRoute'
import booksRoute from './routes/booksRoute';

const app = express();

app.use(cors({
    credentials: true,
}));
app.use(compression());
app.use(cookieParser());
app.use(bodyParser.json());

dotenv.config();
const server = http.createServer(app);


app.use('/api/v1/users', userRoute);
app.use('/api/v1/books', booksRoute);

app.get('/', (req,res)=> {
    res.send("Welcome")
})


server.listen(8000, () => {
    console.log(`Server running on http://localhost:8000`);
})

connectDB();