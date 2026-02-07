// backend/routes/hotels.js
const express = require('express');
const router = express.Router();

// Search hotels
router.post('/search', async (req, res) => {
  try {
    const { 
      destination, 
      checkIn, 
      checkOut, 
      guests, 
      rooms,
      minRating,
      maxPrice,
      amenities 
    } = req.body;

    if (!destination || !checkIn || !checkOut) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const hotels = await searchHotelsAPI({
      destination,
      checkIn,
      checkOut,
      guests: guests || 2,
      rooms: rooms || 1,
      minRating,
      maxPrice,
      amenities
    });

    res.json({
      hotels,
      searchParams: req.body,
      timestamp: new Date()
    });

  } catch (error) {
    console.error('Hotel Search Error:', error);
    res.status(500).json({ error: 'Failed to search hotels' });
  }
});

// Get hotel details
router.get('/:hotelId', async (req, res) => {
  try {
    const { hotelId } = req.params;
    const hotelDetails = await getHotelDetails(hotelId);
    res.json(hotelDetails);
  } catch (error) {
    console.error('Hotel Details Error:', error);
    res.status(404).json({ error: 'Hotel not found' });
  }
});

// Book hotel
router.post('/book', async (req, res) => {
  try {
    const { 
      hotelId, 
      roomType,
      checkIn,
      checkOut,
      guests, 
      specialRequests,
      paymentInfo,
      useRewardPoints 
    } = req.body;

    const booking = await createHotelBooking({
      hotelId,
      roomType,
      checkIn,
      checkOut,
      guests,
      specialRequests,
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
    console.error('Hotel Booking Error:', error);
    res.status(500).json({ error: 'Failed to book hotel' });
  }
});

// Get hotel reviews
router.get('/:hotelId/reviews', async (req, res) => {
  try {
    const { hotelId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    const reviews = await getHotelReviews(hotelId, page, limit);
    res.json(reviews);
  } catch (error) {
    console.error('Reviews Error:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// Helper functions
async function searchHotelsAPI(params) {
  // Integration with Booking.com or Expedia API
  const nights = Math.ceil((new Date(params.checkOut) - new Date(params.checkIn)) / (1000 * 60 * 60 * 24));
  
  return [
    {
      id: 'hotel_001',
      name: 'Le Marais Boutique Hotel',
      description: 'Charming boutique hotel in the heart of historic Le Marais district',
      images: [
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80',
        'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&q=80'
      ],
      location: {
        address: '24 Rue des Archives, 75004 Paris, France',
        district: 'Le Marais',
        city: 'Paris',
        country: 'France',
        coordinates: {
          lat: 48.8606,
          lng: 2.3522
        },
        nearbyAttractions: [
          { name: 'Notre-Dame Cathedral', distance: '1.2 km' },
          { name: 'Louvre Museum', distance: '2.3 km' },
          { name: 'Centre Pompidou', distance: '0.5 km' }
        ]
      },
      rating: {
        overall: 4.7,
        reviews: 1250,
        breakdown: {
          cleanliness: 4.8,
          comfort: 4.7,
          location: 4.9,
          service: 4.6,
          value: 4.5
        }
      },
      starRating: 4,
      amenities: [
        'Free WiFi',
        'Breakfast Included',
        'Air Conditioning',
        '24/7 Front Desk',
        'Concierge Service',
        'Luggage Storage',
        'Express Check-in/out',
        'Non-smoking Rooms',
        'Elevator',
        'City View Rooms'
      ],
      rooms: [
        {
          type: 'Standard Double Room',
          size: '18 sqm',
          bed: '1 Queen Bed',
          capacity: 2,
          amenities: ['City View', 'Private Bathroom', 'Mini Bar', 'Safe'],
          pricePerNight: 180,
          available: 3
        },
        {
          type: 'Deluxe Suite',
          size: '32 sqm',
          bed: '1 King Bed',
          capacity: 3,
          amenities: ['City View', 'Balcony', 'Private Bathroom', 'Mini Bar', 'Safe', 'Sitting Area'],
          pricePerNight: 280,
          available: 2
        }
      ],
      policies: {
        checkIn: '15:00',
        checkOut: '11:00',
        cancellation: 'Free cancellation up to 24 hours before check-in',
        deposit: 'No prepayment needed',
        pets: 'Pets not allowed',
        children: 'Children of all ages welcome'
      },
      price: {
        totalForStay: 180 * nights,
        pricePerNight: 180,
        nights: nights,
        currency: 'EUR',
        inrEquivalent: 180 * 90 * nights, // Approximate conversion
        taxes: 180 * nights * 0.1,
        breakdown: {
          roomRate: 180 * nights,
          serviceFee: 180 * nights * 0.05,
          taxes: 180 * nights * 0.1
        }
      },
      pointsEarned: Math.round((180 * nights * 90) * 0.05),
      specialOffers: [
        'Book 4+ nights and save 10%',
        'Free airport transfer on bookings over €500'
      ],
      sustainability: {
        certified: true,
        features: ['Solar panels', 'Recycling program', 'Energy-efficient lighting']
      }
    },
    {
      id: 'hotel_002',
      name: 'Paris Grand Luxury Hotel',
      description: '5-star luxury hotel with stunning Eiffel Tower views',
      images: [
        'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80',
        'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&q=80',
        'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80'
      ],
      location: {
        address: '19 Avenue Kléber, 75116 Paris, France',
        district: 'Trocadéro',
        city: 'Paris',
        country: 'France',
        coordinates: {
          lat: 48.8690,
          lng: 2.2933
        },
        nearbyAttractions: [
          { name: 'Eiffel Tower', distance: '0.8 km' },
          { name: 'Arc de Triomphe', distance: '1.5 km' },
          { name: 'Champs-Élysées', distance: '2.0 km' }
        ]
      },
      rating: {
        overall: 4.9,
        reviews: 890,
        breakdown: {
          cleanliness: 5.0,
          comfort: 4.9,
          location: 4.9,
          service: 4.9,
          value: 4.7
        }
      },
      starRating: 5,
      amenities: [
        'Free WiFi',
        'Breakfast Included',
        'Spa & Wellness Center',
        'Indoor Pool',
        'Fitness Center',
        'Restaurant & Bar',
        'Room Service 24/7',
        'Valet Parking',
        'Airport Shuttle',
        'Business Center',
        'Meeting Rooms',
        'Rooftop Terrace'
      ],
      rooms: [
        {
          type: 'Deluxe Room',
          size: '35 sqm',
          bed: '1 King Bed',
          capacity: 2,
          amenities: ['Eiffel Tower View', 'Marble Bathroom', 'Nespresso Machine', 'Safe', 'Bathrobe & Slippers'],
          pricePerNight: 450,
          available: 5
        },
        {
          type: 'Executive Suite',
          size: '65 sqm',
          bed: '1 King Bed + Sofa Bed',
          capacity: 4,
          amenities: ['Panoramic Eiffel Tower View', 'Separate Living Room', 'Marble Bathroom', 'Butler Service', 'Balcony'],
          pricePerNight: 850,
          available: 2
        }
      ],
      policies: {
        checkIn: '15:00',
        checkOut: '12:00',
        cancellation: 'Free cancellation up to 48 hours before check-in',
        deposit: 'Prepayment required',
        pets: 'Small pets allowed (additional fee)',
        children: 'Children welcome, cribs available'
      },
      price: {
        totalForStay: 450 * nights,
        pricePerNight: 450,
        nights: nights,
        currency: 'EUR',
        inrEquivalent: 450 * 90 * nights,
        taxes: 450 * nights * 0.1,
        breakdown: {
          roomRate: 450 * nights,
          serviceFee: 450 * nights * 0.05,
          taxes: 450 * nights * 0.1
        }
      },
      pointsEarned: Math.round((450 * nights * 90) * 0.1), // 3x points for luxury
      specialOffers: [
        'Complimentary spa access',
        'Free champagne on arrival'
      ],
      sustainability: {
        certified: true,
        features: ['LEED Gold Certified', 'Organic breakfast options', 'Waste reduction program']
      }
    }
  ];
}

async function getHotelDetails(hotelId) {
  // Fetch comprehensive hotel details
  return {
    id: hotelId,
    // ... detailed info
  };
}

async function createHotelBooking(bookingData) {
  const pricePerNight = 180; // Get from hotel data
  const nights = Math.ceil((new Date(bookingData.checkOut) - new Date(bookingData.checkIn)) / (1000 * 60 * 60 * 24));
  const basePrice = pricePerNight * nights;
  const pointsDiscount = bookingData.useRewardPoints ? 1000 : 0;
  const finalPrice = basePrice - pointsDiscount;
  const pointsEarned = Math.round(finalPrice * 0.05);

  return {
    id: 'hotelbooking_' + Date.now(),
    confirmationCode: 'HTL' + Math.random().toString(36).substr(2, 9).toUpperCase(),
    status: 'CONFIRMED',
    hotelId: bookingData.hotelId,
    roomType: bookingData.roomType,
    checkIn: bookingData.checkIn,
    checkOut: bookingData.checkOut,
    nights: nights,
    guests: bookingData.guests,
    totalPrice: finalPrice,
    pointsUsed: bookingData.useRewardPoints ? 10000 : 0,
    pointsEarned: pointsEarned,
    bookingDate: new Date(),
    specialRequests: bookingData.specialRequests
  };
}

async function getHotelReviews(hotelId, page, limit) {
  // Fetch paginated reviews
  return {
    reviews: [
      {
        id: 'review_001',
        rating: 5,
        title: 'Perfect stay in Paris!',
        text: 'Amazing location, beautiful rooms, and exceptional service.',
        author: 'Sarah M.',
        date: '2026-01-15',
        helpful: 24
      }
    ],
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: 1250
    }
  };
}

module.exports = router;