import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import foodRoutes from './foodRoutes.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Create HTTP server and Socket.io
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'Social Platform API with Food Donation System is running!', 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    features: ['User Management', 'Food Donations', 'Real-time Chat', 'Notifications']
  });
});
app.use('/api/food', foodRoutes);

// MongoDB Connection
const connectDB = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    console.log('Connection string:', process.env.MONGODB_URI || 'mongodb://localhost:27017/social-platform');
    
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/social-platform', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// User Schemas
const IndividualSchema = new mongoose.Schema({
  clerkUserId: { type: String, required: true, unique: true },
  fullName: { type: String, required: true },
  phoneNumber: { type: String },
  age: { type: Number, required: true },
  occupation: { type: String, required: true },
  location: { type: String, required: true },
  skills: { type: String, required: true },
  interests: { type: String, required: true },
  availability: { type: String, required: true },
  previousVolunteering: { type: String },
  preferredCauses: { type: String, required: true },
  personalMotivation: { type: String, required: true },
  education: { type: String },
  languages: { type: String },
  goals: { type: String },
  description: { type: String },
  userType: { type: String, default: 'individual' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const NGOSchema = new mongoose.Schema({
  clerkUserId: { type: String, required: true, unique: true },
  organizationName: { type: String, required: true },
  registrationNumber: { type: String, required: true },
  phoneNumber: { type: String },
  foundedYear: { type: Number, required: true },
  focusAreas: { type: String, required: true },
  location: { type: String, required: true },
  teamSize: { type: Number, required: true },
  contactPerson: { type: String, required: true },
  website: { type: String },
  currentProjects: { type: String, required: true },
  collaborationGoals: { type: String, required: true },
  missionStatement: { type: String },
  achievements: { type: String },
  fundingNeeds: { type: String },
  description: { type: String },
  userType: { type: String, default: 'ngo' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const SocialWorkerSchema = new mongoose.Schema({
  clerkUserId: { type: String, required: true, unique: true },
  fullName: { type: String, required: true },
  phoneNumber: { type: String },
  experience: { type: Number, required: true },
  education: { type: String, required: true },
  specialization: { type: String, required: true },
  currentEmployer: { type: String },
  licenseCertification: { type: String, required: true },
  workingAreas: { type: String, required: true },
  languages: { type: String, required: true },
  availability: { type: String, required: true },
  motivation: { type: String, required: true },
  certifications: { type: String },
  caseExperience: { type: String },
  professionalGoals: { type: String },
  description: { type: String },
  userType: { type: String, default: 'social-worker' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Food Donation Schemas
const FoodListingSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  coordinates: {
    latitude: { type: Number },
    longitude: { type: Number }
  },
  donor: { type: String, required: true },
  donorId: { type: String, required: true },
  donorType: { type: String, enum: ['individual', 'ngo', 'social-worker', 'restaurant', 'store'], required: true },
  quantity: { type: String, required: true },
  expiryTime: { type: String, required: true },
  exactExpiryDate: { type: Date },
  foodType: { type: String, enum: ['fresh', 'cooked', 'packaged'], required: true },
  dietaryInfo: {
    vegetarian: { type: Boolean, default: false },
    vegan: { type: Boolean, default: false },
    glutenFree: { type: Boolean, default: false },
    nutFree: { type: Boolean, default: false }
  },
  status: { type: String, enum: ['available', 'reserved', 'claimed', 'expired'], default: 'available' },
  images: [{ type: String }],
  contactInfo: {
    phone: { type: String },
    email: { type: String },
    preferredContact: { type: String, enum: ['phone', 'email', 'chat'], default: 'chat' }
  },
  pickupInstructions: { type: String },
  servings: { type: Number },
  tags: [{ type: String }],
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const FoodClaimSchema = new mongoose.Schema({
  foodListingId: { type: mongoose.Schema.Types.ObjectId, ref: 'FoodListing', required: true },
  claimedBy: { type: String, required: true },
  claimerName: { type: String, required: true },
  claimerType: { type: String, enum: ['individual', 'ngo', 'social-worker'], required: true },
  claimType: { type: String, enum: ['reserved', 'claimed'], required: true },
  estimatedPickupTime: { type: Date },
  actualPickupTime: { type: Date },
  notes: { type: String },
  status: { type: String, enum: ['pending', 'confirmed', 'picked-up', 'cancelled'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const ChatMessageSchema = new mongoose.Schema({
  foodListingId: { type: mongoose.Schema.Types.ObjectId, ref: 'FoodListing', required: true },
  senderId: { type: String, required: true },
  senderName: { type: String, required: true },
  senderType: { type: String, enum: ['donor', 'recipient'], required: true },
  message: { type: String, required: true },
  messageType: { type: String, enum: ['text', 'image', 'location'], default: 'text' },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const NotificationSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['new-food', 'food-claimed', 'food-expired', 'message', 'system'], required: true },
  relatedId: { type: String },
  isRead: { type: Boolean, default: false },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  createdAt: { type: Date, default: Date.now }
});

// Models
const Individual = mongoose.model('Individual', IndividualSchema);
const NGO = mongoose.model('NGO', NGOSchema);
const SocialWorker = mongoose.model('SocialWorker', SocialWorkerSchema);
const FoodListing = mongoose.model('FoodListing', FoodListingSchema);
const FoodClaim = mongoose.model('FoodClaim', FoodClaimSchema);
const ChatMessage = mongoose.model('ChatMessage', ChatMessageSchema);
const Notification = mongoose.model('Notification', NotificationSchema);

// Helper Functions
const getUserByClerkId = async (clerkUserId) => {
  try {
    let user = await Individual.findOne({ clerkUserId });
    if (user) return { ...user.toObject(), userType: 'individual' };
    
    user = await NGO.findOne({ clerkUserId });
    if (user) return { ...user.toObject(), userType: 'ngo' };
    
    user = await SocialWorker.findOne({ clerkUserId });
    if (user) return { ...user.toObject(), userType: 'social-worker' };
    
    return null;
  } catch (error) {
    throw error;
  }
};

const createNotification = async (userId, title, message, type, relatedId = null) => {
  try {
    const notification = new Notification({
      userId,
      title,
      message,
      type,
      relatedId
    });
    await notification.save();
    io.to(`user_${userId}`).emit('new-notification', notification);
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

const updateFoodStatus = async (foodId, newStatus, clerkUserId = null) => {
  try {
    const food = await FoodListing.findByIdAndUpdate(
      foodId,
      { status: newStatus, updatedAt: new Date() },
      { new: true }
    );
    
    if (food) {
      io.emit('food-status-updated', { foodId, newStatus, food });
      if (clerkUserId && clerkUserId !== food.donorId) {
        await createNotification(
          food.donorId,
          'Food Status Updated',
          `Your food listing "${food.title}" is now ${newStatus}`,
          'food-claimed',
          foodId
        );
      }
    }
    return food;
  } catch (error) {
    console.error('Error updating food status:', error);
    throw error;
  }
};

// Socket.io
io.on('connection', (socket) => {
  console.log(`👤 User connected: ${socket.id}`);
  
  socket.on('join-user-room', (clerkUserId) => {
    socket.join(`user_${clerkUserId}`);
    console.log(`👤 User ${clerkUserId} joined their room`);
  });
  
  socket.on('join-food-room', (foodId) => {
    socket.join(`food_${foodId}`);
    console.log(`🍽️ User joined food room: ${foodId}`);
  });
  
  socket.on('typing', (data) => {
    socket.to(`food_${data.foodId}`).emit('user-typing', {
      userId: data.userId,
      userName: data.userName,
      isTyping: data.isTyping
    });
  });
  
  socket.on('share-location', (data) => {
    socket.to(`food_${data.foodId}`).emit('location-shared', {
      userId: data.userId,
      userName: data.userName,
      latitude: data.latitude,
      longitude: data.longitude
    });
  });
  
  socket.on('disconnect', () => {
    console.log(`👤 User disconnected: ${socket.id}`);
  });
});

// User Routes
app.get('/api/user/:clerkUserId', async (req, res) => {
  try {
    const { clerkUserId } = req.params;
    if (!clerkUserId) {
      return res.status(400).json({ success: false, message: 'Clerk User ID is required' });
    }
    const user = await getUserByClerkId(clerkUserId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ success: false, message: 'Error fetching user data', error: error.message });
  }
});

app.post('/api/register/individual', async (req, res) => {
  try {
    const { clerkUserId, ...individualData } = req.body;
    if (!clerkUserId) {
      return res.status(400).json({ success: false, message: 'Clerk User ID is required' });
    }
    const existingUser = await getUserByClerkId(clerkUserId);
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'User already registered' });
    }
    const individual = new Individual({ clerkUserId, ...individualData });
    await individual.save();
    res.status(201).json({ success: true, message: 'Individual registered successfully', data: individual });
  } catch (error) {
    console.error('Error registering individual:', error);
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'User already registered' });
    }
    res.status(500).json({ success: false, message: 'Error registering individual', error: error.message });
  }
});

app.post('/api/register/ngo', async (req, res) => {
  try {
    const { clerkUserId, ...ngoData } = req.body;
    if (!clerkUserId) {
      return res.status(400).json({ success: false, message: 'Clerk User ID is required' });
    }
    const existingUser = await getUserByClerkId(clerkUserId);
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'User already registered' });
    }
    const ngo = new NGO({ clerkUserId, ...ngoData });
    await ngo.save();
    res.status(201).json({ success: true, message: 'NGO registered successfully', data: ngo });
  } catch (error) {
    console.error('Error registering NGO:', error);
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'User already registered' });
    }
    res.status(500).json({ success: false, message: 'Error registering NGO', error: error.message });
  }
});

app.post('/api/register/social-worker', async (req, res) => {
  try {
    const { clerkUserId, ...socialWorkerData } = req.body;
    if (!clerkUserId) {
      return res.status(400).json({ success: false, message: 'Clerk User ID is required' });
    }
    const existingUser = await getUserByClerkId(clerkUserId);
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'User already registered' });
    }
    const socialWorker = new SocialWorker({ clerkUserId, ...socialWorkerData });
    await socialWorker.save();
    res.status(201).json({ success: true, message: 'Social Worker registered successfully', data: socialWorker });
  } catch (error) {
    console.error('Error registering social worker:', error);
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'User already registered' });
    }
    res.status(500).json({ success: false, message: 'Error registering social worker', error: error.message });
  }
});

