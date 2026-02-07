// backend/routes/bookings.js
const express = require('express');
const router = express.Router();

// Get all bookings for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, type, page = 1, limit = 10 } = req.query;

    const bookings = await getUserBookings(userId, { status, type, page, limit });

    res.json(bookings);

  } catch (error) {
    console.error('Get Bookings Error:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// Get specific booking details
router.get('/:bookingId', async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await getBookingDetails(bookingId);

    res.json(booking);

  } catch (error) {
    console.error('Booking Details Error:', error);
    res.status(404).json({ error: 'Booking not found' });
  }
});

// Cancel booking
router.post('/:bookingId/cancel', async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { reason } = req.body;

    const cancellation = await cancelBooking(bookingId, reason);

    res.json({
      success: true,
      cancellation,
      refundAmount: cancellation.refundAmount,
      pointsRefunded: cancellation.pointsRefunded,
      timestamp: new Date()
    });

  } catch (error) {
    console.error('Cancel Booking Error:', error);
    res.status(500).json({ error: error.message || 'Failed to cancel booking' });
  }
});

// Modify booking
router.put('/:bookingId/modify', async (req, res) => {
  try {
    const { bookingId } = req.params;
    const modifications = req.body;

    const modified = await modifyBooking(bookingId, modifications);

    res.json({
      success: true,
      booking: modified,
      additionalCost: modified.additionalCost || 0,
      timestamp: new Date()
    });

  } catch (error) {
    console.error('Modify Booking Error:', error);
    res.status(500).json({ error: error.message || 'Failed to modify booking' });
  }
});

// Create package booking (combines multiple services)
router.post('/package', async (req, res) => {
  try {
    const { 
      userId,
      flights, 
      hotels, 
      activities, 
      transport,
      travelers,
      paymentInfo,
      useRewardPoints
    } = req.body;

    const packageBooking = await createPackageBooking({
      userId,
      flights,
      hotels,
      activities,
      transport,
      travelers,
      paymentInfo,
      useRewardPoints
    });

    res.json({
      success: true,
      booking: packageBooking,
      confirmationCode: packageBooking.confirmationCode,
      totalSavings: packageBooking.savings,
      pointsEarned: packageBooking.pointsEarned,
      timestamp: new Date()
    });

  } catch (error) {
    console.error('Package Booking Error:', error);
    res.status(500).json({ error: 'Failed to create package booking' });
  }
});

// Get booking invoice/receipt
router.get('/:bookingId/invoice', async (req, res) => {
  try {
    const { bookingId } = req.params;

    const invoice = await generateInvoice(bookingId);

    res.json(invoice);

  } catch (error) {
    console.error('Invoice Generation Error:', error);
    res.status(500).json({ error: 'Failed to generate invoice' });
  }
});

// Helper functions

async function getUserBookings(userId, filters) {
  // Fetch from database with filters
  const allBookings = [
    {
      id: 'booking_12345',
      type: 'PACKAGE',
      status: 'CONFIRMED',
      destination: 'Paris, France',
      startDate: '2026-03-15',
      endDate: '2026-03-20',
      travelers: 2,
      totalCost: 98500,
      currency: 'INR',
      pointsEarned: 9850,
      createdAt: '2026-02-01',
      confirmationCode: 'PKG-XYZ789',
      services: {
        flights: true,
        hotels: true,
        activities: true,
        transport: true
      }
    },
    {
      id: 'booking_12346',
      type: 'FLIGHT',
      status: 'UPCOMING',
      destination: 'Tokyo, Japan',
      startDate: '2026-04-10',
      endDate: '2026-04-10',
      travelers: 1,
      totalCost: 45000,
      currency: 'INR',
      pointsEarned: 4500,
      createdAt: '2026-02-05',
      confirmationCode: 'FLT-ABC123',
      airline: 'ANA',
      flightNumber: 'NH829'
    },
    {
      id: 'booking_12344',
      type: 'HOTEL',
      status: 'COMPLETED',
      destination: 'Dubai, UAE',
      startDate: '2026-01-20',
      endDate: '2026-01-25',
      travelers: 2,
      totalCost: 65000,
      currency: 'INR',
      pointsEarned: 6500,
      createdAt: '2025-12-15',
      confirmationCode: 'HTL-DEF456',
      hotelName: 'Burj Al Arab'
    },
    {
      id: 'booking_12343',
      type: 'ACTIVITY',
      status: 'CANCELLED',
      destination: 'Singapore',
      startDate: '2026-01-05',
      endDate: '2026-01-05',
      travelers: 3,
      totalCost: 15000,
      currency: 'INR',
      pointsEarned: 0,
      refundAmount: 13500,
      createdAt: '2025-12-20',
      cancelledAt: '2025-12-28',
      confirmationCode: 'ACT-GHI789',
      activityName: 'Universal Studios Singapore'
    }
  ];

  // Apply filters
  let filtered = allBookings;
  
  if (filters.status) {
    filtered = filtered.filter(b => b.status === filters.status.toUpperCase());
  }
  
  if (filters.type) {
    filtered = filtered.filter(b => b.type === filters.type.toUpperCase());
  }

  const page = parseInt(filters.page);
  const limit = parseInt(filters.limit);
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;

  return {
    bookings: filtered.slice(startIndex, endIndex),
    pagination: {
      page,
      limit,
      total: filtered.length,
      totalPages: Math.ceil(filtered.length / limit)
    }
  };
}

