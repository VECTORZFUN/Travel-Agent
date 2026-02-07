// backend/routes/rewards.js
const express = require('express');
const router = express.Router();

// Get user's reward points balance and history
router.get('/balance/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const rewardsData = await getRewardsBalance(userId);
    
    res.json(rewardsData);

  } catch (error) {
    console.error('Rewards Balance Error:', error);
    res.status(500).json({ error: 'Failed to fetch rewards balance' });
  }
});

// Get rewards transaction history
router.get('/history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    
    const history = await getRewardsHistory(userId, page, limit);
    
    res.json(history);

  } catch (error) {
    console.error('Rewards History Error:', error);
    res.status(500).json({ error: 'Failed to fetch rewards history' });
  }
});

// Redeem reward points
router.post('/redeem', async (req, res) => {
  try {
    const { userId, points, rewardType, bookingId } = req.body;

    if (!userId || !points || !rewardType) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const redemption = await redeemPoints({
      userId,
      points,
      rewardType,
      bookingId
    });

    res.json({
      success: true,
      redemption,
      newBalance: redemption.newBalance,
      timestamp: new Date()
    });

  } catch (error) {
    console.error('Points Redemption Error:', error);
    res.status(500).json({ error: error.message || 'Failed to redeem points' });
  }
});

// Get reward redemption options
router.get('/redemption-options', async (req, res) => {
  try {
    const options = getRedemptionOptions();
    res.json(options);
  } catch (error) {
    console.error('Redemption Options Error:', error);
    res.status(500).json({ error: 'Failed to fetch redemption options' });
  }
});

// Calculate points earned for a potential booking
router.post('/calculate', async (req, res) => {
  try {
    const { bookingType, amount, category } = req.body;

    const calculation = calculatePointsEarned(bookingType, amount, category);

    res.json(calculation);

  } catch (error) {
    console.error('Points Calculation Error:', error);
    res.status(500).json({ error: 'Failed to calculate points' });
  }
});

// Get tier status and benefits
router.get('/tier/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const tierStatus = await getTierStatus(userId);
    
    res.json(tierStatus);

  } catch (error) {
    console.error('Tier Status Error:', error);
    res.status(500).json({ error: 'Failed to fetch tier status' });
  }
});

// Transfer points to another user
router.post('/transfer', async (req, res) => {
  try {
    const { fromUserId, toUserId, points } = req.body;

    if (!fromUserId || !toUserId || !points) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    if (points < 1000) {
      return res.status(400).json({ error: 'Minimum transfer amount is 1,000 points' });
    }

    const transfer = await transferPoints(fromUserId, toUserId, points);

    res.json({
      success: true,
      transfer,
      timestamp: new Date()
    });

  } catch (error) {
    console.error('Points Transfer Error:', error);
    res.status(500).json({ error: error.message || 'Failed to transfer points' });
  }
});

// Helper Functions

async function getRewardsBalance(userId) {
  // Fetch from database
  return {
    userId,
    currentBalance: 12450,
    lifetimeEarned: 45680,
    lifetimeRedeemed: 33230,
    tier: 'Gold',
    tierProgress: {
      current: 12450,
      nextTier: 'Platinum',
      pointsNeeded: 7550,
      percentage: 62
    },
    expiringPoints: {
      amount: 2500,
      expiryDate: '2026-06-30'
    },
    lastUpdated: new Date()
  };
}