app.put('/api/update/individual', async (req, res) => {
  try {
    const { clerkUserId, ...updateData } = req.body;
    if (!clerkUserId) {
      return res.status(400).json({ success: false, message: 'Clerk User ID is required' });
    }
    const individual = await Individual.findOneAndUpdate(
      { clerkUserId },
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    if (!individual) {
      return res.status(404).json({ success: false, message: 'Individual not found' });
    }
    res.json({ success: true, message: 'Individual profile updated successfully', data: individual });
  } catch (error) {
    console.error('Error updating individual:', error);
    res.status(500).json({ success: false, message: 'Error updating individual profile', error: error.message });
  }
});

app.put('/api/update/ngo', async (req, res) => {
  try {
    const { clerkUserId, ...updateData } = req.body;
    if (!clerkUserId) {
      return res.status(400).json({ success: false, message: 'Clerk User ID is required' });
    }
    const ngo = await NGO.findOneAndUpdate(
      { clerkUserId },
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    if (!ngo) {
      return res.status(404).json({ success: false, message: 'NGO not found' });
    }
    res.json({ success: true, message: 'NGO profile updated successfully', data: ngo });
  } catch (error) {
    console.error('Error updating NGO:', error);
    res.status(500).json({ success: false, message: 'Error updating NGO profile', error: error.message });
  }
});

app.put('/api/update/social-worker', async (req, res) => {
  try {
    const { clerkUserId, ...updateData } = req.body;
    if (!clerkUserId) {
      return res.status(400).json({ success: false, message: 'Clerk User ID is required' });
    }
    const socialWorker = await SocialWorker.findOneAndUpdate(
      { clerkUserId },
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    if (!socialWorker) {
      return res.status(404).json({ success: false, message: 'Social Worker not found' });
    }
    res.json({ success: true, message: 'Social Worker profile updated successfully', data: socialWorker });
  } catch (error) {
    console.error('Error updating social worker:', error);
    res.status(500).json({ success: false, message: 'Error updating social worker profile', error: error.message });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const individuals = await Individual.find().select('-__v');
    const ngos = await NGO.find().select('-__v');
    const socialWorkers = await SocialWorker.find().select('-__v');
    res.json({
      success: true,
      data: {
        individuals: individuals.length,
        ngos: ngos.length,
        socialWorkers: socialWorkers.length,
        total: individuals.length + ngos.length + socialWorkers.length,
        users: [
          ...individuals.map(user => ({ ...user.toObject(), userType: 'individual' })),
          ...ngos.map(user => ({ ...user.toObject(), userType: 'ngo' })),
          ...socialWorkers.map(user => ({ ...user.toObject(), userType: 'social-worker' }))
        ]
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, message: 'Error fetching users', error: error.message });
  }
});

// Food Donation Routes
app.get('/api/food/listings', async (req, res) => {
  try {
    const { status, foodType, location, priority, search, vegetarian, vegan, limit = 20, page = 1, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    const filter = { isActive: true };
    if (status) filter.status = status;
    if (foodType) filter.foodType = foodType;
    if (location) filter.location = { $regex: location, $options: 'i' };
    if (priority) filter.priority = priority;
    if (vegetarian === 'true') filter['dietaryInfo.vegetarian'] = true;
    if (vegan === 'true') filter['dietaryInfo.vegan'] = true;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { donor: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortObj = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };
    const listings = await FoodListing.find(filter).sort(sortObj).limit(parseInt(limit)).skip(skip);
    const total = await FoodListing.countDocuments(filter);
    res.json({ success: true, data: { listings, pagination: { current: parseInt(page), total: Math.ceil(total / parseInt(limit)), count: listings.length, totalListings: total } } });
  } catch (error) {
    console.error('Error fetching food listings:', error);
    res.status(500).json({ success: false, message: 'Error fetching food listings', error: error.message });
  }
});

app.get('/api/food/listings/:id', async (req, res) => {
  try {
    const listing = await FoodListing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Food listing not found' });
    }
    res.json({ success: true, data: listing });
  } catch (error) {
    console.error('Error fetching food listing:', error);
    res.status(500).json({ success: false, message: 'Error fetching food listing', error: error.message });
  }
});

app.post('/api/food/listings', async (req, res) => {
  try {
    const { clerkUserId, ...listingData } = req.body;
    if (!clerkUserId) {
      return res.status(400).json({ success: false, message: 'User authentication required' });
    }
    const user = await getUserByClerkId(clerkUserId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const foodListing = new FoodListing({
      ...listingData,
      donorId: clerkUserId,
      donorType: user.userType,
      donor: user.fullName || user.organizationName || user.contactPerson
    });
    await foodListing.save();
    io.emit('new-food-listing', foodListing);
    res.status(201).json({ success: true, message: 'Food listing created successfully', data: foodListing });
  } catch (error) {
    console.error('Error creating food listing:', error);
    res.status(500).json({ success: false, message: 'Error creating food listing', error: error.message });
  }
});

app.put('/api/food/listings/:id', async (req, res) => {
  try {
    const { clerkUserId, ...updateData } = req.body;
    const listing = await FoodListing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Food listing not found' });
    }
    if (listing.donorId !== clerkUserId) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this listing' });
    }
    const updatedListing = await FoodListing.findByIdAndUpdate(req.params.id, { ...updateData, updatedAt: new Date() }, { new: true });
    io.emit('food-listing-updated', updatedListing);
    res.json({ success: true, message: 'Food listing updated successfully', data: updatedListing });
  } catch (error) {
    console.error('Error updating food listing:', error);
    res.status(500).json({ success: false, message: 'Error updating food listing', error: error.message });
  }
});

app.delete('/api/food/listings/:id', async (req, res) => {
  try {
    const { clerkUserId } = req.body;
    const listing = await FoodListing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Food listing not found' });
    }
    if (listing.donorId !== clerkUserId) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this listing' });
    }
    await FoodListing.findByIdAndUpdate(req.params.id, { isActive: false });
    io.emit('food-listing-deleted', { id: req.params.id });
    res.json({ success: true, message: 'Food listing deleted successfully' });
  } catch (error) {
    console.error('Error deleting food listing:', error);
    res.status(500).json({ success: false, message: 'Error deleting food listing', error: error.message });
  }
});

app.post('/api/food/reserve/:id', async (req, res) => {
  try {
    const { clerkUserId, estimatedPickupTime, notes } = req.body;
    const listing = await FoodListing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Food listing not found' });
    }
    if (listing.status !== 'available') {
      return res.status(400).json({ success: false, message: 'Food is no longer available' });
    }
    const user = await getUserByClerkId(clerkUserId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const claim = new FoodClaim({
      foodListingId: req.params.id,
      claimedBy: clerkUserId,
      claimerName: user.fullName || user.organizationName,
      claimerType: user.userType,
      claimType: 'reserved',
      estimatedPickupTime: estimatedPickupTime ? new Date(estimatedPickupTime) : null,
      notes
    });
    await claim.save();
    await updateFoodStatus(req.params.id, 'reserved', clerkUserId);
    res.json({ success: true, message: 'Food reserved successfully', data: claim });
  } catch (error) {
    console.error('Error reserving food:', error);
    res.status(500).json({ success: false, message: 'Error reserving food', error: error.message });
  }
});

app.post('/api/food/claim/:id', async (req, res) => {
  try {
    const { clerkUserId, notes } = req.body;
    const listing = await FoodListing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Food listing not found' });
    }
    if (listing.status === 'claimed') {
      return res.status(400).json({ success: false, message: 'Food has already been claimed' });
    }
    const user = await getUserByClerkId(clerkUserId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    let claim = await FoodClaim.findOne({ foodListingId: req.params.id, claimedBy: clerkUserId });
    if (claim) {
      claim.claimType = 'claimed';
      claim.actualPickupTime = new Date();
      claim.status = 'picked-up';
      claim.notes = notes;
      await claim.save();
    } else {
      claim = new FoodClaim({
        foodListingId: req.params.id,
        claimedBy: clerkUserId,
        claimerName: user.fullName || user.organizationName,
        claimerType: user.userType,
        claimType: 'claimed',
        actualPickupTime: new Date(),
        status: 'picked-up',
        notes
      });
      await claim.save();
    }
    await updateFoodStatus(req.params.id, 'claimed', clerkUserId);
    res.json({ success: true, message: 'Food claimed successfully', data: claim });
  } catch (error) {
    console.error('Error claiming food:', error);
    res.status(500).json({ success: false, message: 'Error claiming food', error: error.message });
  }
});

app.delete('/api/food/unclaim/:id', async (req, res) => {
  try {
    const { clerkUserId } = req.body;
    const claim = await FoodClaim.findOne({ foodListingId: req.params.id, claimedBy: clerkUserId, status: { $in: ['pending', 'confirmed'] } });
    if (!claim) {
      return res.status(404).json({ success: false, message: 'No active claim found' });
    }
    claim.status = 'cancelled';
    await claim.save();
    await updateFoodStatus(req.params.id, 'available', clerkUserId);
    res.json({ success: true, message: 'Claim cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling claim:', error);
    res.status(500).json({ success: false, message: 'Error cancelling claim', error: error.message });
  }
});

app.get('/api/food/my-donations/:clerkUserId', async (req, res) => {
  try {
    const { clerkUserId } = req.params;
    const { status, limit = 20, page = 1 } = req.query;
    const filter = { donorId: clerkUserId, isActive: true };
    if (status) filter.status = status;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const donations = await FoodListing.find(filter).sort({ createdAt: -1 }).limit(parseInt(limit)).skip(skip);
    const total = await FoodListing.countDocuments(filter);
    res.json({ success: true, data: { donations, pagination: { current: parseInt(page), total: Math.ceil(total / parseInt(limit)), count: donations.length, totalDonations: total } } });
  } catch (error) {
    console.error('Error fetching user donations:', error);
    res.status(500).json({ success: false, message: 'Error fetching donations', error: error.message });
  }
});

app.get('/api/food/my-claims/:clerkUserId', async (req, res) => {
  try {
    const { clerkUserId } = req.params;
    const { status, limit = 20, page = 1 } = req.query;
    const filter = { claimedBy: clerkUserId };
    if (status) filter.status = status;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const claims = await FoodClaim.find(filter).populate('foodListingId').sort({ createdAt: -1 }).limit(parseInt(limit)).skip(skip);
    const total = await FoodClaim.countDocuments(filter);
    res.json({ success: true, data: { claims, pagination: { current: parseInt(page), total: Math.ceil(total / parseInt(limit)), count: claims.length, totalClaims: total } } });
  } catch (error) {
    console.error('Error fetching user claims:', error);
    res.status(500).json({ success: false, message: 'Error fetching claims', error: error.message });
  }
});

app.post('/api/food/nearby', async (req, res) => {
  try {
    const { latitude, longitude, radiusKm = 10, limit = 20 } = req.body;
    if (!latitude || !longitude) {
      return res.status(400).json({ success: false, message: 'Latitude and longitude are required' });
    }
    const radiusRadians = radiusKm / 6371;
    const nearbyListings = await FoodListing.find({
      isActive: true,
      status: 'available',
      'coordinates.latitude': { $exists: true },
      'coordinates.longitude': { $exists: true },
      coordinates: { $geoWithin: { $centerSphere: [[longitude, latitude], radiusRadians] } }
    }).limit(parseInt(limit)).sort({ createdAt: -1 });
    res.json({ success: true, data: { listings: nearbyListings, center: { latitude, longitude }, radius: radiusKm, count: nearbyListings.length } });
  } catch (error) {
    console.error('Error fetching nearby listings:', error);
    res.status(500).json({ success: false, message: 'Error fetching nearby listings', error: error.message });
  }
});

// Chat Routes
app.get('/api/chat/:foodId', async (req, res) => {
  try {
    const { foodId } = req.params;
    const { limit = 50, page = 1 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const messages = await ChatMessage.find({ foodListingId: foodId }).sort({ createdAt: 1 }).limit(parseInt(limit)).skip(skip);
    const total = await ChatMessage.countDocuments({ foodListingId: foodId });
    res.json({ success: true, data: { messages, pagination: { current: parseInt(page), total: Math.ceil(total / parseInt(limit)), count: messages.length, totalMessages: total } } });
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    res.status(500).json({ success: false, message: 'Error fetching chat messages', error: error.message });
  }
});

app.post('/api/chat/:foodId', async (req, res) => {
  try {
    const { foodId } = req.params;
    const { clerkUserId, message, messageType = 'text' } = req.body;
    if (!clerkUserId || !message) {
      return res.status(400).json({ success: false, message: 'User ID and message are required' });
    }
    const user = await getUserByClerkId(clerkUserId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const foodListing = await FoodListing.findById(foodId);
    if (!foodListing) {
      return res.status(404).json({ success: false, message: 'Food listing not found' });
    }
    const senderType = foodListing.donorId === clerkUserId ? 'donor' : 'recipient';
    const senderName = user.fullName || user.organizationName || user.contactPerson;
    const chatMessage = new ChatMessage({ foodListingId: foodId, senderId: clerkUserId, senderName, senderType, message, messageType });
    await chatMessage.save();
    io.to(`food_${foodId}`).emit('new-message', chatMessage);
    const recipientId = senderType === 'donor' ? (await FoodClaim.findOne({ foodListingId: foodId }))?.claimedBy : foodListing.donorId;
    if (recipientId && recipientId !== clerkUserId) {
      await createNotification(
        recipientId,
        'New Message',
        `${senderName}: ${message.length > 50 ? message.substring(0, 50) + '...' : message}`,
        'message',
        foodId
      );
    }
    res.status(201).json({ success: true, message: 'Message sent successfully', data: chatMessage });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ success: false, message: 'Error sending message', error: error.message });
  }
});

app.put('/api/chat/:foodId/read', async (req, res) => {
  try {
    const { foodId } = req.params;
    const { clerkUserId } = req.body;
    await ChatMessage.updateMany({ foodListingId: foodId, senderId: { $ne: clerkUserId }, isRead: false }, { isRead: true });
    res.json({ success: true, message: 'Messages marked as read' });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ success: false, message: 'Error marking messages as read', error: error.message });
  }
});

