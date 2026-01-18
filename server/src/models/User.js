import mongoose from 'mongoose';
import { roles } from '../config/roles.js';
import { languages } from '../config/languages.js';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: roles,
        default: 'buyer'
    },
    language: {
        type: String,
        enum: languages,
        default: 'en'
    },
    isVerified: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

const User = mongoose.model('User', userSchema);

export default User;
