import mongoose from 'mongoose';

mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/googlebooks');

const db = mongoose.connection;

db.on('connecting', () => console.log('MongoDB: connecting...'));
db.on('connected', () => console.log('MongoDB: connected'));
db.on('open', () => console.log('MongoDB: connection open'));
db.on('error', (err) => console.error('MongoDB connection error:', err));
db.on('disconnected', () => console.log('MongoDB: disconnected'));


export default db;