async function getBookingDetails(bookingId) {
  // Comprehensive booking details
  return {
    id: bookingId,
    type: 'PACKAGE',
    status: 'CONFIRMED',
    confirmationCode: 'PKG-XYZ789',
    destination: 'Paris, France',
    createdAt: '2026-02-01T10:30:00Z',
    travelers: [
      {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@email.com',
        phone: '+91-9876543210',
        dateOfBirth: '1990-05-15',
        passportNumber: 'A12345678'
      },
      {
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane.doe@email.com',
        phone: '+91-9876543211',
        dateOfBirth: '1992-08-20',
        passportNumber: 'B87654321'
      }
    ],
    itinerary: {
      startDate: '2026-03-15',
      endDate: '2026-03-20',
      duration: '5 Days, 4 Nights'
    },
    services: {
      flights: {
        outbound: {
          flightNumber: 'AI142',
          airline: 'Air India',
          from: 'DEL',
          to: 'CDG',
          departure: '2026-03-15T14:30:00',
          arrival: '2026-03-15T20:45:00',
          class: 'Premium Economy',
          bookingReference: 'AI2026XYZ'
        },
        return: {
          flightNumber: 'AI143',
          airline: 'Air India',
          from: 'CDG',
          to: 'DEL',
          departure: '2026-03-20T22:15:00',
          arrival: '2026-03-21T10:30:00',
          class: 'Premium Economy',
          bookingReference: 'AI2026ABC'
        },
        cost: 42500
      },
      hotel: {
        name: 'Le Marais Boutique Hotel',
        address: '24 Rue des Archives, 75004 Paris',
        checkIn: '2026-03-15',
        checkOut: '2026-03-20',
        roomType: 'Deluxe Double Room',
        nights: 5,
        bookingReference: 'HTL2026DEF',
        cost: 32400
      },
      activities: [
        {
          name: 'Eiffel Tower Skip-the-Line',
          date: '2026-03-16',
          time: '10:00',
          participants: 2,
          bookingReference: 'ACT2026GHI',
          cost: 5850
        },
        {
          name: 'Louvre Museum Tour',
          date: '2026-03-17',
          time: '14:00',
          participants: 2,
          bookingReference: 'ACT2026JKL',
          cost: 6750
        }
      ],
      transport: {
        type: 'Airport Transfer + Metro Pass',
        details: '5-day unlimited metro + airport pickup/dropoff',
        bookingReference: 'TRN2026MNO',
        cost: 7650
      }
    },
    pricing: {
      subtotal: 95150,
      discount: 4758, // 5% package discount
      taxes: 8343,
      total: 98735,
      currency: 'INR',
      breakdown: [
        { item: 'Flights', amount: 42500 },
        { item: 'Hotel (5 nights)', amount: 32400 },
        { item: 'Activities (2)', amount: 12600 },
        { item: 'Transport', amount: 7650 },
        { item: 'Package Discount', amount: -4758 },
        { item: 'Taxes & Fees', amount: 8343 }
      ]
    },
    rewards: {
      pointsUsed: 0,
      pointsEarned: 9874,
      tierBonus: 1974 // Gold tier 20% bonus
    },
    payment: {
      method: 'Credit Card',
      last4: '4242',
      status: 'COMPLETED',
      transactionId: 'TXN-2026-02-01-12345'
    },
    cancellationPolicy: {
      deadline: '2026-03-08',
      refundPercentage: 90,
      fees: 9874
    },
    contactInfo: {
      email: 'john.doe@email.com',
      phone: '+91-9876543210'
    }
  };
}