// Notification Routes
app.get('/api/notifications/:clerkUserId', async (req, res) => {
  try {
    const { clerkUserId } = req.params;
    const { isRead, type, limit = 20, page = 1 } = req.query;
    const filter = { userId: clerkUserId };
    if (isRead !== undefined) filter.isRead = isRead === 'true';
    if (type) filter.type = type;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const notifications = await Notification.find(filter).sort({ createdAt: -1 }).limit(parseInt(limit)).skip(skip);
    const total = await Notification.countDocuments(filter);
    const unreadCount = await Notification.countDocuments({ userId: clerkUserId, isRead: false });
    res.json({ success: true, data: { notifications, unreadCount, pagination: { current: parseInt(page), total: Math.ceil(total / parseInt(limit)), count: notifications.length, totalNotifications: total } } });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ success: false, message: 'Error fetching notifications', error: error.message });
  }
});

app.put('/api/notifications/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    const { clerkUserId } = req.body;
    const notification = await Notification.findOneAndUpdate({ _id: id, userId: clerkUserId }, { isRead: true }, { new: true });
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    res.json({ success: true, message: 'Notification marked as read', data: notification });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ success: false, message: 'Error marking notification as read', error: error.message });
  }
});

app.put('/api/notifications/:clerkUserId/read-all', async (req, res) => {
  try {
    const { clerkUserId } = req.params;
    await Notification.updateMany({ userId: clerkUserId, isRead: false }, { isRead: true });
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ success: false, message: 'Error marking notifications as read', error: error.message });
  }
});

