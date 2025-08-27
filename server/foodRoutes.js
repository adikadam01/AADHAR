import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();

// Get all donations
router.get('/', async (req, res) => {
  try {
    const FoodListing = mongoose.model('FoodListing');
    const donations = await FoodListing.find({ isActive: true });
    res.json({ success: true, data: donations });
  } catch (error) {
    console.error('Error fetching donations:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Submit a new donation (for Home.jsx form)
router.post('/submit', async (req, res) => {
  try {
    const { donorName, foodType, quantity, contact, clerkUserId } = req.body;
    if (!donorName || !foodType || !quantity || !contact || !clerkUserId) {
      return res.status(400).json({ success: false, message: 'All fields and clerkUserId are required' });
    }
    const user = await mongoose.model('Individual').findOne({ clerkUserId }) ||
                await mongoose.model('NGO').findOne({ clerkUserId }) ||
                await mongoose.model('SocialWorker').findOne({ clerkUserId });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const FoodListing = mongoose.model('FoodListing');
    const donation = new FoodListing({
      title: `${donorName}'s ${foodType} Donation`,
      description: `Donation of ${quantity} kg ${foodType}`,
      location: user.location || 'Unknown',
      donor: donorName,
      donorId: clerkUserId,
      donorType: user.userType || 'individual',
      quantity: `${quantity} kg`,
      expiryTime: '24 hours',
      foodType: ['fresh', 'cooked', 'packaged'].includes(foodType.toLowerCase()) ? foodType.toLowerCase() : 'packaged',
      contactInfo: { email: contact },
      status: 'available',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    await donation.save();
    res.status(201).json({ success: true, message: 'Donation submitted successfully', data: donation });
  } catch (error) {
    console.error('Error submitting donation:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

export default router;