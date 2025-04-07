import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config(); 
const uri =
    process.env.NODE_ENV === 'production'
        ? process.env.MONGO_PROD_DB
        : process.env.NODE_ENV === 'test'
            ? process.env.MONGO_TEST_DB
            : process.env.MONGODB_DEV_URI



if (!uri) {
    throw new Error('MongoDB connection URI is not defined');
}
mongoose.connect(uri);

const connection = mongoose.connection;
connection.once('open', () => {
  console.log('MongoDB database connection established successfully ✅');
});

connection.on('error', (error: any) => {
    console.log(`MongoDB connection error: ${error}`);
    });
