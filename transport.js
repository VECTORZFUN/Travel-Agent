// backend/routes/transport.js
const express = require('express');
const router = express.Router();

// Search local transport options
router.post('/search', async (req, res) => {
  try {
    const { destination, transportType, startDate, endDate } = req.body;

    if (!destination) {
      return res.status(400).json({ error: 'Destination is required' });
    }

    const options = await searchTransportOptions({
      destination,
      transportType: transportType || 'all',
      startDate,
      endDate
    });

    res.json({
      options,
      searchParams: req.body,
      timestamp: new Date()
    });

  } catch (error) {
    console.error('Transport Search Error:', error);
    res.status(500).json({ error: 'Failed to search transport options' });
  }
});

// Book transport
router.post('/book', async (req, res) => {
  try {
    const { transportId, transportType, date, passengers, paymentInfo, useRewardPoints } = req.body;

    const booking = await createTransportBooking({
      transportId,
      transportType,
      date,
      passengers,
      paymentInfo,
      useRewardPoints
    });

    res.json({
      booking,
      confirmationCode: booking.confirmationCode,
      pointsEarned: booking.pointsEarned,
      timestamp: new Date()
    });

  } catch (error) {
    console.error('Transport Booking Error:', error);
    res.status(500).json({ error: 'Failed to book transport' });
  }
});

// Get real-time cab availability
router.post('/cabs/availability', async (req, res) => {
  try {
    const { pickupLocation, dropoffLocation, passengers, vehicleType } = req.body;

    const availability = await getCabAvailability({
      pickupLocation,
      dropoffLocation,
      passengers,
      vehicleType
    });

    res.json(availability);

  } catch (error) {
    console.error('Cab Availability Error:', error);
    res.status(500).json({ error: 'Failed to check cab availability' });
  }
});

// Get train schedules
router.post('/trains/schedule', async (req, res) => {
  try {
    const { from, to, date } = req.body;

    if (!from || !to || !date) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const schedule = await getTrainSchedule(from, to, date);

    res.json(schedule);

  } catch (error) {
    console.error('Train Schedule Error:', error);
    res.status(500).json({ error: 'Failed to fetch train schedule' });
  }
});

// Helper functions
async function searchTransportOptions(params) {
  const days = params.endDate ? 
    Math.ceil((new Date(params.endDate) - new Date(params.startDate)) / (1000 * 60 * 60 * 24)) : 1;

  return {
    metroPass: {
      id: 'metro_paris_001',
      name: 'Paris Metro & Bus Pass',
      description: 'Unlimited travel on Paris metro, buses, and trams',
      destination: params.destination,
      options: [
        {
          duration: '1 Day',
          price: 15,
          coverage: 'Zones 1-5',
          includes: ['Metro', 'Bus', 'Tram', 'RER (zones 1-5)']
        },
        {
          duration: `${days} Days`,
          price: days * 13,
          coverage: 'Zones 1-5',
          includes: ['Metro', 'Bus', 'Tram', 'RER (zones 1-5)'],
          savings: days > 3 ? days * 2 : 0
        },
        {
          duration: '1 Week',
          price: 75,
          coverage: 'Zones 1-5',
          includes: ['Metro', 'Bus', 'Tram', 'RER (zones 1-5)', 'Airport transfer'],
          savings: 30
        }
      ],
      features: [
        'Unlimited rides',
        'Skip ticket lines',
        'Valid for all zones',
        'Instant mobile ticket'
      ],
      pointsEarned: Math.round((days * 13) * 0.05)
    },
    airportTransfer: {
      id: 'transfer_paris_001',
      name: 'Airport Transfer Service',
      description: 'Private transfer between airport and hotel',
      options: [
        {
          type: 'Standard Sedan',
          capacity: 3,
          luggage: 2,
          price: 55,
          duration: '45 mins',
          features: ['Meet & Greet', 'Flight tracking', 'Free wait time']
        },
        {
          type: 'Premium SUV',
          capacity: 6,
          luggage: 4,
          price: 85,
          duration: '45 mins',
          features: ['Meet & Greet', 'Flight tracking', 'Free wait time', 'Child seats available', 'WiFi']
        },
        {
          type: 'Luxury Van',
          capacity: 8,
          luggage: 6,
          price: 120,
          duration: '45 mins',
          features: ['Meet & Greet', 'Flight tracking', 'Free wait time', 'Child seats', 'WiFi', 'Refreshments']
        }
      ],
      routes: [
        {
          from: 'CDG Airport',
          to: 'Paris City Center',
          roundTrip: true
        }
      ],
      pointsEarned: 55
    },
    localCabs: {
      id: 'cabs_paris_001',
      name: 'On-Demand Cab Service',
      description: 'Book cabs for local travel within Paris',
      providers: [
        {
          name: 'Uber',
          options: ['UberX', 'Uber Comfort', 'Uber XL', 'Uber Black']
        },
        {
          name: 'Bolt',
          options: ['Economy', 'Comfort', 'XL']
        },
        {
          name: 'G7 Taxi',
          options: ['Standard', 'Van']
        }
      ],
      estimatedPrices: {
        short: '€8-15 (0-5 km)',
        medium: '€15-30 (5-15 km)',
        long: '€30+ (15+ km)'
      },
      pointsPerRide: 'Varies by distance'
    },
    trainPasses: {
      id: 'train_eurail_001',
      name: 'European Rail Pass',
      description: 'Unlimited train travel across Europe',
      options: [
        {
          duration: '3 Days',
          price: 180,
          validity: '1 month',
          countries: 'France only'
        },
        {
          duration: '5 Days',
          price: 280,
          validity: '1 month',
          countries: 'France + 1 adjacent country'
        },
        {
          duration: '7 Days',
          price: 350,
          validity: '1 month',
          countries: 'France + 2 adjacent countries'
        }
      ],
      features: [
        'Unlimited train travel',
        'Seat reservations included',
        'Digital pass on mobile',
        'Flexible travel dates'
      ],
      pointsEarned: 280
    }
  };
}

