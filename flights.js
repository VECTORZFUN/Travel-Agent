// backend/routes/flights.js
const express = require('express');
const router = express.Router();

// Search flights
router.post('/search', async (req, res) => {
  try {
    const { 
      origin, 
      destination, 
      departureDate, 
      returnDate, 
      passengers, 
      cabinClass 
    } = req.body;

    // Validate inputs
    if (!origin || !destination || !departureDate) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // Call flight search API (Amadeus, Skyscanner, Duffel)
    const flights = await searchFlightAPI({
      origin,
      destination,
      departureDate,
      returnDate,
      passengers: passengers || 1,
      cabinClass: cabinClass || 'ECONOMY'
    });

    res.json({
      flights,
      searchParams: req.body,
      timestamp: new Date()
    });

  } catch (error) {
    console.error('Flight Search Error:', error);
    res.status(500).json({ error: 'Failed to search flights' });
  }
});

// Get flight details
router.get('/:flightId', async (req, res) => {
  try {
    const { flightId } = req.params;
    
    const flightDetails = await getFlightDetails(flightId);
    
    res.json(flightDetails);

  } catch (error) {
    console.error('Flight Details Error:', error);
    res.status(404).json({ error: 'Flight not found' });
  }
});

// Book flight
router.post('/book', async (req, res) => {
  try {
    const { 
      flightId, 
      passengers, 
      contactInfo, 
      paymentInfo,
      useRewardPoints 
    } = req.body;

    // Calculate final price with rewards
    const booking = await createFlightBooking({
      flightId,
      passengers,
      contactInfo,
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
    console.error('Flight Booking Error:', error);
    res.status(500).json({ error: 'Failed to book flight' });
  }
});

// Check flight status
router.get('/status/:flightNumber', async (req, res) => {
  try {
    const { flightNumber } = req.params;
    
    const status = await checkFlightStatus(flightNumber);
    
    res.json(status);

  } catch (error) {
    console.error('Flight Status Error:', error);
    res.status(404).json({ error: 'Flight status not available' });
  }
});

// Helper function: Search flights via external API
async function searchFlightAPI(params) {
  // This would integrate with Amadeus Flight Offers Search API
  // Example response structure
  
  return [
    {
      id: 'flight_001',
      outbound: {
        airline: 'Air India',
        flightNumber: 'AI142',
        aircraft: 'Boeing 787',
        from: {
          code: params.origin,
          name: 'Indira Gandhi International Airport',
          city: 'Delhi',
          terminal: '3'
        },
        to: {
          code: params.destination,
          name: 'Charles de Gaulle Airport',
          city: 'Paris',
          terminal: '2E'
        },
        departure: `${params.departureDate}T14:30:00`,
        arrival: `${params.departureDate}T20:45:00`,
        duration: '8h 15m',
        stops: 0,
        cabinClass: params.cabinClass
      },
      return: params.returnDate ? {
        airline: 'Air India',
        flightNumber: 'AI143',
        aircraft: 'Boeing 787',
        from: {
          code: params.destination,
          name: 'Charles de Gaulle Airport',
          city: 'Paris',
          terminal: '2E'
        },
        to: {
          code: params.origin,
          name: 'Indira Gandhi International Airport',
          city: 'Delhi',
          terminal: '3'
        },
        departure: `${params.returnDate}T22:15:00`,
        arrival: `${params.returnDate}T10:30:00+1`,
        duration: '8h 45m',
        stops: 0,
        cabinClass: params.cabinClass
      } : null,
      price: {
        total: 45000,
        currency: 'INR',
        perPerson: 45000 / params.passengers,
        breakdown: {
          baseFare: 38000,
          taxes: 7000
        }
      },
      availability: {
        seatsAvailable: 12,
        cabinClass: params.cabinClass
      },
      baggage: {
        checkedBags: 2,
        cabinBag: 1,
        weightLimit: '23kg per bag'
      },
      amenities: [
        'In-flight Entertainment',
        'Meal Service',
        'WiFi Available',
        'USB Charging'
      ],
      pointsEarned: 4500,
      carbonFootprint: '1.2 tons CO2'
    },
    {
      id: 'flight_002',
      outbound: {
        airline: 'Lufthansa',
        flightNumber: 'LH761',
        aircraft: 'Airbus A350',
        from: {
          code: params.origin,
          name: 'Indira Gandhi International Airport',
          city: 'Delhi',
          terminal: '3'
        },
        to: {
          code: params.destination,
          name: 'Charles de Gaulle Airport',
          city: 'Paris',
          terminal: '1'
        },
        departure: `${params.departureDate}T02:30:00`,
        arrival: `${params.departureDate}T08:15:00`,
        duration: '9h 45m',
        stops: 1,
        stopover: {
          city: 'Frankfurt',
          duration: '2h 30m'
        },
        cabinClass: params.cabinClass
      },
      return: params.returnDate ? {
        airline: 'Lufthansa',
        flightNumber: 'LH762',
        aircraft: 'Airbus A350',
        from: {
          code: params.destination,
          name: 'Charles de Gaulle Airport',
          city: 'Paris',
          terminal: '1'
        },
        to: {
          code: params.origin,
          name: 'Indira Gandhi International Airport',
          city: 'Delhi',
          terminal: '3'
        },
        departure: `${params.returnDate}T18:45:00`,
        arrival: `${params.returnDate}T09:15:00+1`,
        duration: '10h 30m',
        stops: 1,
        stopover: {
          city: 'Frankfurt',
          duration: '2h 15m'
        },
        cabinClass: params.cabinClass
      } : null,
      price: {
        total: 42000,
        currency: 'INR',
        perPerson: 42000 / params.passengers,
        breakdown: {
          baseFare: 36000,
          taxes: 6000
        }
      },
      availability: {
        seatsAvailable: 8,
        cabinClass: params.cabinClass
      },
      baggage: {
        checkedBags: 2,
        cabinBag: 1,
        weightLimit: '23kg per bag'
      },
      amenities: [
        'Premium Entertainment',
        'Gourmet Meals',
        'WiFi Included',
        'Power Outlets',
        'Lie-flat Seats (Business)'
      ],
      pointsEarned: 4200,
      carbonFootprint: '1.4 tons CO2'
    }
  ];
}

async function getFlightDetails(flightId) {
  // Fetch detailed flight information
  return {
    id: flightId,
    // ... detailed flight info
  };
}

async function createFlightBooking(bookingData) {
  // Create booking and process payment
  const basePrice = 45000; // Get from flight data
  const pointsDiscount = bookingData.useRewardPoints ? 500 : 0;
  const finalPrice = basePrice - pointsDiscount;
  const pointsEarned = Math.round(finalPrice * 0.1);

  return {
    id: 'booking_' + Date.now(),
    confirmationCode: 'TRV' + Math.random().toString(36).substr(2, 9).toUpperCase(),
    status: 'CONFIRMED',
    flightId: bookingData.flightId,
    passengers: bookingData.passengers,
    totalPrice: finalPrice,
    pointsUsed: bookingData.useRewardPoints ? 5000 : 0,
    pointsEarned: pointsEarned,
    bookingDate: new Date(),
    contactInfo: bookingData.contactInfo
  };
}

async function checkFlightStatus(flightNumber) {
  // Check real-time flight status
  return {
    flightNumber,
    status: 'On Time',
    departure: {
      scheduled: '2026-03-15T14:30:00',
      estimated: '2026-03-15T14:30:00',
      gate: 'A12'
    },
    arrival: {
      scheduled: '2026-03-15T20:45:00',
      estimated: '2026-03-15T20:45:00',
      gate: 'E23'
    }
  };
}

module.exports = router;