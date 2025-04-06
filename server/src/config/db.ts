import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config(); 

const uri = process.env.DB_URI as string;

mongoose.connect(uri);

const connection = mongoose.connection;
connection.once('open', () => {
  console.log('MongoDB database connection established successfully');
});

connection.on('error', (error: any) => {
    console.log(`MongoDB connection error: ${error}`);
    });