async function createTransportBooking(bookingData) {
  const basePrice = 85; // Example price
  const pointsDiscount = bookingData.useRewardPoints ? 200 : 0;
  const finalPrice = basePrice - pointsDiscount;
  const pointsEarned = Math.round(finalPrice * 0.05);

  return {
    id: 'transportbooking_' + Date.now(),
    confirmationCode: 'TRN' + Math.random().toString(36).substr(2, 9).toUpperCase(),
    status: 'CONFIRMED',
    transportId: bookingData.transportId,
    transportType: bookingData.transportType,
    date: bookingData.date,
    passengers: bookingData.passengers,
    totalPrice: finalPrice,
    pointsUsed: bookingData.useRewardPoints ? 2000 : 0,
    pointsEarned: pointsEarned,
    bookingDate: new Date()
  };
}

async function getCabAvailability(params) {
  return {
    available: true,
    estimatedTime: '3-5 minutes',
    options: [
      {
        type: 'Economy',
        price: 12,
        eta: '3 min',
        capacity: 4
      },
      {
        type: 'Comfort',
        price: 18,
        eta: '4 min',
        capacity: 4
      },
      {
        type: 'XL',
        price: 25,
        eta: '5 min',
        capacity: 6
      }
    ],
    route: {
      distance: '5.2 km',
      duration: '15 mins',
      from: params.pickupLocation,
      to: params.dropoffLocation
    }
  };
}

async function getTrainSchedule(from, to, date) {
  return {
    routes: [
      {
        trainNumber: 'TGV 6801',
        operator: 'SNCF',
        from: {
          station: from,
          time: '08:30',
          platform: '12'
        },
        to: {
          station: to,
          time: '10:45',
          platform: '7'
        },
        duration: '2h 15m',
        stops: 0,
        class: ['First Class', 'Second Class'],
        prices: {
          firstClass: 120,
          secondClass: 75
        },
        amenities: ['WiFi', 'Power outlets', 'Food service', 'Luggage storage'],
        availability: {
          firstClass: 15,
          secondClass: 42
        }
      },
      {
        trainNumber: 'TGV 6803',
        operator: 'SNCF',
        from: {
          station: from,
          time: '11:00',
          platform: '14'
        },
        to: {
          station: to,
          time: '13:15',
          platform: '7'
        },
        duration: '2h 15m',
        stops: 0,
        class: ['First Class', 'Second Class'],
        prices: {
          firstClass: 120,
          secondClass: 75
        },
        amenities: ['WiFi', 'Power outlets', 'Food service', 'Luggage storage'],
        availability: {
          firstClass: 8,
          secondClass: 28
        }
      }
    ],
    date,
    searchParams: { from, to }
  };
}

module.exports = router;