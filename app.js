import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import apiRouter from './routes/api.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use('/api', apiRouter);

// connect to Mongo unless running tests (tests connect themselves)
if (process.env.NODE_ENV !== 'test') {
  const uri = "mongodb+srv://cavalcante1andre_db_user:7FeZAVCio47IvCQl@cluster0.0phdlop.mongodb.net/dogdb?appName=Cluster0";
  mongoose.connect(uri).then(() => {
    const port = process.env.PORT || 3000;
    app.listen(port, () => console.log(`✅ Server running on http://localhost:${port}`));
  }).catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
}

export default app;
