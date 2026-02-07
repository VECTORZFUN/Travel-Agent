// backend/routes/ai.js
const express = require('express');
const router = express.Router();

// AI Chat endpoint - integrates with Claude API
router.post('/chat', async (req, res) => {
  try {
    const { message, conversationHistory, userPreferences } = req.body;

    // Call Anthropic Claude API
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2000,
        system: `You are TravelAI, an expert travel booking assistant. You help users plan trips by:
        - Searching for flights, hotels, activities, and transportation
        - Creating customized travel packages
        - Providing cost-effective recommendations
        - Maximizing their ExtraMiles rewards points
        - Offering insider tips and local knowledge
        
        User preferences: ${JSON.stringify(userPreferences)}
        
        When creating packages, always include:
        - Estimated costs and savings
        - ExtraMiles points earned
        - Detailed itinerary suggestions
        - Booking recommendations
        
        Be conversational, helpful, and proactive in suggesting improvements to their travel plans.`,
        messages: [
          ...conversationHistory,
          { role: "user", content: message }
        ]
      })
    });

    const data = await response.json();
    const aiMessage = data.content[0].text;

    // Parse AI response for travel recommendations
    const travelData = await parseAIResponse(aiMessage, message);

    res.json({
      message: aiMessage,
      travelData,
      timestamp: new Date()
    });

  } catch (error) {
    console.error('AI Chat Error:', error);
    res.status(500).json({ error: 'Failed to process AI request' });
  }
});

// Parse AI response and extract structured travel data
async function parseAIResponse(aiMessage, userMessage) {
  const travelData = {
    destination: null,
    dates: null,
    budget: null,
    preferences: [],
    suggestedPackages: []
  };

  // Extract destination
  const destinationMatch = aiMessage.match(/(?:to|visit|traveling to|going to)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/);
  if (destinationMatch) {
    travelData.destination = destinationMatch[1];
  }

  // Extract budget preference
  if (aiMessage.toLowerCase().includes('budget') || aiMessage.toLowerCase().includes('economy')) {
    travelData.budget = 'economy';
  } else if (aiMessage.toLowerCase().includes('luxury') || aiMessage.toLowerCase().includes('premium')) {
    travelData.budget = 'luxury';
  } else {
    travelData.budget = 'medium';
  }

  // If destination found, trigger search for real data
  if (travelData.destination) {
    // This would call actual flight/hotel APIs
    // For now, return structured data for frontend
    travelData.suggestedPackages = await generatePackageSuggestions(travelData);
  }

  return travelData;
}

// Generate package suggestions based on parsed data
async function generatePackageSuggestions(travelData) {
  // This would integrate with actual travel APIs
  // Placeholder for demonstration
  return [];
}

// Generate travel package from user preferences
router.post('/generate-package', async (req, res) => {
  try {
    const { destination, startDate, endDate, budget, travelers, preferences } = req.body;

    // Parallel API calls for comprehensive package
    const [flights, hotels, activities, transport] = await Promise.all([
      searchFlights(destination, startDate, endDate, budget),
      searchHotels(destination, startDate, endDate, budget, travelers),
      searchActivities(destination, preferences),
      getTransportOptions(destination)
    ]);

    // Calculate package pricing and points
    const packageData = {
      destination,
      duration: calculateDuration(startDate, endDate),
      flights,
      hotels,
      activities,
      transport,
      totalCost: calculateTotalCost(flights, hotels, activities, transport),
      savings: calculateSavings(flights, hotels, activities, transport),
      pointsEarned: calculatePoints(flights, hotels, activities, transport, budget),
      createdAt: new Date()
    };

    res.json(packageData);

  } catch (error) {
    console.error('Package Generation Error:', error);
    res.status(500).json({ error: 'Failed to generate package' });
  }
});

// Helper functions (to be implemented with actual API integrations)
async function searchFlights(destination, startDate, endDate, budget) {
  // Integrate with Amadeus, Skyscanner, or Duffel API
  return {
    outbound: {
      from: "DEL",
      to: "CDG",
      date: startDate,
      price: 850,
      airline: "Air France",
      class: budget === 'luxury' ? 'Business' : budget === 'economy' ? 'Economy' : 'Premium Economy'
    },
    return: {
      from: "CDG",
      to: "DEL",
      date: endDate,
      price: 850,
      airline: "Air France"
    }
  };
}

async function searchHotels(destination, checkIn, checkOut, budget, travelers) {
  // Integrate with Booking.com or Expedia API
  return [
    {
      name: "Premium Hotel",
      rating: 4.5,
      pricePerNight: budget === 'luxury' ? 300 : budget === 'economy' ? 80 : 180,
      amenities: ["WiFi", "Breakfast", "Pool"]
    }
  ];
}

async function searchActivities(destination, preferences) {
  // Integrate with GetYourGuide or Viator API
  return [];
}

async function getTransportOptions(destination) {
  // Local transport options
  return {
    type: "Metro Pass + Airport Transfer",
    price: 85
  };
}

function calculateDuration(start, end) {
  const days = Math.ceil((new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24));
  return `${days} Days, ${days - 1} Nights`;
}

function calculateTotalCost(...services) {
  let total = 0;
  services.forEach(service => {
    if (Array.isArray(service)) {
      service.forEach(item => total += item.price || item.pricePerNight || 0);
    } else if (service.price) {
      total += service.price;
    } else if (service.outbound) {
      total += service.outbound.price + service.return.price;
    }
  });
  return total;
}

function calculateSavings(...services) {
  const total = calculateTotalCost(...services);
  return Math.round(total * 0.15); // 15% package discount
}

function calculatePoints(flights, hotels, activities, transport, budget) {
  const total = calculateTotalCost(flights, hotels, activities, transport);
  const multiplier = budget === 'luxury' ? 3 : budget === 'economy' ? 1 : 2;
  return Math.round(total * multiplier);
}

module.exports = router;