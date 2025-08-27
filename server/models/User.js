// server/models/User.js - User model with fixed schema indexes
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  googleId: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  profilePicture: {
    type: String,
    default: null
  },
  userType: {
    type: String,
    enum: ['individual', 'ngo', 'social_worker'],
    default: null
  },
  profileCompleted: {
    type: Boolean,
    default: false
  },
  
  // Individual user profile
  individual: {
    phone: String,
    age: Number,
    occupation: String,
    address: String,
    bio: String,
    interests: [String],
    availability: String,
    skills: [String]
  },
  
  // NGO profile
  ngo: {
    organizationName: String,
    registrationNumber: String,
    phone: String,
    website: String,
    address: String,
    description: String,
    focusAreas: [String],
    establishedYear: Number,
    teamSize: Number,
    licenseDocument: String
  },
  
  // Social Worker profile
  socialWorker: {
    phone: String,
    qualification: String,
    experienceYears: Number,
    specialization: String,
    licenseNumber: String,
    organization: String,
    address: String,
    bio: String,
    certifications: [String]
  }
}, {
  timestamps: true
});

// Remove duplicate index definitions to fix the warnings
// The unique: true in the schema already creates indexes
// No need to add additional .index() calls

export default mongoose.model('User', userSchema);