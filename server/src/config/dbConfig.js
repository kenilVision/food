require('dotenv').config();
const mongoose = require('mongoose');

const dbURI = process.env.MONGODB_URL;

if (!dbURI) {
    console.error('MongoDB URI is missing in the .env file');
    process.exit(1); 
}

mongoose.connect(process.env.MONGODB_URL).then(() => {
    console.log('Database Connected!')
}).catch((err) => {
    console.log('MongoDB Connection Error', err.message);
});