// Statistics Route
app.get('/api/food/stats', async (req, res) => {
  try {
    const { period = '30d', clerkUserId } = req.query;
    const now = new Date();
    let startDate;
    switch(period) {
      case '7d': startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); break;
      case '30d': startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); break;
      case '90d': startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000); break;
      default: startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
    const filter = { createdAt: { $gte: startDate } };
    if (clerkUserId) filter.donorId = clerkUserId;
    const stats = await Promise.all([
      FoodListing.countDocuments(filter),
      FoodListing.countDocuments({ ...filter, status: 'available' }),
      FoodListing.countDocuments({ ...filter, status: 'claimed' }),
      FoodListing.countDocuments({ ...filter, status: 'reserved' }),
      FoodListing.aggregate([{ $match: filter }, { $group: { _id: '$foodType', count: { $sum: 1 } } }]),
      FoodListing.aggregate([{ $match: filter }, { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } }, { $sort: { _id: 1 } }]),
      FoodListing.aggregate([{ $match: filter }, { $group: { _id: '$donor', count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 10 }])
    ]);
    res.json({ success: true, data: { period, summary: { totalListings: stats[0], availableListings: stats[1], claimedListings: stats[2], reservedListings: stats[3] }, foodTypeDistribution: stats[4], dailyListings: stats[5], topDonors: stats[6] } });
  } catch (error) {
    console.error('Error fetching food stats:', error);
    res.status(500).json({ success: false, message: 'Error fetching statistics', error: error.message });
  }
});

