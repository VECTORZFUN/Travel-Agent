import React, { useState, useEffect } from 'react';
import { Search, Plane, Hotel, Train, Car, Ticket, Sparkles, ChevronRight, Star, MapPin, Calendar, Users, CreditCard, Trophy, Gift, TrendingUp, MessageSquare, Wand2, Package, Clock, DollarSign, Check } from 'lucide-react';

const TravelAIAgent = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [rewardPoints, setRewardPoints] = useState(12450);
  const [currentPackage, setCurrentPackage] = useState(null);
  const [userPreferences, setUserPreferences] = useState({
    budget: 'medium',
    travelStyle: 'balanced'
  });

  // Simulated AI response with travel recommendations
  const generateAIResponse = async (userMessage) => {
    setIsLoading(true);
    
    // Simulate API call to Claude
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Generate contextual response based on user input
    const lowerMsg = userMessage.toLowerCase();
    
    if (lowerMsg.includes('paris') || lowerMsg.includes('france')) {
      return {
        text: "I've curated a premium Paris getaway for you! Based on your preferences, I've found excellent options that balance luxury with value. You'll earn 2,500 ExtraMiles points on this booking.",
        package: {
          destination: "Paris, France",
          duration: "5 Days, 4 Nights",
          totalCost: 2450,
          savings: 380,
          pointsEarned: 2500,
          image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80",
          flights: {
            outbound: "Delhi → Paris CDG",
            return: "Paris CDG → Delhi",
            airline: "Air France",
            class: "Premium Economy",
            price: 950,
            departure: "Mar 15, 2026 - 2:30 PM",
            arrival: "Mar 15, 2026 - 8:45 PM"
          },
          hotel: {
            name: "Le Marais Boutique Hotel",
            rating: 4.7,
            location: "Le Marais District",
            amenities: ["Free WiFi", "Breakfast", "City View", "24/7 Concierge"],
            price: 180,
            pricePerNight: 180,
            nights: 4
          },
          activities: [
            {
              name: "Skip-the-Line Eiffel Tower Summit",
              price: 65,
              duration: "2 hours",
              rating: 4.9,
              image: "https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=400&q=80"
            },
            {
              name: "Louvre Museum Guided Tour",
              price: 75,
              duration: "3 hours",
              rating: 4.8,
              image: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=400&q=80"
            },
            {
              name: "Seine River Dinner Cruise",
              price: 120,
              duration: "2.5 hours",
              rating: 4.7,
              image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&q=80"
            }
          ],
          transport: {
            type: "Paris Metro Pass + Airport Transfer",
            price: 85,
            details: "5-day unlimited metro access + private airport pickup/drop-off"
          }
        }
      };
    } else if (lowerMsg.includes('budget') || lowerMsg.includes('cheap') || lowerMsg.includes('affordable')) {
      return {
        text: "I've optimized your search for maximum value! Here are some budget-friendly options that don't compromise on experience. These selections will help you save while earning ExtraMiles points.",
        recommendations: [
          "Consider mid-week flights (Tue-Thu) for 30-40% savings",
          "Book hotels in emerging neighborhoods for authentic experiences at lower costs",
          "Use local transport passes instead of taxis",
          "Book activities in advance online for early-bird discounts"
        ]
      };
    } else if (lowerMsg.includes('luxury') || lowerMsg.includes('premium') || lowerMsg.includes('5 star')) {
      return {
        text: "Excellent choice! I'm curating premium experiences that match your refined taste. These luxury options come with enhanced ExtraMiles earning rates (3x points).",
        recommendations: [
          "First Class & Business Class flights with lounge access",
          "5-star hotels in prime locations",
          "Private guided tours and exclusive experiences",
          "Chauffeur services and luxury transfers"
        ]
      };
    } else if (lowerMsg.includes('points') || lowerMsg.includes('rewards') || lowerMsg.includes('miles')) {
      return {
        text: `You currently have ${rewardPoints.toLocaleString()} ExtraMiles points! Here's how you can use them:`,
        recommendations: [
          "5,000 points = ₹500 off any booking",
          "10,000 points = Free hotel upgrade",
          "15,000 points = ₹2,000 flight voucher",
          "20,000 points = Complimentary airport lounge access for a year"
        ]
      };
    }
    
    return {
      text: "I'd be happy to help you plan your perfect trip! I can assist with flights, hotels, local transportation, activities, and create customized packages. Where would you like to go, and what's your travel style? I'll make sure you maximize your ExtraMiles rewards too!",
      recommendations: [
        "Tell me your destination and travel dates",
        "Share your budget preferences (economy, mid-range, or luxury)",
        "Let me know your interests (culture, adventure, relaxation, food)",
        "I'll curate a personalized package with the best value"
      ]
    };
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = {
      role: 'user',
      content: input
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');

    const response = await generateAIResponse(input);
    
    const aiMessage = {
      role: 'assistant',
      content: response.text,
      recommendations: response.recommendations,
      package: response.package
    };

    setMessages(prev => [...prev, aiMessage]);
    
    if (response.package) {
      setCurrentPackage(response.package);
      setActiveTab('package');
    }
    
    setIsLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const PackageView = ({ pkg }) => (
    <div className="space-y-6 animate-fadeIn">
      {/* Hero Image */}
      <div className="relative h-80 rounded-2xl overflow-hidden">
        <img 
          src={pkg.image} 
          alt={pkg.destination}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          <h2 className="text-4xl font-bold mb-2">{pkg.destination}</h2>
          <p className="text-xl opacity-90">{pkg.duration}</p>
        </div>
        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur px-4 py-2 rounded-full flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-500" />
          <span className="font-semibold text-gray-900">+{pkg.pointsEarned.toLocaleString()} Points</span>
        </div>
      </div>

      {/* Price Summary */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100">
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-gray-600 text-sm">Total Package Price</p>
            <p className="text-4xl font-bold text-gray-900">₹{pkg.totalCost.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-green-600 text-sm font-semibold">You Save ₹{pkg.savings}</p>
            <p className="text-gray-500 text-xs">vs booking separately</p>
          </div>
        </div>
        <div className="flex gap-4">
          <button className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl">
            Book Complete Package
          </button>
          <button className="px-6 py-4 border-2 border-indigo-600 text-indigo-600 rounded-xl font-semibold hover:bg-indigo-50 transition-all">
            Customize
          </button>
        </div>
      </div>

      {/* Flights */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <Plane className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Flights</h3>
            <p className="text-sm text-gray-500">{pkg.flights.airline} • {pkg.flights.class}</p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-2xl font-bold text-gray-900">₹{pkg.flights.price}</p>
          </div>
        </div>
        <div className="space-y-3 bg-gray-50 rounded-xl p-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-semibold">{pkg.flights.outbound}</p>
              <p className="text-sm text-gray-600">{pkg.flights.departure}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
          <div className="border-t border-gray-200 pt-3">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold">{pkg.flights.return}</p>
                <p className="text-sm text-gray-600">Return flight details</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Hotel */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
            <Hotel className="w-5 h-5 text-purple-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold">{pkg.hotel.name}</h3>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="text-sm font-semibold">{pkg.hotel.rating}</span>
              </div>
              <span className="text-gray-400">•</span>
              <MapPin className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">{pkg.hotel.location}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900">₹{pkg.hotel.price * pkg.hotel.nights}</p>
            <p className="text-sm text-gray-500">₹{pkg.hotel.pricePerNight}/night × {pkg.hotel.nights}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {pkg.hotel.amenities.map((amenity, idx) => (
            <span key={idx} className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm">
              {amenity}
            </span>
          ))}
        </div>
      </div>

      {/* Activities */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <Ticket className="w-5 h-5 text-green-600" />
          </div>
          <h3 className="text-lg font-bold">Activities & Experiences</h3>
        </div>
        <div className="grid gap-4">
          {pkg.activities.map((activity, idx) => (
            <div key={idx} className="flex gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
              <img 
                src={activity.image} 
                alt={activity.name}
                className="w-24 h-24 object-cover rounded-lg"
              />
              <div className="flex-1">
                <h4 className="font-semibold mb-1">{activity.name}</h4>
                <div className="flex items-center gap-3 text-sm text-gray-600 mb-2">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {activity.duration}
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    {activity.rating}
                  </div>
                </div>
                <p className="text-lg font-bold text-gray-900">₹{activity.price}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Transport */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
            <Car className="w-5 h-5 text-orange-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold">{pkg.transport.type}</h3>
            <p className="text-sm text-gray-600">{pkg.transport.details}</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">₹{pkg.transport.price}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Premium Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  TravelAI
                </h1>
                <p className="text-sm text-gray-500">Your Premium Travel Companion</p>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-50 to-orange-50 rounded-full border border-amber-200">
                <Trophy className="w-5 h-5 text-amber-600" />
                <span className="font-bold text-gray-900">{rewardPoints.toLocaleString()}</span>
                <span className="text-sm text-gray-600">ExtraMiles</span>
              </div>
              
              <div className="flex gap-2">
                <button 
                  onClick={() => setActiveTab('chat')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    activeTab === 'chat' 
                      ? 'bg-indigo-100 text-indigo-700' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <MessageSquare className="w-4 h-4 inline mr-2" />
                  Chat
                </button>
                <button 
                  onClick={() => setActiveTab('package')}
                  disabled={!currentPackage}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    activeTab === 'package' 
                      ? 'bg-indigo-100 text-indigo-700' 
                      : 'text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed'
                  }`}
                >
                  <Package className="w-4 h-4 inline mr-2" />
                  Package
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'chat' ? (
          <div className="max-w-4xl mx-auto">
            {/* Chat Messages */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 mb-6 h-[600px] overflow-y-auto">
              <div className="p-6 space-y-6">
                {messages.length === 0 ? (
                  <div className="text-center py-20">
                    <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Wand2 className="w-10 h-10 text-indigo-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      Welcome to TravelAI
                    </h3>
                    <p className="text-gray-600 mb-8 max-w-md mx-auto">
                      Your AI-powered travel assistant. Tell me where you'd like to go, and I'll curate the perfect journey for you.
                    </p>
                    <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
                      {[
                        { icon: Plane, text: "Plan a trip to Paris", color: "blue" },
                        { icon: DollarSign, text: "Show budget options", color: "green" },
                        { icon: Star, text: "Luxury experiences", color: "purple" },
                        { icon: Gift, text: "Use my reward points", color: "amber" }
                      ].map((item, idx) => (
                        <button
                          key={idx}
                          onClick={() => setInput(item.text)}
                          className={`p-4 bg-${item.color}-50 hover:bg-${item.color}-100 border border-${item.color}-200 rounded-xl transition-all text-left group`}
                        >
                          <item.icon className={`w-6 h-6 text-${item.color}-600 mb-2`} />
                          <p className="font-medium text-gray-900">{item.text}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  messages.map((msg, idx) => (
                    <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      {msg.role === 'assistant' && (
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <Sparkles className="w-5 h-5 text-white" />
                        </div>
                      )}
                      <div className={`max-w-2xl ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-900'} rounded-2xl p-4`}>
                        <p className="mb-3">{msg.content}</p>
                        {msg.recommendations && (
                          <div className="space-y-2 mt-4 pt-4 border-t border-gray-200">
                            {msg.recommendations.map((rec, i) => (
                              <div key={i} className="flex items-start gap-2">
                                <Check className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                                <p className="text-sm">{rec}</p>
                              </div>
                            ))}
                          </div>
                        )}
                        {msg.package && (
                          <button
                            onClick={() => setActiveTab('package')}
                            className="mt-4 w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                          >
                            View Complete Package
                            <ChevronRight className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                      {msg.role === 'user' && (
                        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                          <Users className="w-5 h-5 text-gray-600" />
                        </div>
                      )}
                    </div>
                  ))
                )}
                {isLoading && (
                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div className="bg-gray-100 rounded-2xl p-4">
                      <div className="flex gap-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Input Box */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Tell me about your dream trip..."
                  className="flex-1 px-4 py-3 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  disabled={isLoading}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={isLoading || !input.trim()}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                  <Sparkles className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            {currentPackage ? (
              <PackageView pkg={currentPackage} />
            ) : (
              <div className="text-center py-20">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No package selected. Start chatting to create your custom travel package!</p>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default TravelAIAgent;