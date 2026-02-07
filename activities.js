// backend/routes/activities.js
const express = require('express');
const router = express.Router();

// Search activities and experiences
router.post('/search', async (req, res) => {
  try {
    const { destination, category, date, guests, priceRange } = req.body;

    if (!destination) {
      return res.status(400).json({ error: 'Destination is required' });
    }

    const activities = await searchActivitiesAPI({
      destination,
      category,
      date,
      guests: guests || 1,
      priceRange
    });

    res.json({
      activities,
      searchParams: req.body,
      timestamp: new Date()
    });

  } catch (error) {
    console.error('Activity Search Error:', error);
    res.status(500).json({ error: 'Failed to search activities' });
  }
});

// Get activity details
router.get('/:activityId', async (req, res) => {
  try {
    const { activityId } = req.params;
    const activityDetails = await getActivityDetails(activityId);
    res.json(activityDetails);
  } catch (error) {
    console.error('Activity Details Error:', error);
    res.status(404).json({ error: 'Activity not found' });
  }
});

// Book activity
router.post('/book', async (req, res) => {
  try {
    const { activityId, date, timeSlot, participants, paymentInfo, useRewardPoints } = req.body;

    const booking = await createActivityBooking({
      activityId,
      date,
      timeSlot,
      participants,
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
    console.error('Activity Booking Error:', error);
    res.status(500).json({ error: 'Failed to book activity' });
  }
});

// Helper functions
async function searchActivitiesAPI(params) {
  // Integration with GetYourGuide or Viator API
  const categories = {
    'culture': ['Museums', 'Historical Tours', 'Art Galleries'],
    'adventure': ['Outdoor Activities', 'Water Sports', 'Hiking'],
    'food': ['Food Tours', 'Cooking Classes', 'Wine Tasting'],
    'entertainment': ['Shows', 'Concerts', 'Night Life']
  };

  return [
    {
      id: 'activity_001',
      name: 'Skip-the-Line Eiffel Tower Summit Access',
      description: 'Beat the crowds with priority access to the Eiffel Tower summit. Enjoy panoramic views of Paris from the iconic landmark.',
      longDescription: 'Experience Paris from new heights with skip-the-line access to the Eiffel Tower. Your ticket includes access to all three levels, including the summit. Learn about the tower\'s fascinating history from your audio guide as you ascend to breathtaking viewpoints.',
      images: [
        'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=800&q=80',
        'https://images.unsplash.com/photo-1549144511-f099e773c147?w=800&q=80'
      ],
      category: 'Attractions',
      subcategories: ['Landmarks', 'Skip-the-Line'],
      duration: '2 hours',
      location: {
        address: 'Champ de Mars, 5 Avenue Anatole France, 75007 Paris',
        city: 'Paris',
        coordinates: { lat: 48.8584, lng: 2.2945 }
      },
      rating: {
        overall: 4.9,
        reviews: 15420,
        breakdown: {
          experience: 4.9,
          value: 4.7,
          organization: 4.8,
          guide: 4.8
        }
      },
      price: {
        adult: 65,
        child: 40,
        currency: 'EUR',
        inrEquivalent: 5850
      },
      availability: {
        instantConfirmation: true,
        mobileTicket: true,
        timeSlots: ['09:00', '10:30', '12:00', '14:00', '16:00', '18:00', '20:00']
      },
      includes: [
        'Skip-the-line entrance',
        'Summit access',
        'Audio guide in 10 languages',
        'Flexible cancellation up to 24h'
      ],
      notIncluded: [
        'Hotel pickup',
        'Food and drinks'
      ],
      languages: ['English', 'French', 'Spanish', 'German', 'Italian', 'Japanese', 'Chinese'],
      accessibility: 'Wheelchair accessible to 2nd floor',
      cancellationPolicy: 'Free cancellation up to 24 hours before start time',
      pointsEarned: 650,
      highlights: [
        '360° panoramic views of Paris',
        'Skip long queues',
        'Visit all three levels',
        'Learn tower history'
      ],
      meetingPoint: 'Eiffel Tower South Security Entrance',
      importantInfo: [
        'Please arrive 15 minutes before your time slot',
        'Bring valid photo ID',
        'Security screening required',
        'Large bags not permitted'
      ]
    },
    {
      id: 'activity_002',
      name: 'Louvre Museum Guided Tour with Mona Lisa',
      description: 'Explore the world\'s largest art museum with an expert guide. Skip the lines and discover masterpieces including the Mona Lisa.',
      longDescription: 'Discover the treasures of the Louvre Museum on this comprehensive guided tour. Skip the notorious lines and dive straight into art history with an expert guide who brings the museum\'s masterpieces to life.',
      images: [
        'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800&q=80',
        'https://images.unsplash.com/photo-1566127444979-b3d2b654e3d7?w=800&q=80'
      ],
      category: 'Museums & Art',
      subcategories: ['Art Museums', 'Guided Tours', 'Skip-the-Line'],
      duration: '3 hours',
      location: {
        address: 'Rue de Rivoli, 75001 Paris',
        city: 'Paris',
        coordinates: { lat: 48.8606, lng: 2.3376 }
      },
      rating: {
        overall: 4.8,
        reviews: 8930,
        breakdown: {
          experience: 4.9,
          value: 4.6,
          organization: 4.8,
          guide: 4.9
        }
      },
      price: {
        adult: 75,
        child: 50,
        currency: 'EUR',
        inrEquivalent: 6750
      },
      availability: {
        instantConfirmation: true,
        mobileTicket: true,
        timeSlots: ['09:30', '11:00', '14:00', '15:30']
      },
      includes: [
        'Skip-the-line entrance',
        'Professional guide',
        'Small group tour (max 20)',
        'Headset for clear audio'
      ],
      notIncluded: [
        'Hotel pickup',
        'Gratuities'
      ],
      languages: ['English', 'French', 'Spanish', 'Italian'],
      accessibility: 'Fully wheelchair accessible',
      cancellationPolicy: 'Free cancellation up to 48 hours before start time',
      pointsEarned: 750,
      highlights: [
        'See the Mona Lisa',
        'Venus de Milo sculpture',
        'Winged Victory of Samothrace',
        'Ancient Egyptian artifacts',
        'Expert art historian guide'
      ],
      meetingPoint: 'Arc de Triomphe du Carrousel',
      importantInfo: [
        'Closed on Tuesdays',
        'Comfortable walking shoes recommended',
        'Museum is very large - tour covers highlights',
        'Photos allowed (no flash)'
      ]
    },
    {
      id: 'activity_003',
      name: 'Seine River Evening Dinner Cruise',
      description: 'Enjoy a romantic dinner cruise along the Seine with live music and stunning views of illuminated Paris landmarks.',
      longDescription: 'Experience the magic of Paris by night on this elegant dinner cruise along the Seine River. Glide past illuminated landmarks while savoring gourmet French cuisine and live music.',
      images: [
        'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80',
        'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=80'
      ],
      category: 'Dining & Nightlife',
      subcategories: ['Dinner Cruises', 'Romance', 'Fine Dining'],
      duration: '2.5 hours',
      location: {
        address: 'Port de la Bourdonnais, 75007 Paris',
        city: 'Paris',
        coordinates: { lat: 48.8607, lng: 2.2962 }
      },
      rating: {
        overall: 4.7,
        reviews: 5620,
        breakdown: {
          experience: 4.8,
          value: 4.5,
          food: 4.6,
          service: 4.7
        }
      },
      price: {
        adult: 120,
        child: 60,
        currency: 'EUR',
        inrEquivalent: 10800
      },
      availability: {
        instantConfirmation: true,
        mobileTicket: true,
        timeSlots: ['19:00', '20:30']
      },
      includes: [
        '3-course gourmet dinner',
        'Welcome glass of champagne',
        'Live music',
        'Window seating guarantee',
        'Coffee and petit fours'
      ],
      notIncluded: [
        'Additional drinks',
        'Hotel pickup',
        'Gratuities'
      ],
      languages: ['English', 'French'],
      dressCode: 'Smart casual',
      accessibility: 'Limited wheelchair accessibility',
      cancellationPolicy: 'Free cancellation up to 72 hours before start time',
      pointsEarned: 1200,
      highlights: [
        'Eiffel Tower illuminations',
        'Notre-Dame Cathedral',
        'Gourmet French cuisine',
        'Live piano music',
        'Champagne toast'
      ],
      meetingPoint: 'Port de la Bourdonnais dock',
      importantInfo: [
        'Smart casual dress code',
        'Arrive 30 minutes early for boarding',
        'Menu can accommodate dietary restrictions with advance notice',
        'Outdoor seating available (weather permitting)'
      ],
      menuSample: {
        starter: 'Foie gras terrine or Fresh oysters',
        main: 'Beef tenderloin or Sea bass fillet',
        dessert: 'Crème brûlée or Chocolate fondant'
      }
    }
  ];
}

async function getActivityDetails(activityId) {
  // Fetch comprehensive activity details
  return { id: activityId };
}

async function createActivityBooking(bookingData) {
  const basePrice = 65; // Get from activity data
  const totalPrice = basePrice * bookingData.participants.length;
  const pointsDiscount = bookingData.useRewardPoints ? 500 : 0;
  const finalPrice = totalPrice - pointsDiscount;
  const pointsEarned = Math.round(finalPrice * 0.08);

  return {
    id: 'activitybooking_' + Date.now(),
    confirmationCode: 'ACT' + Math.random().toString(36).substr(2, 9).toUpperCase(),
    status: 'CONFIRMED',
    activityId: bookingData.activityId,
    date: bookingData.date,
    timeSlot: bookingData.timeSlot,
    participants: bookingData.participants,
    totalPrice: finalPrice,
    pointsUsed: bookingData.useRewardPoints ? 5000 : 0,
    pointsEarned: pointsEarned,
    bookingDate: new Date()
  };
}

module.exports = router;