// Admin Route
app.get('/api/admin/food/listings', async (req, res) => {
  try {
    const { status, limit = 50, page = 1 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const listings = await FoodListing.find(filter).sort({ createdAt: -1 }).limit(parseInt(limit)).skip(skip);
    const total = await FoodListing.countDocuments(filter);
    res.json({ success: true, data: { listings, pagination: { current: parseInt(page), total: Math.ceil(total / parseInt(limit)), count: listings.length, totalListings: total } } });
  } catch (error) {
    console.error('Error fetching admin listings:', error);
    res.status(500).json({ success: false, message: 'Error fetching listings', error: error.message });
  }
});

// 404 Handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
    availableRoutes: [
      'GET /',
      'GET /api/user/:clerkUserId',
      'POST /api/register/individual',
      'POST /api/register/ngo',
      'POST /api/register/social-worker',
      'PUT /api/update/individual',
      'PUT /api/update/ngo',
      'PUT /api/update/social-worker',
      'GET /api/users',
      'GET /api/food/listings',
      'GET /api/food/listings/:id',
      'POST /api/food/listings',
      'PUT /api/food/listings/:id',
      'DELETE /api/food/listings/:id',
      'POST /api/food/reserve/:id',
      'POST /api/food/claim/:id',
      'DELETE /api/food/unclaim/:id',
      'GET /api/food/my-donations/:clerkUserId',
      'GET /api/food/my-claims/:clerkUserId',
      'POST /api/food/nearby',
      'GET /api/chat/:foodId',
      'POST /api/chat/:foodId',
      'PUT /api/chat/:foodId/read',
      'GET /api/notifications/:clerkUserId',
      'PUT /api/notifications/:id/read',
      'PUT /api/notifications/:clerkUserId/read-all',
      'GET /api/food/stats',
      'GET /api/admin/food/listings'
    ]
  });
});