async function cancelBooking(bookingId, reason) {
  const booking = await getBookingDetails(bookingId);
  
  // Check cancellation policy
  const now = new Date();
  const deadline = new Date(booking.cancellationPolicy.deadline);
  
  if (now > deadline) {
    throw new Error('Cancellation deadline has passed');
  }

  const refundPercentage = booking.cancellationPolicy.refundPercentage;
  const refundAmount = Math.round(booking.pricing.total * (refundPercentage / 100));
  const cancellationFee = booking.pricing.total - refundAmount;
  const pointsRefunded = Math.round(booking.rewards.pointsEarned * (refundPercentage / 100));

  return {
    bookingId,
    status: 'CANCELLED',
    reason,
    refundAmount,
    cancellationFee,
    refundMethod: booking.payment.method,
    estimatedRefundTime: '5-7 business days',
    pointsRefunded,
    cancelledAt: new Date()
  };
}

async function modifyBooking(bookingId, modifications) {
  const booking = await getBookingDetails(bookingId);
  
  // Calculate modification fees
  const modificationFee = 1500; // Base fee
  let additionalCost = modificationFee;

  // Apply modifications (simplified logic)
  if (modifications.dates) {
    additionalCost += 2000; // Date change fee
  }

  if (modifications.roomUpgrade) {
    additionalCost += 5000; // Room upgrade cost
  }

  return {
    ...booking,
    modified: true,
    modifications,
    additionalCost,
    modificationFee,
    newTotal: booking.pricing.total + additionalCost,
    modifiedAt: new Date()
  };
}

async function createPackageBooking(packageData) {
  // Calculate total costs
  const flightCost = packageData.flights ? 42500 : 0;
  const hotelCost = packageData.hotels ? 32400 : 0;
  const activityCost = packageData.activities ? 12600 : 0;
  const transportCost = packageData.transport ? 7650 : 0;

  const subtotal = flightCost + hotelCost + activityCost + transportCost;
  const packageDiscount = Math.round(subtotal * 0.15); // 15% package savings
  const pointsDiscount = packageData.useRewardPoints ? 5000 : 0;
  const taxes = Math.round((subtotal - packageDiscount) * 0.09);
  const total = subtotal - packageDiscount - pointsDiscount + taxes;

  // Calculate points earned (with luxury multiplier if applicable)
  const basePoints = Math.round(total * 0.10);
  const tierBonus = Math.round(basePoints * 0.20); // Gold tier 20% bonus
  const totalPoints = basePoints + tierBonus;

  return {
    id: 'booking_' + Date.now(),
    confirmationCode: 'PKG' + Math.random().toString(36).substr(2, 6).toUpperCase(),
    type: 'PACKAGE',
    status: 'CONFIRMED',
    userId: packageData.userId,
    travelers: packageData.travelers,
    createdAt: new Date(),
    pricing: {
      subtotal,
      packageDiscount,
      pointsDiscount,
      taxes,
      total,
      currency: 'INR',
      savings: packageDiscount + pointsDiscount
    },
    rewards: {
      pointsUsed: packageData.useRewardPoints ? 5000 : 0,
      pointsEarned: totalPoints,
      tierBonus
    },
    services: {
      flights: packageData.flights || null,
      hotels: packageData.hotels || null,
      activities: packageData.activities || null,
      transport: packageData.transport || null
    }
  };
}

async function generateInvoice(bookingId) {
  const booking = await getBookingDetails(bookingId);

  return {
    invoiceNumber: 'INV-' + bookingId,
    invoiceDate: booking.createdAt,
    dueDate: booking.createdAt,
    status: 'PAID',
    booking,
    billTo: {
      name: `${booking.travelers[0].firstName} ${booking.travelers[0].lastName}`,
      email: booking.travelers[0].email,
      phone: booking.travelers[0].phone
    },
    company: {
      name: 'TravelAI',
      address: '123 Travel Street, Mumbai, India',
      email: 'billing@travelai.com',
      phone: '+91-22-1234-5678',
      gst: 'GSTIN123456789'
    },
    items: booking.pricing.breakdown,
    total: booking.pricing.total,
    currency: booking.pricing.currency,
    paymentMethod: booking.payment.method,
    transactionId: booking.payment.transactionId
  };
}

module.exports = router;