async function getRewardsHistory(userId, page, limit) {
  // Fetch transaction history from database
  const transactions = [
    {
      id: 'txn_001',
      type: 'EARNED',
      points: 2500,
      description: 'Flight booking to Paris',
      bookingId: 'booking_12345',
      date: '2026-02-01',
      status: 'COMPLETED'
    },
    {
      id: 'txn_002',
      type: 'REDEEMED',
      points: -5000,
      description: 'Discount on hotel booking',
      bookingId: 'booking_12346',
      date: '2026-01-28',
      status: 'COMPLETED'
    },
    {
      id: 'txn_003',
      type: 'EARNED',
      points: 1800,
      description: 'Hotel booking in Tokyo',
      bookingId: 'booking_12344',
      date: '2026-01-20',
      status: 'COMPLETED'
    },
    {
      id: 'txn_004',
      type: 'BONUS',
      points: 1000,
      description: 'Welcome bonus',
      date: '2026-01-15',
      status: 'COMPLETED'
    },
    {
      id: 'txn_005',
      type: 'EARNED',
      points: 3200,
      description: 'Complete package to London',
      bookingId: 'booking_12343',
      date: '2026-01-10',
      status: 'COMPLETED'
    }
  ];

  return {
    transactions,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: 156,
      totalPages: Math.ceil(156 / limit)
    }
  };
}

async function redeemPoints({ userId, points, rewardType, bookingId }) {
  // Verify user has enough points
  const balance = await getRewardsBalance(userId);
  
  if (balance.currentBalance < points) {
    throw new Error('Insufficient points balance');
  }

  // Get redemption rate for reward type
  const options = getRedemptionOptions();
  const selectedOption = options.find(opt => opt.type === rewardType);
  
  if (!selectedOption) {
    throw new Error('Invalid reward type');
  }

  if (points < selectedOption.minPoints) {
    throw new Error(`Minimum ${selectedOption.minPoints} points required for this redemption`);
  }

  // Calculate redemption value
  const redemptionValue = (points / selectedOption.pointsRequired) * selectedOption.value;

  // Process redemption
  const redemption = {
    id: 'redemption_' + Date.now(),
    userId,
    points,
    rewardType,
    value: redemptionValue,
    bookingId,
    newBalance: balance.currentBalance - points,
    status: 'COMPLETED',
    date: new Date()
  };

  // Update user balance in database
  // await updateUserPoints(userId, -points);

  return redemption;
}

function getRedemptionOptions() {
  return [
    {
      type: 'DISCOUNT',
      name: 'Instant Discount',
      description: 'Get instant discount on your booking',
      minPoints: 5000,
      pointsRequired: 5000,
      value: 500,
      unit: 'INR',
      conversionRate: 0.1,
      icon: 'discount'
    },
    {
      type: 'HOTEL_UPGRADE',
      name: 'Hotel Room Upgrade',
      description: 'Upgrade to the next room category',
      minPoints: 10000,
      pointsRequired: 10000,
      value: 1,
      unit: 'upgrade',
      icon: 'upgrade'
    },
    {
      type: 'FLIGHT_VOUCHER',
      name: 'Flight Voucher',
      description: 'Travel voucher for future bookings',
      minPoints: 15000,
      pointsRequired: 15000,
      value: 2000,
      unit: 'INR',
      conversionRate: 0.133,
      icon: 'voucher'
    },
    {
      type: 'LOUNGE_ACCESS',
      name: 'Airport Lounge Access',
      description: 'Annual lounge access pass',
      minPoints: 20000,
      pointsRequired: 20000,
      value: 1,
      unit: 'year',
      icon: 'lounge'
    },
    {
      type: 'FREE_NIGHT',
      name: 'Free Hotel Night',
      description: 'Complimentary hotel stay',
      minPoints: 25000,
      pointsRequired: 25000,
      value: 1,
      unit: 'night',
      icon: 'hotel'
    },
    {
      type: 'CASHBACK',
      name: 'Cash Back',
      description: 'Direct cash credit to your account',
      minPoints: 10000,
      pointsRequired: 10000,
      value: 800,
      unit: 'INR',
      conversionRate: 0.08,
      icon: 'cashback'
    }
  ];
}