// Global Error Handler
app.use((error, req, res, next) => {
  console.error('Global Error Handler:', error);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// Start Server
const startServer = async () => {
  try {
    await connectDB();
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📍 API Base URL: http://localhost:${PORT}`);
      console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
      console.log(`⚡ Socket.io enabled for real-time features`);
      console.log('📋 Available routes:');
      console.log('   USER MANAGEMENT:');
      console.log('   GET  /');
      console.log('   GET  /api/user/:clerkUserId');
      console.log('   POST /api/register/individual');
      console.log('   POST /api/register/ngo');
      console.log('   POST /api/register/social-worker');
      console.log('   PUT  /api/update/individual');
      console.log('   PUT  /api/update/ngo');
      console.log('   PUT  /api/update/social-worker');
      console.log('   GET  /api/users');
      console.log('\n   FOOD DONATIONS:');
      console.log('   GET  /api/food/listings');
      console.log('   POST /api/food/listings');
      console.log('   GET  /api/food/listings/:id');
      console.log('   PUT  /api/food/listings/:id');
      console.log('   DELETE /api/food/listings/:id');
      console.log('\n   CLAIMS & RESERVATIONS:');
      console.log('   POST /api/food/reserve/:id');
      console.log('   POST /api/food/claim/:id');
      console.log('   DELETE /api/food/unclaim/:id');
      console.log('\n   REAL-TIME FEATURES:');
      console.log('   GET  /api/chat/:foodId');
      console.log('   POST /api/chat/:foodId');
      console.log('   GET  /api/notifications/:clerkUserId');
      console.log('   Socket.io events: new-food-listing, food-status-updated, new-message');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🔄 Shutting down server...');
  await mongoose.connection.close();
  server.close(() => {
    console.log('✅ Server closed');
    console.log('✅ Database connection closed');
    process.exit(0);
  });
});

export default app;
