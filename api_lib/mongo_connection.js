import mongoose from 'mongoose'
import { getProjectSettings } from './utils.js';

export async function initMongoose() {
    const settings = await getProjectSettings()
    const MONGO_URI = settings.MONGO_URI
    if (MONGO_URI) {
        mongoose.connect(MONGO_URI)
            .then(() => console.log('Connected to MongoDB'))
            .catch(err => console.error('Error connecting to MongoDB', err));
    }
}