function calculatePointsEarned(bookingType, amount, category = 'standard') {
  // Base earning rates
  const rates = {
    flight: {
      economy: 0.05,
      standard: 0.10,
      business: 0.15,
      luxury: 0.30
    },
    hotel: {
      economy: 0.05,
      standard: 0.10,
      luxury: 0.20
    },
    activity: {
      standard: 0.08,
      luxury: 0.15
    },
    transport: {
      standard: 0.05
    },
    package: {
      standard: 0.12,
      luxury: 0.25
    }
  };

  const baseRate = rates[bookingType]?.[category] || 0.05;
  const basePoints = Math.round(amount * baseRate);
  
  // Bonus multipliers
  let bonusMultiplier = 1;
  let bonusReasons = [];

  // Early bird bonus (booking >30 days in advance)
  // Seasonal bonus
  // First booking bonus
  // etc.

  const totalPoints = Math.round(basePoints * bonusMultiplier);

  return {
    bookingType,
    amount,
    category,
    basePoints,
    bonusMultiplier,
    bonusReasons,
    totalPoints,
    breakdown: {
      base: basePoints,
      bonus: totalPoints - basePoints
    }
  };
}

async function getTierStatus(userId) {
  const balance = await getRewardsBalance(userId);
  
  const tiers = [
    {
      name: 'Silver',
      minPoints: 0,
      maxPoints: 9999,
      benefits: [
        '5% bonus points on all bookings',
        'Priority customer support',
        'Early access to sales'
      ],
      color: '#C0C0C0'
    },
    {
      name: 'Gold',
      minPoints: 10000,
      maxPoints: 19999,
      benefits: [
        '10% bonus points on all bookings',
        'Free hotel upgrades (subject to availability)',
        'Late checkout',
        'Priority customer support',
        'Exclusive deals'
      ],
      color: '#FFD700'
    },
    {
      name: 'Platinum',
      minPoints: 20000,
      maxPoints: 49999,
      benefits: [
        '15% bonus points on all bookings',
        'Guaranteed hotel upgrades',
        'Free airport lounge access',
        'Complimentary breakfast',
        'Dedicated concierge',
        '24/7 VIP support'
      ],
      color: '#E5E4E2'
    },
    {
      name: 'Diamond',
      minPoints: 50000,
      maxPoints: Infinity,
      benefits: [
        '25% bonus points on all bookings',
        'Suite upgrades',
        'Personal travel manager',
        'Exclusive experiences',
        'Partner hotel elite status',
        'Bonus point transfer rates'
      ],
      color: '#B9F2FF'
    }
  ];

  const currentTier = tiers.find(t => 
    balance.currentBalance >= t.minPoints && 
    balance.currentBalance <= t.maxPoints
  );

  const nextTierIndex = tiers.findIndex(t => t.name === currentTier.name) + 1;
  const nextTier = nextTierIndex < tiers.length ? tiers[nextTierIndex] : null;

  return {
    currentTier,
    nextTier,
    pointsToNextTier: nextTier ? nextTier.minPoints - balance.currentBalance : 0,
    progressPercentage: nextTier ? 
      ((balance.currentBalance - currentTier.minPoints) / (nextTier.minPoints - currentTier.minPoints)) * 100 : 100,
    allTiers: tiers
  };
}

async function transferPoints(fromUserId, toUserId, points) {
  // Verify sender has enough points
  const senderBalance = await getRewardsBalance(fromUserId);
  
  if (senderBalance.currentBalance < points) {
    throw new Error('Insufficient points balance');
  }

  // Transfer fee (5%)
  const transferFee = Math.round(points * 0.05);
  const recipientPoints = points - transferFee;

  // Process transfer
  const transfer = {
    id: 'transfer_' + Date.now(),
    fromUserId,
    toUserId,
    pointsSent: points,
    transferFee,
    pointsReceived: recipientPoints,
    status: 'COMPLETED',
    date: new Date()
  };

  // Update balances in database
  // await updateUserPoints(fromUserId, -points);
  // await updateUserPoints(toUserId, recipientPoints);

  return transfer;
}

module.exports = router;