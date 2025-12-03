import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback, useRef } from "react";
import { jsPDF } from "jspdf";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import {
  Check,
  X,
  MapPin,
  Utensils,
  Compass,
  Home,
  Car,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Trash2,
  RefreshCw,
  Loader2,
  Award,
  PartyPopper,
  Plane,
  RotateCcw,
  Star,
  ExternalLink,
  Info,
  Clock,
  DollarSign,
  Building2,
  Camera,
  Bed,
  Bus,
  Plus,
  GripVertical,
  Download,
  Mail,
  CalendarPlus,
  Map,
  Navigation,
  Coffee,
  ShoppingBag,
  Landmark,
  Music,
  TreePine,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  Volume1,
  Menu,
} from "lucide-react";
import { LandingPage } from "@/components/landing/LandingPage";
import { useTheme } from "@/contexts/ThemeContext";
import { useSound } from "@/contexts/SoundContext";
// ORM imports removed - using local state only for swipe tracking
import {
  useGenerateItineraryMutation,
  type TravelItinerary,
  type ItineraryDay,
  type Activity,
} from "@/hooks/use-google-gemini-chat";

export const Route = createFileRoute("/")({
  component: App,
});

// Category definitions
type CategoryName = "Locations" | "Food" | "Activities" | "Accommodations" | "Transportation" | "Vibes";

interface TravelCard {
  id: string;
  category: CategoryName;
  title: string;
  description: string;
  imageUrl: string;
  tags: string[];
}

// Hardcoded sample travel cards - 50 per category for locations, food, activities, accommodations, vibes; 15 for transportation
const TRAVEL_CARDS: TravelCard[] = [
  // ===== LOCATIONS (50 cards) =====
  { id: "loc-1", category: "Locations", title: "Tokyo, Japan", description: "A vibrant metropolis blending ancient traditions with cutting-edge technology", imageUrl: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800", tags: ["urban", "culture", "modern", "asia"] },
  { id: "loc-2", category: "Locations", title: "Santorini, Greece", description: "Iconic white-washed buildings with stunning Mediterranean sunsets", imageUrl: "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=800", tags: ["beach", "romantic", "mediterranean", "scenic"] },
  { id: "loc-3", category: "Locations", title: "Bali, Indonesia", description: "Tropical paradise with lush rice terraces and spiritual temples", imageUrl: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800", tags: ["tropical", "spiritual", "nature", "asia"] },
  { id: "loc-4", category: "Locations", title: "New York City, USA", description: "The city that never sleeps - iconic skyline and endless entertainment", imageUrl: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800", tags: ["urban", "nightlife", "culture", "shopping"] },
  { id: "loc-5", category: "Locations", title: "Paris, France", description: "The city of love with world-class art, cuisine, and architecture", imageUrl: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800", tags: ["romantic", "culture", "art", "europe"] },
  { id: "loc-6", category: "Locations", title: "Barcelona, Spain", description: "Gaudí architecture, beaches, and vibrant nightlife", imageUrl: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800", tags: ["beach", "culture", "nightlife", "europe"] },
  { id: "loc-7", category: "Locations", title: "Sydney, Australia", description: "Iconic Opera House, stunning harbor, and laid-back beach vibes", imageUrl: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800", tags: ["beach", "urban", "modern", "oceania"] },
  { id: "loc-8", category: "Locations", title: "Machu Picchu, Peru", description: "Ancient Incan citadel high in the Andes mountains", imageUrl: "https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=800", tags: ["adventure", "history", "nature", "south-america"] },
  { id: "loc-9", category: "Locations", title: "Dubai, UAE", description: "Ultra-modern city with towering skyscrapers and luxury shopping", imageUrl: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800", tags: ["luxury", "modern", "shopping", "middle-east"] },
  { id: "loc-10", category: "Locations", title: "Amsterdam, Netherlands", description: "Charming canals, cycling culture, and world-class museums", imageUrl: "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=800", tags: ["culture", "relaxing", "art", "europe"] },
  { id: "loc-11", category: "Locations", title: "Reykjavik, Iceland", description: "Gateway to Northern Lights and dramatic volcanic landscapes", imageUrl: "https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=800", tags: ["nature", "adventure", "unique", "europe"] },
  { id: "loc-12", category: "Locations", title: "Cape Town, South Africa", description: "Table Mountain, vineyards, and stunning coastal scenery", imageUrl: "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800", tags: ["nature", "adventure", "scenic", "africa"] },
  { id: "loc-13", category: "Locations", title: "Kyoto, Japan", description: "Ancient temples, traditional gardens, and geisha culture", imageUrl: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800", tags: ["culture", "spiritual", "history", "asia"] },
  { id: "loc-14", category: "Locations", title: "Maldives", description: "Crystal-clear waters and overwater bungalows in paradise", imageUrl: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800", tags: ["beach", "luxury", "romantic", "tropical"] },
  { id: "loc-15", category: "Locations", title: "Rome, Italy", description: "Eternal city with ancient ruins, art, and incredible food", imageUrl: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800", tags: ["history", "culture", "food", "europe"] },
  { id: "loc-16", category: "Locations", title: "Prague, Czech Republic", description: "Fairytale architecture and rich bohemian culture", imageUrl: "https://images.unsplash.com/photo-1541849546-216549ae216d?w=800", tags: ["history", "culture", "romantic", "europe"] },
  { id: "loc-17", category: "Locations", title: "Marrakech, Morocco", description: "Bustling souks, riads, and vibrant colors", imageUrl: "https://images.unsplash.com/photo-1539020140153-e479b8c22e70?w=800", tags: ["culture", "adventure", "unique", "africa"] },
  { id: "loc-18", category: "Locations", title: "Vancouver, Canada", description: "Mountains meet ocean in this stunning Pacific coast city", imageUrl: "https://images.unsplash.com/photo-1609825488888-3a766db05542?w=800", tags: ["nature", "urban", "outdoors", "north-america"] },
  { id: "loc-19", category: "Locations", title: "Singapore", description: "Futuristic gardens, street food, and cultural diversity", imageUrl: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800", tags: ["modern", "food", "urban", "asia"] },
  { id: "loc-20", category: "Locations", title: "Lisbon, Portugal", description: "Colorful tiles, steep hills, and pastéis de nata", imageUrl: "https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=800", tags: ["culture", "food", "relaxing", "europe"] },
  { id: "loc-21", category: "Locations", title: "Queenstown, New Zealand", description: "Adventure capital surrounded by mountains and lakes", imageUrl: "https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=800", tags: ["adventure", "nature", "extreme", "oceania"] },
  { id: "loc-22", category: "Locations", title: "Havana, Cuba", description: "Vintage cars, salsa music, and colonial architecture", imageUrl: "https://images.unsplash.com/photo-1500759285222-a95626b934cb?w=800", tags: ["culture", "history", "unique", "caribbean"] },
  { id: "loc-23", category: "Locations", title: "Swiss Alps, Switzerland", description: "Pristine mountain peaks, skiing, and chocolate", imageUrl: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800", tags: ["nature", "adventure", "luxury", "europe"] },
  { id: "loc-24", category: "Locations", title: "Petra, Jordan", description: "Ancient rose-red city carved into cliffs", imageUrl: "https://images.unsplash.com/photo-1548786811-dd6e453ccca7?w=800", tags: ["history", "adventure", "unique", "middle-east"] },
  { id: "loc-25", category: "Locations", title: "Amalfi Coast, Italy", description: "Dramatic cliffside villages and Mediterranean charm", imageUrl: "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=800", tags: ["scenic", "romantic", "beach", "europe"] },
  { id: "loc-26", category: "Locations", title: "Bangkok, Thailand", description: "Temples, street food, and bustling markets", imageUrl: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800", tags: ["culture", "food", "budget", "asia"] },
  { id: "loc-27", category: "Locations", title: "Buenos Aires, Argentina", description: "Tango, steaks, and European-influenced architecture", imageUrl: "https://images.unsplash.com/photo-1589909202802-8f4aadce1849?w=800", tags: ["culture", "food", "nightlife", "south-america"] },
  { id: "loc-28", category: "Locations", title: "Edinburgh, Scotland", description: "Medieval old town and dramatic castle on the hill", imageUrl: "https://images.unsplash.com/photo-1506377585622-bedcbb027afc?w=800", tags: ["history", "culture", "scenic", "europe"] },
  { id: "loc-29", category: "Locations", title: "Hanoi, Vietnam", description: "Charming old quarter, pho, and French colonial legacy", imageUrl: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800", tags: ["culture", "food", "budget", "asia"] },
  { id: "loc-30", category: "Locations", title: "Dubrovnik, Croatia", description: "King's Landing in real life with stunning Adriatic views", imageUrl: "https://images.unsplash.com/photo-1580502304784-8985b7eb7260?w=800", tags: ["history", "beach", "scenic", "europe"] },
  { id: "loc-31", category: "Locations", title: "Cartagena, Colombia", description: "Colorful colonial streets and Caribbean vibes", imageUrl: "https://images.unsplash.com/photo-1533042787681-17445dc684b0?w=800", tags: ["culture", "beach", "romantic", "south-america"] },
  { id: "loc-32", category: "Locations", title: "Vienna, Austria", description: "Imperial palaces, coffee houses, and classical music", imageUrl: "https://images.unsplash.com/photo-1516550893923-42d28e5677af?w=800", tags: ["culture", "history", "luxury", "europe"] },
  { id: "loc-33", category: "Locations", title: "Seychelles", description: "Pristine beaches with unique granite boulders", imageUrl: "https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?w=800", tags: ["beach", "luxury", "romantic", "tropical"] },
  { id: "loc-34", category: "Locations", title: "Jaipur, India", description: "Pink City with magnificent palaces and forts", imageUrl: "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800", tags: ["culture", "history", "unique", "asia"] },
  { id: "loc-35", category: "Locations", title: "Copenhagen, Denmark", description: "Hygge lifestyle, design, and Tivoli Gardens", imageUrl: "https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?w=800", tags: ["culture", "relaxing", "modern", "europe"] },
  { id: "loc-36", category: "Locations", title: "Cinque Terre, Italy", description: "Five colorful fishing villages on the Italian Riviera", imageUrl: "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=800", tags: ["scenic", "relaxing", "romantic", "europe"] },
  { id: "loc-37", category: "Locations", title: "Zanzibar, Tanzania", description: "Spice island with pristine beaches and Stone Town", imageUrl: "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800", tags: ["beach", "culture", "tropical", "africa"] },
  { id: "loc-38", category: "Locations", title: "Bruges, Belgium", description: "Medieval fairy tale with canals and chocolate", imageUrl: "https://images.unsplash.com/photo-1491557345352-5929e343eb89?w=800", tags: ["romantic", "history", "relaxing", "europe"] },
  { id: "loc-39", category: "Locations", title: "Patagonia, Argentina/Chile", description: "End of the world wilderness with glaciers and peaks", imageUrl: "https://images.unsplash.com/photo-1531761535209-180857e963b9?w=800", tags: ["nature", "adventure", "remote", "south-america"] },
  { id: "loc-40", category: "Locations", title: "Hoi An, Vietnam", description: "Ancient trading port with lantern-lit streets", imageUrl: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800", tags: ["culture", "romantic", "relaxing", "asia"] },
  { id: "loc-41", category: "Locations", title: "Florence, Italy", description: "Renaissance art capital with Duomo and David", imageUrl: "https://images.unsplash.com/photo-1541370976299-4d24ebbc9077?w=800", tags: ["art", "culture", "history", "europe"] },
  { id: "loc-42", category: "Locations", title: "Phuket, Thailand", description: "Beautiful beaches and vibrant nightlife", imageUrl: "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=800", tags: ["beach", "nightlife", "budget", "asia"] },
  { id: "loc-43", category: "Locations", title: "Morocco Desert", description: "Sahara dunes, starry nights, and Berber camps", imageUrl: "https://images.unsplash.com/photo-1509023464722-18d996393ca8?w=800", tags: ["adventure", "unique", "nature", "africa"] },
  { id: "loc-44", category: "Locations", title: "San Francisco, USA", description: "Golden Gate, cable cars, and tech innovation hub", imageUrl: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800", tags: ["urban", "culture", "modern", "north-america"] },
  { id: "loc-45", category: "Locations", title: "Budapest, Hungary", description: "Thermal baths, ruin bars, and Danube views", imageUrl: "https://images.unsplash.com/photo-1551867633-194f125bddfa?w=800", tags: ["culture", "nightlife", "budget", "europe"] },
  { id: "loc-46", category: "Locations", title: "Fiji Islands", description: "Remote paradise with warm waters and friendly locals", imageUrl: "https://images.unsplash.com/photo-1584811644165-33db3b146db5?w=800", tags: ["beach", "tropical", "relaxing", "oceania"] },
  { id: "loc-47", category: "Locations", title: "Salzburg, Austria", description: "Sound of Music landscapes and Mozart's birthplace", imageUrl: "https://images.unsplash.com/photo-1547154896-5e5e5e5e5e5e?w=800", tags: ["culture", "scenic", "history", "europe"] },
  { id: "loc-48", category: "Locations", title: "Siem Reap, Cambodia", description: "Gateway to the magnificent temples of Angkor", imageUrl: "https://images.unsplash.com/photo-1538485399081-7191377e8241?w=800", tags: ["history", "culture", "spiritual", "asia"] },
  { id: "loc-49", category: "Locations", title: "Lake Como, Italy", description: "Celebrity-favorite lake surrounded by Alps", imageUrl: "https://images.unsplash.com/photo-1553649033-3fbc8d0fa3cb?w=800", tags: ["luxury", "scenic", "romantic", "europe"] },
  { id: "loc-50", category: "Locations", title: "Galápagos Islands, Ecuador", description: "Unique wildlife and Darwin's living laboratory", imageUrl: "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800", tags: ["nature", "adventure", "unique", "south-america"] },

  // ===== FOOD (50 cards) =====
  { id: "food-1", category: "Food", title: "Street Tacos", description: "Authentic Mexican street food bursting with flavor", imageUrl: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=800", tags: ["street-food", "spicy", "casual", "latin"] },
  { id: "food-2", category: "Food", title: "Sushi Experience", description: "Fresh, artfully prepared Japanese cuisine", imageUrl: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800", tags: ["seafood", "fine-dining", "japanese", "healthy"] },
  { id: "food-3", category: "Food", title: "Italian Trattoria", description: "Homemade pasta and traditional family recipes", imageUrl: "https://images.unsplash.com/photo-1498579150354-977475b7ea0b?w=800", tags: ["comfort-food", "wine", "european", "pasta"] },
  { id: "food-4", category: "Food", title: "Local Food Markets", description: "Explore vibrant markets with fresh local produce", imageUrl: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=800", tags: ["local", "fresh", "authentic", "budget"] },
  { id: "food-5", category: "Food", title: "Fine Dining", description: "Michelin-star experience with innovative cuisine", imageUrl: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800", tags: ["luxury", "fine-dining", "gourmet", "special-occasion"] },
  { id: "food-6", category: "Food", title: "Thai Street Food", description: "Pad Thai, curries, and mango sticky rice", imageUrl: "https://images.unsplash.com/photo-1562565652-a0d8f0c59eb4?w=800", tags: ["street-food", "spicy", "asian", "budget"] },
  { id: "food-7", category: "Food", title: "French Patisserie", description: "Croissants, macarons, and delicate pastries", imageUrl: "https://images.unsplash.com/photo-1558326567-98ae2405596b?w=800", tags: ["desserts", "luxury", "european", "breakfast"] },
  { id: "food-8", category: "Food", title: "Indian Curry House", description: "Rich curries, tandoori, and aromatic spices", imageUrl: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800", tags: ["spicy", "vegetarian-friendly", "asian", "comfort-food"] },
  { id: "food-9", category: "Food", title: "Greek Taverna", description: "Fresh mezze, grilled meats, and Mediterranean flavors", imageUrl: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800", tags: ["mediterranean", "healthy", "casual", "european"] },
  { id: "food-10", category: "Food", title: "BBQ & Smokehouse", description: "Low and slow smoked meats and tangy sauces", imageUrl: "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=800", tags: ["meat", "casual", "american", "comfort-food"] },
  { id: "food-11", category: "Food", title: "Dim Sum Brunch", description: "Steamed dumplings and Chinese tea service", imageUrl: "https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=800", tags: ["asian", "brunch", "casual", "sharing"] },
  { id: "food-12", category: "Food", title: "Farm-to-Table", description: "Locally sourced, seasonal ingredients", imageUrl: "https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=800", tags: ["healthy", "sustainable", "local", "modern"] },
  { id: "food-13", category: "Food", title: "Seafood Feast", description: "Fresh catches, oysters, and ocean flavors", imageUrl: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800", tags: ["seafood", "fresh", "coastal", "special-occasion"] },
  { id: "food-14", category: "Food", title: "Korean BBQ", description: "Grill your own meats with banchan sides", imageUrl: "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=800", tags: ["interactive", "meat", "asian", "social"] },
  { id: "food-15", category: "Food", title: "Vegan Cuisine", description: "Creative plant-based dishes and flavors", imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800", tags: ["vegan", "healthy", "modern", "sustainable"] },
  { id: "food-16", category: "Food", title: "Spanish Tapas", description: "Small plates perfect for sharing and socializing", imageUrl: "https://images.unsplash.com/photo-1515443961218-a51367888e4b?w=800", tags: ["sharing", "wine", "european", "social"] },
  { id: "food-17", category: "Food", title: "Ramen Shop", description: "Steaming bowls of noodles in rich broth", imageUrl: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800", tags: ["japanese", "comfort-food", "casual", "asian"] },
  { id: "food-18", category: "Food", title: "Brunch Spot", description: "Eggs Benedict, avocado toast, and mimosas", imageUrl: "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=800", tags: ["brunch", "casual", "social", "breakfast"] },
  { id: "food-19", category: "Food", title: "Pizza Napoletana", description: "Wood-fired pizza with authentic Italian toppings", imageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800", tags: ["italian", "casual", "comfort-food", "european"] },
  { id: "food-20", category: "Food", title: "Moroccan Feast", description: "Tagines, couscous, and aromatic spices", imageUrl: "https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=800", tags: ["exotic", "spicy", "african", "unique"] },
  { id: "food-21", category: "Food", title: "Ice Cream & Gelato", description: "Artisanal frozen treats in creative flavors", imageUrl: "https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=800", tags: ["desserts", "casual", "sweet", "family"] },
  { id: "food-22", category: "Food", title: "Vietnamese Pho", description: "Aromatic noodle soup with fresh herbs", imageUrl: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800", tags: ["asian", "healthy", "comfort-food", "budget"] },
  { id: "food-23", category: "Food", title: "Steakhouse", description: "Premium cuts and classic sides", imageUrl: "https://images.unsplash.com/photo-1600891964092-4316c288032e?w=800", tags: ["meat", "luxury", "special-occasion", "american"] },
  { id: "food-24", category: "Food", title: "Food Truck Rally", description: "Diverse street eats from creative vendors", imageUrl: "https://images.unsplash.com/photo-1567129937968-cdad8f07e2f8?w=800", tags: ["street-food", "casual", "diverse", "budget"] },
  { id: "food-25", category: "Food", title: "Peruvian Ceviche", description: "Fresh seafood cured in citrus", imageUrl: "https://images.unsplash.com/photo-1535399831218-d5bd36d1a6b3?w=800", tags: ["seafood", "latin", "fresh", "healthy"] },
  { id: "food-26", category: "Food", title: "Ethiopian Injera", description: "Shared platters on spongy sourdough bread", imageUrl: "https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=800", tags: ["exotic", "sharing", "african", "vegetarian-friendly"] },
  { id: "food-27", category: "Food", title: "Cheese & Charcuterie", description: "Artisanal cheeses paired with cured meats", imageUrl: "https://images.unsplash.com/photo-1452195100486-9cc805987862?w=800", tags: ["wine", "sharing", "european", "romantic"] },
  { id: "food-28", category: "Food", title: "Middle Eastern Mezze", description: "Hummus, falafel, and pita spreads", imageUrl: "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=800", tags: ["vegetarian-friendly", "sharing", "healthy", "middle-eastern"] },
  { id: "food-29", category: "Food", title: "Brazilian Churrasco", description: "All-you-can-eat grilled meats served tableside", imageUrl: "https://images.unsplash.com/photo-1558030006-450675393462?w=800", tags: ["meat", "latin", "interactive", "feast"] },
  { id: "food-30", category: "Food", title: "Japanese Izakaya", description: "Small plates and drinks in a casual setting", imageUrl: "https://images.unsplash.com/photo-1553621042-f6e147245754?w=800", tags: ["japanese", "casual", "social", "sharing"] },
  { id: "food-31", category: "Food", title: "Southern Comfort", description: "Fried chicken, biscuits, and soul food", imageUrl: "https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=800", tags: ["comfort-food", "american", "casual", "hearty"] },
  { id: "food-32", category: "Food", title: "Breakfast Diner", description: "Classic American breakfast any time of day", imageUrl: "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=800", tags: ["breakfast", "casual", "american", "comfort-food"] },
  { id: "food-33", category: "Food", title: "Wine Tasting", description: "Sample local vintages with cheese pairings", imageUrl: "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=800", tags: ["wine", "luxury", "romantic", "european"] },
  { id: "food-34", category: "Food", title: "Turkish Kebabs", description: "Grilled meats with traditional accompaniments", imageUrl: "https://images.unsplash.com/photo-1561651823-34feb02250e4?w=800", tags: ["meat", "middle-eastern", "casual", "street-food"] },
  { id: "food-35", category: "Food", title: "Afternoon Tea", description: "Elegant tea service with scones and finger sandwiches", imageUrl: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800", tags: ["luxury", "british", "sweet", "special-occasion"] },
  { id: "food-36", category: "Food", title: "Cajun & Creole", description: "Spicy gumbo, jambalaya, and New Orleans flavor", imageUrl: "https://images.unsplash.com/photo-1604152135912-04a022e23696?w=800", tags: ["spicy", "american", "comfort-food", "unique"] },
  { id: "food-37", category: "Food", title: "Craft Beer & Gastropub", description: "Local brews paired with elevated pub fare", imageUrl: "https://images.unsplash.com/photo-1436076863939-06870fe779c2?w=800", tags: ["beer", "casual", "modern", "social"] },
  { id: "food-38", category: "Food", title: "Hawaiian Poke", description: "Fresh fish bowls with rice and toppings", imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800", tags: ["seafood", "healthy", "casual", "pacific"] },
  { id: "food-39", category: "Food", title: "Jewish Deli", description: "Pastrami, bagels, and matzo ball soup", imageUrl: "https://images.unsplash.com/photo-1592415499556-74fcb9f18667?w=800", tags: ["comfort-food", "american", "casual", "hearty"] },
  { id: "food-40", category: "Food", title: "Indonesian Nasi Goreng", description: "Fried rice with satay and local flavors", imageUrl: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800", tags: ["asian", "street-food", "casual", "spicy"] },
  { id: "food-41", category: "Food", title: "Bakery & Pastries", description: "Fresh bread, pastries, and baked goods", imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800", tags: ["breakfast", "sweet", "casual", "local"] },
  { id: "food-42", category: "Food", title: "Fondue Experience", description: "Melted cheese and chocolate for dipping", imageUrl: "https://images.unsplash.com/photo-1530610476181-d83430b64dcd?w=800", tags: ["swiss", "interactive", "romantic", "sharing"] },
  { id: "food-43", category: "Food", title: "Filipino Adobo", description: "Rich, tangy braised meats and tropical flavors", imageUrl: "https://images.unsplash.com/photo-1546069901-d5bfd2cbfb1f?w=800", tags: ["asian", "comfort-food", "unique", "casual"] },
  { id: "food-44", category: "Food", title: "Breakfast Burrito", description: "Morning fuel wrapped in a warm tortilla", imageUrl: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=800", tags: ["breakfast", "casual", "latin", "quick"] },
  { id: "food-45", category: "Food", title: "Caribbean Jerk", description: "Spicy grilled meats with island vibes", imageUrl: "https://images.unsplash.com/photo-1432139509613-5c4255815697?w=800", tags: ["spicy", "caribbean", "casual", "tropical"] },
  { id: "food-46", category: "Food", title: "Rooftop Dining", description: "Great views with your meal", imageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800", tags: ["scenic", "romantic", "luxury", "special-occasion"] },
  { id: "food-47", category: "Food", title: "German Beer Hall", description: "Pretzels, sausages, and steins of beer", imageUrl: "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=800", tags: ["beer", "european", "hearty", "social"] },
  { id: "food-48", category: "Food", title: "Omakase", description: "Chef's choice multi-course Japanese experience", imageUrl: "https://images.unsplash.com/photo-1580822184713-fc5400e7fe10?w=800", tags: ["japanese", "luxury", "fine-dining", "special-occasion"] },
  { id: "food-49", category: "Food", title: "Hot Pot", description: "Cook your own ingredients in simmering broth", imageUrl: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800", tags: ["asian", "interactive", "social", "sharing"] },
  { id: "food-50", category: "Food", title: "Food Hall", description: "Multiple cuisines under one roof", imageUrl: "https://images.unsplash.com/photo-1567521464027-f127ff144326?w=800", tags: ["diverse", "casual", "modern", "social"] },

  // ===== ACTIVITIES (50 cards) =====
  { id: "act-1", category: "Activities", title: "Beach & Surfing", description: "Ride the waves and soak up the sun", imageUrl: "https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=800", tags: ["beach", "adventure", "water-sports", "relaxing"] },
  { id: "act-2", category: "Activities", title: "Museum Hopping", description: "Discover art, history, and culture", imageUrl: "https://images.unsplash.com/photo-1554907984-15263bfd63bd?w=800", tags: ["culture", "art", "indoor", "educational"] },
  { id: "act-3", category: "Activities", title: "Mountain Hiking", description: "Trek through scenic trails and breathtaking views", imageUrl: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=800", tags: ["nature", "adventure", "fitness", "outdoors"] },
  { id: "act-4", category: "Activities", title: "Nightlife & Clubs", description: "Dance the night away in vibrant clubs", imageUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800", tags: ["nightlife", "party", "social", "urban"] },
  { id: "act-5", category: "Activities", title: "Spa & Wellness", description: "Relax and rejuvenate with luxury treatments", imageUrl: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800", tags: ["relaxing", "wellness", "luxury", "self-care"] },
  { id: "act-6", category: "Activities", title: "Scuba Diving", description: "Explore underwater worlds and coral reefs", imageUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800", tags: ["adventure", "water-sports", "nature", "unique"] },
  { id: "act-7", category: "Activities", title: "Cooking Class", description: "Learn to make local dishes from experts", imageUrl: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800", tags: ["food", "educational", "interactive", "culture"] },
  { id: "act-8", category: "Activities", title: "Hot Air Balloon", description: "Soar above landscapes at sunrise", imageUrl: "https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?w=800", tags: ["adventure", "scenic", "romantic", "unique"] },
  { id: "act-9", category: "Activities", title: "Wine Tasting Tour", description: "Sample vintages at local vineyards", imageUrl: "https://images.unsplash.com/photo-1474722883778-792e7990302f?w=800", tags: ["food", "relaxing", "romantic", "culture"] },
  { id: "act-10", category: "Activities", title: "Kayaking", description: "Paddle through rivers, lakes, or coastal waters", imageUrl: "https://images.unsplash.com/photo-1472745942893-4b9f730c7668?w=800", tags: ["adventure", "water-sports", "nature", "fitness"] },
  { id: "act-11", category: "Activities", title: "Safari", description: "Spot wildlife in their natural habitat", imageUrl: "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800", tags: ["adventure", "nature", "wildlife", "unique"] },
  { id: "act-12", category: "Activities", title: "Rock Climbing", description: "Scale natural rock formations or indoor walls", imageUrl: "https://images.unsplash.com/photo-1522163182402-834f871fd851?w=800", tags: ["adventure", "fitness", "extreme", "outdoors"] },
  { id: "act-13", category: "Activities", title: "City Walking Tour", description: "Explore neighborhoods with a local guide", imageUrl: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800", tags: ["culture", "educational", "urban", "local"] },
  { id: "act-14", category: "Activities", title: "Snorkeling", description: "Swim with colorful fish and marine life", imageUrl: "https://images.unsplash.com/photo-1682687982501-1e58ab814714?w=800", tags: ["beach", "water-sports", "nature", "relaxing"] },
  { id: "act-15", category: "Activities", title: "Photography Tour", description: "Capture stunning shots with expert guidance", imageUrl: "https://images.unsplash.com/photo-1502982720700-bfff97f2ecac?w=800", tags: ["art", "educational", "scenic", "creative"] },
  { id: "act-16", category: "Activities", title: "Zip Lining", description: "Fly through jungle canopies at high speed", imageUrl: "https://images.unsplash.com/photo-1515658323406-25d61c141a6e?w=800", tags: ["adventure", "extreme", "adrenaline", "nature"] },
  { id: "act-17", category: "Activities", title: "Yoga Retreat", description: "Find inner peace and flexibility", imageUrl: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800", tags: ["wellness", "relaxing", "spiritual", "fitness"] },
  { id: "act-18", category: "Activities", title: "Live Music & Concerts", description: "Experience local music scenes", imageUrl: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800", tags: ["nightlife", "culture", "social", "entertainment"] },
  { id: "act-19", category: "Activities", title: "Skiing & Snowboarding", description: "Hit the slopes in winter wonderlands", imageUrl: "https://images.unsplash.com/photo-1551524559-8af4e6624178?w=800", tags: ["adventure", "winter", "extreme", "outdoors"] },
  { id: "act-20", category: "Activities", title: "Temple Visits", description: "Explore sacred sites and spiritual places", imageUrl: "https://images.unsplash.com/photo-1528181304800-259b08848526?w=800", tags: ["spiritual", "culture", "history", "peaceful"] },
  { id: "act-21", category: "Activities", title: "Horseback Riding", description: "Explore trails on horseback", imageUrl: "https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=800", tags: ["adventure", "nature", "outdoors", "unique"] },
  { id: "act-22", category: "Activities", title: "Boat Tours", description: "See landmarks from the water", imageUrl: "https://images.unsplash.com/photo-1530866495561-507c9faab2ed?w=800", tags: ["scenic", "relaxing", "water", "sightseeing"] },
  { id: "act-23", category: "Activities", title: "Street Art Tour", description: "Discover urban murals and graffiti culture", imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800", tags: ["art", "urban", "culture", "walking"] },
  { id: "act-24", category: "Activities", title: "Paragliding", description: "Glide through the air with stunning views", imageUrl: "https://images.unsplash.com/photo-1622747868883-92e5b1e27f79?w=800", tags: ["extreme", "adventure", "adrenaline", "scenic"] },
  { id: "act-25", category: "Activities", title: "Theater & Shows", description: "Broadway, West End, or local performances", imageUrl: "https://images.unsplash.com/photo-1507924538820-ede94a04019d?w=800", tags: ["entertainment", "culture", "indoor", "art"] },
  { id: "act-26", category: "Activities", title: "Bungee Jumping", description: "Take the leap from great heights", imageUrl: "https://images.unsplash.com/photo-1569498539221-7962e90e84f5?w=800", tags: ["extreme", "adrenaline", "adventure", "unique"] },
  { id: "act-27", category: "Activities", title: "Local Markets", description: "Shop for crafts, souvenirs, and local goods", imageUrl: "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=800", tags: ["shopping", "culture", "local", "authentic"] },
  { id: "act-28", category: "Activities", title: "Sunset Cruise", description: "Watch the sun set from the water", imageUrl: "https://images.unsplash.com/photo-1500627965408-b5f300c67c2e?w=800", tags: ["romantic", "scenic", "relaxing", "water"] },
  { id: "act-29", category: "Activities", title: "Canyoneering", description: "Rappel down waterfalls and slot canyons", imageUrl: "https://images.unsplash.com/photo-1464207687429-7505649dae38?w=800", tags: ["extreme", "adventure", "nature", "fitness"] },
  { id: "act-30", category: "Activities", title: "Pottery Class", description: "Create your own ceramic souvenirs", imageUrl: "https://images.unsplash.com/photo-1606585488717-61ec99d28b5a?w=800", tags: ["creative", "educational", "relaxing", "unique"] },
  { id: "act-31", category: "Activities", title: "Volcano Hiking", description: "Trek up active or dormant volcanoes", imageUrl: "https://images.unsplash.com/photo-1462332420958-a05d1e002413?w=800", tags: ["adventure", "nature", "unique", "extreme"] },
  { id: "act-32", category: "Activities", title: "Whale Watching", description: "Spot majestic whales in their habitat", imageUrl: "https://images.unsplash.com/photo-1568430462989-44163eb1752f?w=800", tags: ["wildlife", "nature", "water", "unique"] },
  { id: "act-33", category: "Activities", title: "Theme Parks", description: "Roller coasters and family fun", imageUrl: "https://images.unsplash.com/photo-1513889961551-628c1e5e2ee9?w=800", tags: ["entertainment", "family", "adrenaline", "fun"] },
  { id: "act-34", category: "Activities", title: "Stand-Up Paddleboarding", description: "Glide across calm waters on a board", imageUrl: "https://images.unsplash.com/photo-1593351415075-3bac9f45c877?w=800", tags: ["water-sports", "fitness", "relaxing", "beach"] },
  { id: "act-35", category: "Activities", title: "Archaeological Sites", description: "Explore ancient ruins and historical excavations", imageUrl: "https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=800", tags: ["history", "educational", "culture", "unique"] },
  { id: "act-36", category: "Activities", title: "Casino Night", description: "Try your luck at the tables", imageUrl: "https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=800", tags: ["nightlife", "entertainment", "luxury", "social"] },
  { id: "act-37", category: "Activities", title: "Fishing Trip", description: "Cast a line in lakes, rivers, or the ocean", imageUrl: "https://images.unsplash.com/photo-1544552866-d3ed42536cfd?w=800", tags: ["nature", "relaxing", "outdoors", "water"] },
  { id: "act-38", category: "Activities", title: "Pub Crawl", description: "Bar hop through the best local spots", imageUrl: "https://images.unsplash.com/photo-1575444758702-4a6b9222336e?w=800", tags: ["nightlife", "social", "fun", "local"] },
  { id: "act-39", category: "Activities", title: "Meditation Retreat", description: "Disconnect and find mental clarity", imageUrl: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800", tags: ["wellness", "spiritual", "peaceful", "relaxing"] },
  { id: "act-40", category: "Activities", title: "Golf", description: "Tee off at scenic courses", imageUrl: "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=800", tags: ["outdoors", "relaxing", "luxury", "sport"] },
  { id: "act-41", category: "Activities", title: "Bird Watching", description: "Spot exotic species in their habitat", imageUrl: "https://images.unsplash.com/photo-1621631187457-aa2d15a8a1cb?w=800", tags: ["nature", "peaceful", "wildlife", "relaxing"] },
  { id: "act-42", category: "Activities", title: "Escape Rooms", description: "Solve puzzles to find your way out", imageUrl: "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=800", tags: ["entertainment", "indoor", "social", "fun"] },
  { id: "act-43", category: "Activities", title: "Desert Safari", description: "Dune bashing and Bedouin camps", imageUrl: "https://images.unsplash.com/photo-1451337516015-6b6e9a44a8a3?w=800", tags: ["adventure", "unique", "adrenaline", "nature"] },
  { id: "act-44", category: "Activities", title: "Waterfall Chasing", description: "Hike to spectacular cascading falls", imageUrl: "https://images.unsplash.com/photo-1494472155656-f34e81b17ddc?w=800", tags: ["nature", "hiking", "scenic", "adventure"] },
  { id: "act-45", category: "Activities", title: "Language Classes", description: "Learn basic phrases from locals", imageUrl: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800", tags: ["educational", "culture", "interactive", "local"] },
  { id: "act-46", category: "Activities", title: "Glacier Trekking", description: "Walk on ancient ice formations", imageUrl: "https://images.unsplash.com/photo-1489392191049-fc10c97e64b6?w=800", tags: ["adventure", "extreme", "nature", "unique"] },
  { id: "act-47", category: "Activities", title: "Stargazing", description: "View the night sky from dark sky locations", imageUrl: "https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?w=800", tags: ["nature", "peaceful", "romantic", "unique"] },
  { id: "act-48", category: "Activities", title: "Rafting", description: "Navigate rapids on exciting river runs", imageUrl: "https://images.unsplash.com/photo-1530866495561-507c9faab2ed?w=800", tags: ["adventure", "extreme", "water-sports", "adrenaline"] },
  { id: "act-49", category: "Activities", title: "Cultural Festivals", description: "Join local celebrations and traditions", imageUrl: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800", tags: ["culture", "unique", "social", "authentic"] },
  { id: "act-50", category: "Activities", title: "ATV & Off-Road", description: "Tear through trails on all-terrain vehicles", imageUrl: "https://images.unsplash.com/photo-1603386329225-868f9b1ee6c9?w=800", tags: ["adventure", "adrenaline", "outdoors", "extreme"] },

  // ===== ACCOMMODATIONS (15 cards - scaled back to reasonable options) =====
  { id: "acc-1", category: "Accommodations", title: "Boutique Hotel", description: "Charming, unique stays with personalized service", imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800", tags: ["unique", "stylish", "mid-range", "local"] },
  { id: "acc-2", category: "Accommodations", title: "Luxury Resort", description: "All-inclusive paradise with premium amenities", imageUrl: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800", tags: ["luxury", "all-inclusive", "pool", "service"] },
  { id: "acc-3", category: "Accommodations", title: "Cozy Airbnb", description: "Live like a local in a private apartment", imageUrl: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800", tags: ["local", "budget", "kitchen", "authentic"] },
  { id: "acc-4", category: "Accommodations", title: "Mountain Cabin", description: "Rustic retreat surrounded by nature", imageUrl: "https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=800", tags: ["nature", "cozy", "secluded", "romantic"] },
  { id: "acc-5", category: "Accommodations", title: "Beachfront Villa", description: "Wake up to ocean views and sandy beaches", imageUrl: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800", tags: ["beach", "luxury", "views", "private"] },
  { id: "acc-6", category: "Accommodations", title: "Budget Hostel", description: "Social dorms and budget-friendly stays", imageUrl: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800", tags: ["budget", "social", "backpacker", "basic"] },
  { id: "acc-7", category: "Accommodations", title: "City Center Hotel", description: "Convenient location near attractions", imageUrl: "https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?w=800", tags: ["convenient", "urban", "mid-range", "accessible"] },
  { id: "acc-8", category: "Accommodations", title: "Bed & Breakfast", description: "Homey stays with morning meals included", imageUrl: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800", tags: ["cozy", "breakfast", "local", "charming"] },
  { id: "acc-9", category: "Accommodations", title: "Eco Lodge", description: "Sustainable stays in natural settings", imageUrl: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800", tags: ["eco-friendly", "nature", "sustainable", "unique"] },
  { id: "acc-10", category: "Accommodations", title: "Family Resort", description: "Activities and pools for all ages", imageUrl: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800", tags: ["family", "pool", "activities", "convenient"] },
  { id: "acc-11", category: "Accommodations", title: "Serviced Apartment", description: "Home comforts for longer stays", imageUrl: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800", tags: ["convenient", "kitchen", "long-stay", "comfortable"] },
  { id: "acc-12", category: "Accommodations", title: "Wellness Retreat", description: "Focus on health and relaxation", imageUrl: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800", tags: ["wellness", "spa", "relaxing", "healthy"] },
  { id: "acc-13", category: "Accommodations", title: "Glamping Tent", description: "Camping with comfort and style", imageUrl: "https://images.unsplash.com/photo-1499696010180-025ef6e1a8f9?w=800", tags: ["unique", "nature", "adventure", "comfortable"] },
  { id: "acc-14", category: "Accommodations", title: "Historic Inn", description: "Charming stays in buildings with history", imageUrl: "https://images.unsplash.com/photo-1587381420270-3e1a5b9e6904?w=800", tags: ["history", "charming", "unique", "local"] },
  { id: "acc-15", category: "Accommodations", title: "Ski Chalet", description: "Cozy mountain retreat with fireplace", imageUrl: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800", tags: ["winter", "cozy", "mountain", "romantic"] },

  // ===== TRANSPORTATION (6 cards) =====
  { id: "trans-1", category: "Transportation", title: "Public Transit", description: "Efficient metro and bus systems", imageUrl: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800", tags: ["budget", "local", "eco-friendly", "urban"] },
  { id: "trans-2", category: "Transportation", title: "Car Rental", description: "Freedom to explore at your own pace", imageUrl: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800", tags: ["freedom", "road-trip", "flexible", "adventure"] },
  { id: "trans-3", category: "Transportation", title: "Walking Tours", description: "Discover hidden gems on foot", imageUrl: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800", tags: ["eco-friendly", "fitness", "local", "slow-travel"] },
  { id: "trans-4", category: "Transportation", title: "Bike Rentals", description: "Pedal through scenic routes", imageUrl: "https://images.unsplash.com/photo-1471506480208-91b3a4cc78be?w=800", tags: ["eco-friendly", "adventure", "fitness", "fun"] },
  { id: "trans-5", category: "Transportation", title: "Flight", description: "Fly to your destination quickly and comfortably", imageUrl: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800", tags: ["speed", "long-distance", "convenience", "modern"] },
  { id: "trans-6", category: "Transportation", title: "Limousine", description: "Luxury travel in style and comfort", imageUrl: "https://images.unsplash.com/photo-1566633806327-68e152aaf26d?w=800", tags: ["luxury", "premium", "comfort", "special-occasion"] },

  // ===== VIBES (50 cards) =====
  { id: "vibe-1", category: "Vibes", title: "Relaxed & Slow", description: "Take it easy and go with the flow", imageUrl: "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800", tags: ["relaxing", "slow-travel", "peaceful", "zen"] },
  { id: "vibe-2", category: "Vibes", title: "Adventure & Thrill", description: "Adrenaline-pumping experiences await", imageUrl: "https://images.unsplash.com/photo-1533130061792-64b345e4a833?w=800", tags: ["adventure", "adrenaline", "extreme", "active"] },
  { id: "vibe-3", category: "Vibes", title: "Cultural Immersion", description: "Deep dive into local traditions", imageUrl: "https://images.unsplash.com/photo-1528164344705-47542687000d?w=800", tags: ["culture", "authentic", "learning", "local"] },
  { id: "vibe-4", category: "Vibes", title: "Party & Social", description: "Meet new people and celebrate", imageUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800", tags: ["party", "social", "nightlife", "fun"] },
  { id: "vibe-5", category: "Vibes", title: "Romantic Getaway", description: "Intimate moments for couples", imageUrl: "https://images.unsplash.com/photo-1529634806980-85c3dd6d34ac?w=800", tags: ["romantic", "couples", "intimate", "special"] },
  { id: "vibe-6", category: "Vibes", title: "Solo Exploration", description: "Find yourself on a solo journey", imageUrl: "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=800", tags: ["solo", "independent", "self-discovery", "freedom"] },
  { id: "vibe-7", category: "Vibes", title: "Family Fun", description: "Activities everyone can enjoy", imageUrl: "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=800", tags: ["family", "kids", "inclusive", "fun"] },
  { id: "vibe-8", category: "Vibes", title: "Luxury & Indulgence", description: "Treat yourself to the finest things", imageUrl: "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800", tags: ["luxury", "indulgent", "premium", "special-occasion"] },
  { id: "vibe-9", category: "Vibes", title: "Budget Backpacker", description: "See more with less spending", imageUrl: "https://images.unsplash.com/photo-1527631746610-bca00a040d60?w=800", tags: ["budget", "backpacker", "adventurous", "simple"] },
  { id: "vibe-10", category: "Vibes", title: "Wellness Focus", description: "Prioritize health and self-care", imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800", tags: ["wellness", "healthy", "mindful", "self-care"] },
  { id: "vibe-11", category: "Vibes", title: "Digital Detox", description: "Disconnect to reconnect", imageUrl: "https://images.unsplash.com/photo-1476673160081-cf065607f449?w=800", tags: ["peaceful", "disconnected", "mindful", "nature"] },
  { id: "vibe-12", category: "Vibes", title: "Foodie Focus", description: "Eat your way through destinations", imageUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800", tags: ["food", "culinary", "gourmet", "exploring"] },
  { id: "vibe-13", category: "Vibes", title: "Active & Sporty", description: "Stay fit while traveling", imageUrl: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=800", tags: ["fitness", "active", "sports", "healthy"] },
  { id: "vibe-14", category: "Vibes", title: "Photography Journey", description: "Capture memories everywhere", imageUrl: "https://images.unsplash.com/photo-1502982720700-bfff97f2ecac?w=800", tags: ["photography", "creative", "scenic", "art"] },
  { id: "vibe-15", category: "Vibes", title: "Spiritual Quest", description: "Seek meaning and enlightenment", imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800", tags: ["spiritual", "mindful", "peaceful", "meaningful"] },
  { id: "vibe-16", category: "Vibes", title: "History Buff", description: "Walk through time and ancient sites", imageUrl: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800", tags: ["history", "educational", "culture", "learning"] },
  { id: "vibe-17", category: "Vibes", title: "Nature Lover", description: "Immerse in natural beauty", imageUrl: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800", tags: ["nature", "outdoors", "peaceful", "eco-friendly"] },
  { id: "vibe-18", category: "Vibes", title: "Urban Explorer", description: "Discover city life and hidden corners", imageUrl: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800", tags: ["urban", "modern", "exploring", "culture"] },
  { id: "vibe-19", category: "Vibes", title: "Beach Bum", description: "Sun, sand, and saltwater life", imageUrl: "https://images.unsplash.com/photo-1473116763249-2faaef81ccda?w=800", tags: ["beach", "relaxing", "tropical", "laid-100back"] },
  { id: "vibe-20", category: "Vibes", title: "Mountain Life", description: "High altitude adventures and views", imageUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800", tags: ["mountains", "adventure", "nature", "scenic"] },
  { id: "vibe-21", category: "Vibes", title: "Artistic Inspiration", description: "Find creativity in new places", imageUrl: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800", tags: ["art", "creative", "inspiring", "culture"] },
  { id: "vibe-22", category: "Vibes", title: "Volunteer Tourism", description: "Give back while traveling", imageUrl: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800", tags: ["meaningful", "giving-back", "community", "purposeful"] },
  { id: "vibe-23", category: "Vibes", title: "Music & Festival", description: "Follow the beat around the world", imageUrl: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800", tags: ["music", "festivals", "social", "fun"] },
  { id: "vibe-24", category: "Vibes", title: "Off-the-Beaten-Path", description: "Discover unknown destinations", imageUrl: "https://images.unsplash.com/photo-1531761535209-180857e963b9?w=800", tags: ["adventure", "unique", "exploring", "remote"] },
  { id: "vibe-25", category: "Vibes", title: "Girls/Guys Trip", description: "Fun with your best friends", imageUrl: "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=800", tags: ["social", "friends", "fun", "memorable"] },
  { id: "vibe-26", category: "Vibes", title: "Honeymoon", description: "Celebrate your new beginning", imageUrl: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=800", tags: ["romantic", "special-occasion", "couples", "luxury"] },
  { id: "vibe-27", category: "Vibes", title: "Road Trip", description: "The journey is the destination", imageUrl: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800", tags: ["road-trip", "freedom", "adventure", "scenic"] },
  { id: "vibe-28", category: "Vibes", title: "Island Hopping", description: "Explore multiple islands", imageUrl: "https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=800", tags: ["beach", "adventure", "tropical", "exploring"] },
  { id: "vibe-29", category: "Vibes", title: "Wine Country", description: "Vineyards and tastings", imageUrl: "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=800", tags: ["wine", "relaxing", "romantic", "culinary"] },
  { id: "vibe-30", category: "Vibes", title: "Winter Wonderland", description: "Embrace the cold and snow", imageUrl: "https://images.unsplash.com/photo-1551524559-8af4e6624178?w=800", tags: ["winter", "adventure", "cozy", "scenic"] },
  { id: "vibe-31", category: "Vibes", title: "Tropical Paradise", description: "Escape to warm, sunny places", imageUrl: "https://images.unsplash.com/photo-1559494007-9f5847c49d94?w=800", tags: ["tropical", "beach", "relaxing", "warm"] },
  { id: "vibe-32", category: "Vibes", title: "Workation", description: "Work remotely from anywhere", imageUrl: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800", tags: ["work", "flexible", "modern", "digital-nomad"] },
  { id: "vibe-33", category: "Vibes", title: "Eco-Conscious", description: "Travel sustainably", imageUrl: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800", tags: ["eco-friendly", "sustainable", "mindful", "nature"] },
  { id: "vibe-34", category: "Vibes", title: "Celebration Trip", description: "Birthday, anniversary, or milestone", imageUrl: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800", tags: ["celebration", "special-occasion", "memorable", "fun"] },
  { id: "vibe-35", category: "Vibes", title: "Learning Journey", description: "Take classes and workshops abroad", imageUrl: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800", tags: ["educational", "learning", "culture", "enriching"] },
  { id: "vibe-36", category: "Vibes", title: "Shopping Spree", description: "Retail therapy around the world", imageUrl: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800", tags: ["shopping", "fashion", "urban", "fun"] },
  { id: "vibe-37", category: "Vibes", title: "Nightlife Seeker", description: "Best bars and clubs worldwide", imageUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800", tags: ["nightlife", "party", "social", "urban"] },
  { id: "vibe-38", category: "Vibes", title: "Pet-Friendly", description: "Travel with your furry friend", imageUrl: "https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?w=800", tags: ["pets", "family", "inclusive", "adventure"] },
  { id: "vibe-39", category: "Vibes", title: "Bucket List", description: "Check off dream destinations", imageUrl: "https://images.unsplash.com/photo-1531141445733-14c2eb7d4c1f?w=800", tags: ["bucket-list", "memorable", "adventure", "unique"] },
  { id: "vibe-40", category: "Vibes", title: "Minimalist Travel", description: "Less stuff, more experiences", imageUrl: "https://images.unsplash.com/photo-1527631746610-bca00a040d60?w=800", tags: ["minimalist", "simple", "mindful", "freedom"] },
  { id: "vibe-41", category: "Vibes", title: "Thrill Seeker", description: "Push your limits everywhere", imageUrl: "https://images.unsplash.com/photo-1601024445121-e5b82f020549?w=800", tags: ["extreme", "adrenaline", "adventure", "brave"] },
  { id: "vibe-42", category: "Vibes", title: "Hidden Gems", description: "Discover secret local spots", imageUrl: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800", tags: ["local", "authentic", "unique", "exploring"] },
  { id: "vibe-43", category: "Vibes", title: "Sunset Chaser", description: "Golden hours around the world", imageUrl: "https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?w=800", tags: ["scenic", "romantic", "photography", "relaxing"] },
  { id: "vibe-44", category: "Vibes", title: "Wildlife Encounters", description: "Get close to amazing animals", imageUrl: "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800", tags: ["wildlife", "nature", "adventure", "unique"] },
  { id: "vibe-45", category: "Vibes", title: "Festival Hopper", description: "From Coachella to Carnival", imageUrl: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800", tags: ["festivals", "music", "social", "fun"] },
  { id: "vibe-46", category: "Vibes", title: "Starry Nights", description: "Dark skies and celestial views", imageUrl: "https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?w=800", tags: ["stargazing", "peaceful", "romantic", "nature"] },
  { id: "vibe-47", category: "Vibes", title: "Retro & Vintage", description: "Step back in time", imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800", tags: ["vintage", "history", "unique", "nostalgic"] },
  { id: "vibe-48", category: "Vibes", title: "Spontaneous", description: "No plans, just go", imageUrl: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800", tags: ["spontaneous", "freedom", "adventure", "flexible"] },
  { id: "vibe-49", category: "Vibes", title: "Rejuvenation", description: "Return refreshed and renewed", imageUrl: "https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=800", tags: ["relaxing", "wellness", "self-care", "peaceful"] },
  { id: "vibe-50", category: "Vibes", title: "Epic Landscapes", description: "Dramatic scenery and vistas", imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800", tags: ["scenic", "nature", "photography", "breathtaking"] },
];

const CATEGORIES: { name: CategoryName; icon: React.ReactNode; displayName: string }[] = [
  { name: "Locations", icon: <MapPin className="size-4" />, displayName: "Locations" },
  { name: "Activities", icon: <Compass className="size-4" />, displayName: "Activities" },
  { name: "Vibes", icon: <Sparkles className="size-4" />, displayName: "Vibes" },
  { name: "Food", icon: <Utensils className="size-4" />, displayName: "Food" },
  { name: "Accommodations", icon: <Home className="size-4" />, displayName: "Stay" },
  { name: "Transportation", icon: <Car className="size-4" />, displayName: "Transport" },
];

const REQUIRED_SWIPES = 5;

// App states
type AppState = "landing" | "loading" | "swiping" | "questionnaire" | "generating" | "itinerary";

// Required swipes per category - all set to 5 minimum
const REQUIRED_SWIPES_MAP: Record<CategoryName, number> = {
  Locations: 5,
  Food: 5,
  Activities: 5,
  Accommodations: 5,
  Transportation: 5,
  Vibes: 5,
};

function App() {
  const { isDarkMode, toggleTheme } = useTheme();
  const { isMuted, setIsMuted, playSound, volume, setVolume } = useSound();
  const [appState, setAppState] = useState<AppState>("landing");
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [cardStack, setCardStack] = useState<TravelCard[]>([]);
  const [allCards, setAllCards] = useState<Record<CategoryName, TravelCard[]>>({
    Locations: [],
    Food: [],
    Activities: [],
    Accommodations: [],
    Transportation: [],
    Vibes: [],
  });
  // Track swiped card IDs locally (no database)
  const [swipedCardIds, setSwipedCardIds] = useState<Set<string>>(new Set());
  // Track swipe counts per category locally (no database)
  const [categoryProgress, setCategoryProgress] = useState<Record<CategoryName, number>>({
    Locations: 0,
    Food: 0,
    Activities: 0,
    Accommodations: 0,
    Transportation: 0,
    Vibes: 0,
  });
  // Track preference scores locally (no database)
  const [preferenceScores, setPreferenceScores] = useState<Record<string, number>>({});
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [completedCategories, setCompletedCategories] = useState<Set<CategoryName>>(new Set());
  const [showBadge, setShowBadge] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showContinueButton, setShowContinueButton] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isAutoCompleting, setIsAutoCompleting] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const handleThemeToggle = useCallback(() => {
    playSound("switch");
    toggleTheme();
  }, [playSound, toggleTheme]);
  const handleMuteToggle = useCallback(() => {
    if (isMuted) {
      setIsMuted(false);
      setTimeout(() => playSound("click"), 0);
    } else {
      playSound("cancel");
      setIsMuted(true);
    }
  }, [isMuted, playSound, setIsMuted]);
  const handleVolumeSlide = useCallback(
    (value: number) => {
      setVolume(value);
      if (isMuted && value > 0) {
        setIsMuted(false);
      }
    },
    [isMuted, setIsMuted, setVolume]
  );

  // Questionnaire state
  const [questionnaireStep, setQuestionnaireStep] = useState(1);
  const [dietaryNeeds, setDietaryNeeds] = useState<string[]>([]);
  const [foodAllergies, setFoodAllergies] = useState("");
  const [mealBudget, setMealBudget] = useState("$$");
  const [foodAdventurousness, setFoodAdventurousness] = useState(5);
  const [accommodationType, setAccommodationType] = useState<string[]>([]);
  const [amenities, setAmenities] = useState<string[]>([]);
  const [starRatingMin, setStarRatingMin] = useState(3);
  const [starRatingMax, setStarRatingMax] = useState(5);
  const [pricePerNight, setPricePerNight] = useState(150);
  const [tripDates, setTripDates] = useState<{ from: Date | undefined; to: Date | undefined }>({ from: undefined, to: undefined });
  const [destination, setDestination] = useState("");
  const [departureLocation, setDepartureLocation] = useState("");
  const [surpriseMe, setSurpriseMe] = useState(false);
  const [numberOfTravelers, setNumberOfTravelers] = useState(2);
  const [transportationPriority, setTransportationPriority] = useState<"speed" | "cost" | "comfort">("cost");
  const [transportationMethod, setTransportationMethod] = useState<string[]>([]);
  const [favoriteCuisines, setFavoriteCuisines] = useState<string[]>([]);
  const [wakeUpTime, setWakeUpTime] = useState("08:00");
  const [sleepTime, setSleepTime] = useState("22:00");
  const [totalBudget, setTotalBudget] = useState<number | undefined>(undefined);
  const [formError, setFormError] = useState("");

  // Itinerary state
  const [itinerary, setItinerary] = useState<TravelItinerary | null>(null);
  const [itineraryId, setItineraryId] = useState<string | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [selectedActivityPosition, setSelectedActivityPosition] = useState<{ dayIndex: number; actIndex: number } | null>(null);
  const [activityDialogOpen, setActivityDialogOpen] = useState(false);
  const [isRefreshingActivity, setIsRefreshingActivity] = useState(false);
  const [addActivityDialogOpen, setAddActivityDialogOpen] = useState(false);
  const [addActivityDayIndex, setAddActivityDayIndex] = useState<number | null>(null);
  const [newActivityTime, setNewActivityTime] = useState("12:00");
  const [newActivityType, setNewActivityType] = useState<string>("activity");
  const [isAddingActivity, setIsAddingActivity] = useState(false);
  const [draggedActivity, setDraggedActivity] = useState<{ dayIndex: number; actIndex: number } | null>(null);
  const [dragOverActivity, setDragOverActivity] = useState<{ dayIndex: number; actIndex: number } | null>(null);
  const [refreshingActivityPosition, setRefreshingActivityPosition] = useState<{ dayIndex: number; actIndex: number } | null>(null);
  const [showNearbyActivities, setShowNearbyActivities] = useState(false);
  const [nearbyActivities, setNearbyActivities] = useState<Activity[]>([]);
  const [isLoadingNearby, setIsLoadingNearby] = useState(false);
  const [nearbyCategory, setNearbyCategory] = useState<string>("all");
  const [showMapView, setShowMapView] = useState(false);
  const [mapCoordinates, setMapCoordinates] = useState<{ lat: number; lon: number } | null>(null);
  const [isLoadingMap, setIsLoadingMap] = useState(false);

  const { mutate: generateItinerary, isPending: isGenerating } = useGenerateItineraryMutation();

  const dragStartRef = useRef({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const currentCategory = CATEGORIES[currentCategoryIndex];

  // Track the last initialized category to prevent re-initialization during swipes
  const lastInitializedCategoryRef = useRef<string | null>(null);

  // Initialize card stack for current category from preloaded cards
  // Only runs on category change or initial load - not during active swiping
  useEffect(() => {
    if (appState !== "swiping") {
      lastInitializedCategoryRef.current = null;
      return;
    }

    // Skip if we already initialized this category (prevents resetting during swipes)
    if (lastInitializedCategoryRef.current === currentCategory.name) {
      return;
    }

    const categoryCards = allCards[currentCategory.name];
    if (categoryCards.length === 0) return;

    // Filter out already swiped cards
    const unswipedCards = categoryCards.filter(c => !swipedCardIds.has(c.id));

    lastInitializedCategoryRef.current = currentCategory.name;

    if (unswipedCards.length > 0) {
      setCardStack(shuffleArray([...unswipedCards]));
      setShowContinueButton(false);
    } else {
      // All cards swiped for this category
      setCardStack([]);
      setShowContinueButton(true);
    }
  }, [currentCategory.name, appState, allCards, swipedCardIds]);

  // No longer loading from database - everything is kept in local state
  const initializeProgress = useCallback(() => {
    // Just reset to defaults - no database loading
    setCategoryProgress({
      Locations: 0, Food: 0, Activities: 0, Accommodations: 0, Transportation: 0, Vibes: 0,
    });
    setCompletedCategories(new Set());
    setPreferenceScores({});
    setSwipedCardIds(new Set());
  }, []);

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Reset all swipes and preferences (local state only - no database)
  const handleReset = useCallback(() => {
    playSound("cancel");
    // Reset all state (no database operations needed)
    setSwipedCardIds(new Set());
    setCategoryProgress({
      Locations: 0, Food: 0, Activities: 0, Accommodations: 0, Transportation: 0, Vibes: 0,
    });
    setPreferenceScores({});
    setCompletedCategories(new Set());
    setCurrentCategoryIndex(0);
    setQuestionnaireStep(1);
    setDietaryNeeds([]);
    setFoodAllergies("");
    setMealBudget("$$");
    setFoodAdventurousness(5);
    setAccommodationType([]);
    setAmenities([]);
    setStarRatingMin(3);
    setStarRatingMax(5);
    setPricePerNight(150);
    setTripDates({ from: undefined, to: undefined });
    setDestination("");
    setDepartureLocation("");
    setSurpriseMe(false);
    setNumberOfTravelers(2);
    setTransportationPriority("cost");
    setTransportationMethod([]);
    setFavoriteCuisines([]);
    setWakeUpTime("08:00");
    setSleepTime("22:00");
    setTotalBudget(undefined);
    setItinerary(null);
    setItineraryId(null);
    setShowContinueButton(false);
    setAppState("landing");
  }, [playSound]);

  const handleContinueToNextCategory = useCallback(() => {
    playSound("click");
    const nextIncomplete = CATEGORIES.findIndex((c, i) => i > currentCategoryIndex && !completedCategories.has(c.name));
    if (nextIncomplete !== -1) {
      setCurrentCategoryIndex(nextIncomplete);
    } else {
      const firstIncomplete = CATEGORIES.findIndex(c => !completedCategories.has(c.name));
      if (firstIncomplete !== -1) {
        setCurrentCategoryIndex(firstIncomplete);
      } else {
        setShowConfetti(true);
        setTimeout(() => {
          setShowConfetti(false);
          setAppState("questionnaire");
        }, 3000);
        playSound("success");
      }
    }
    setShowContinueButton(false);
  }, [completedCategories, currentCategoryIndex, playSound]);

  const handleAutoComplete = useCallback(() => {
    if (isAutoCompleting) return;
    playSound("switch");
    setIsAutoCompleting(true);

    const newSwipedCardIds = new Set(swipedCardIds);
    const newCategoryProgress = { ...categoryProgress };
    const newPreferenceScores = { ...preferenceScores };
    const newCompletedCategories = new Set(completedCategories);

    CATEGORIES.forEach(category => {
      const required = REQUIRED_SWIPES_MAP[category.name];
      let currentSwipes = newCategoryProgress[category.name];

      if (currentSwipes >= required) {
        return; // Skip already completed categories
      }

      const swipesNeeded = required - currentSwipes;
      const unswipedCards = allCards[category.name].filter(c => !newSwipedCardIds.has(c.id));

      const cardsToSwipe = shuffleArray(unswipedCards).slice(0, swipesNeeded);

      cardsToSwipe.forEach(card => {
        const direction = Math.random() < 0.5 ? "left" : "right";
        const scoreChange = direction === "right" ? 1 : -1;

        for (const tag of card.tags) {
          newPreferenceScores[tag] = (newPreferenceScores[tag] || 0) + scoreChange;
        }

        newSwipedCardIds.add(card.id);
        newCategoryProgress[category.name]++;
      });

      if (newCategoryProgress[category.name] >= required) {
        newCompletedCategories.add(category.name);
      }
    });

    // Batch update state
    setSwipedCardIds(newSwipedCardIds);
    setPreferenceScores(newPreferenceScores);
    setCategoryProgress(newCategoryProgress);
    setCompletedCategories(newCompletedCategories);

    // After auto-completing, check if all categories are finished
    const allComplete = CATEGORIES.every(c => newCompletedCategories.has(c.name));
    if (allComplete) {
      playSound("success");
      setShowConfetti(true);
      setTimeout(() => {
        setShowConfetti(false);
        setAppState("questionnaire");
      }, 3000);
    } else {
      // Move to the next incomplete category if needed
      handleContinueToNextCategory();
    }
    setIsAutoCompleting(false);
  }, [allCards, categoryProgress, completedCategories, preferenceScores, swipedCardIds, isAutoCompleting, playSound, handleContinueToNextCategory]);

  // Start swiping - preload all cards
  const handleStartSwiping = useCallback(async () => {
    setAppState("loading");

    // Preload all cards by category
    const cardsByCategory: Record<CategoryName, TravelCard[]> = {
      Locations: [],
      Food: [],
      Activities: [],
      Accommodations: [],
      Transportation: [],
      Vibes: [],
    };

    for (const card of TRAVEL_CARDS) {
      cardsByCategory[card.category].push(card);
    }

    // Shuffle each category
    for (const cat of Object.keys(cardsByCategory) as CategoryName[]) {
      cardsByCategory[cat] = shuffleArray(cardsByCategory[cat]);
    }

    setAllCards(cardsByCategory);

    // Initialize progress (fresh start - no database)
    initializeProgress();

    setAppState("swiping");
  }, [initializeProgress]);

  const handleSwipe = useCallback((direction: "left" | "right") => {
    // Prevent swiping during animation or if no cards
    if (cardStack.length === 0 || isAnimating) return;
    playSound(direction === "right" ? "success" : "cancel");

    const card = cardStack[0];
    setIsAnimating(true);
    setSwipeDirection(direction);

    // Animate out
    setTimeout(() => {
      // Update preference scores locally (no database)
      const scoreChange = direction === "right" ? 1 : -1;
      const newScores = { ...preferenceScores };

      for (const tag of card.tags) {
        newScores[tag] = (newScores[tag] || 0) + scoreChange;
      }
      setPreferenceScores(newScores);

      // Add card to swiped set
      setSwipedCardIds(prev => new Set([...prev, card.id]));

      // Update category progress locally (no database)
      const newCount = categoryProgress[currentCategory.name] + 1;
      const requiredSwipes = REQUIRED_SWIPES_MAP[currentCategory.name];
      const isComplete = newCount >= requiredSwipes;

      setCategoryProgress(prev => ({
        ...prev,
        [currentCategory.name]: newCount,
      }));

      // Remove card from stack first
      const newStack = cardStack.slice(1);
      setCardStack(newStack);

      // Check for category completion (first time hitting required swipes)
      if (isComplete && !completedCategories.has(currentCategory.name)) {
        const newCompleted = new Set(completedCategories);
        newCompleted.add(currentCategory.name);
        setCompletedCategories(newCompleted);
        setShowBadge(currentCategory.name);
        setTimeout(() => setShowBadge(null), 2000);

        // Check if all categories are now complete
        if (newCompleted.size === CATEGORIES.length) {
          setShowConfetti(true);
          setTimeout(() => {
            setShowConfetti(false);
            setAppState("questionnaire");
          }, 3000);
        }
      }

      // Show continue button if no more cards left
      if (newStack.length === 0) {
        setShowContinueButton(true);
      }

      setSwipeDirection(null);
      setDragOffset({ x: 0, y: 0 });
      setIsAnimating(false);
    }, 300);
  }, [cardStack, currentCategory, categoryProgress, completedCategories, preferenceScores, isAnimating, playSound]);

  // Touch/Mouse handlers
  const handleDragStart = (clientX: number, clientY: number) => {
    setIsDragging(true);
    playSound("pop");
    dragStartRef.current = { x: clientX, y: clientY };
  };

  const handleDragMove = (clientX: number, clientY: number) => {
    if (!isDragging) return;
    const deltaX = clientX - dragStartRef.current.x;
    const deltaY = clientY - dragStartRef.current.y;
    setDragOffset({ x: deltaX, y: deltaY });
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    // Don't process drag if animating
    if (isAnimating) {
      setDragOffset({ x: 0, y: 0 });
      return;
    }

    const threshold = 100;
    if (dragOffset.x > threshold) {
      handleSwipe("right");
    } else if (dragOffset.x < -threshold) {
      handleSwipe("left");
    } else {
      setDragOffset({ x: 0, y: 0 });
    }
  };

  const handleGenerateItinerary = async () => {
    setAppState("generating");

    // Build prompt from preferences
    const likedTags = Object.entries(preferenceScores)
      .filter(([, score]) => score > 0)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([tag, score]) => `${tag} (score: ${score})`)
      .join(", ");

    const dislikedTags = Object.entries(preferenceScores)
      .filter(([, score]) => score < 0)
      .sort(([, a], [, b]) => a - b)
      .slice(0, 5)
      .map(([tag, score]) => `${tag} (score: ${score})`)
      .join(", ");

    const startDate = tripDates.from ? tripDates.from.toISOString().split("T")[0] : new Date().toISOString().split("T")[0];
    const endDate = tripDates.to ? tripDates.to.toISOString().split("T")[0] : new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

    const prompt = `
Create a personalized travel itinerary with the following preferences:

DEPARTURE LOCATION: ${departureLocation || "Not specified"}
DESTINATION: ${surpriseMe ? "Surprise me with a destination that matches my preferences" : destination || "Suggest a destination based on preferences"}
DATES: ${startDate} to ${endDate}
TRAVELERS: ${numberOfTravelers}
${totalBudget ? `TOTAL BUDGET: $${totalBudget}` : ""}

TRANSPORTATION PRIORITY: ${transportationPriority} (${transportationPriority === "speed" ? "prefer fastest routes" : transportationPriority === "cost" ? "ALWAYS prefer cheapest/most budget-friendly options - select economy class flights, budget airlines, and the most affordable transportation" : "prefer most comfortable travel"})
${totalBudget ? `STRICT BUDGET CONSTRAINT: Total trip budget is $${totalBudget}. You MUST stay within this budget. Prioritize budget-friendly options for flights, accommodation, and activities.` : `DEFAULT BUDGET GUIDANCE: Assume a moderate budget. For flights, prefer economy class and standard airlines. Avoid luxury/first class unless explicitly requested.`}

TRAVEL PREFERENCES (liked tags with scores):
${likedTags || "No specific preferences"}

AVOID (disliked tags):
${dislikedTags || "No specific dislikes"}

DIETARY NEEDS: ${dietaryNeeds.length > 0 ? dietaryNeeds.join(", ") : "None specified"}
FOOD ALLERGIES: ${foodAllergies || "None"}
MEAL BUDGET: ${mealBudget}
FOOD ADVENTUROUSNESS: ${foodAdventurousness}/10

ACCOMMODATION PREFERENCES: ${accommodationType.length > 0 ? accommodationType.join(", ") : "Any"}
STAR RATING: ${starRatingMin} to ${starRatingMax} stars
MUST-HAVE AMENITIES: ${amenities.length > 0 ? amenities.join(", ") : "None specific"}
PRICE PER NIGHT: Up to $${pricePerNight}

IMPORTANT:
1. Include transportation FROM the departure location TO the destination at the start of the itinerary (Day 1 should begin with travel from ${departureLocation || "origin"} to the destination).
2. Include return transportation from the destination back to ${departureLocation || "origin"} at the end of the itinerary.
3. The method of transportation should consider the distance (flights for long distances, trains/buses/cars for shorter trips), the traveler's transportation priority (${transportationPriority}), and their preferences.
4. AVOID any foods containing these allergens: ${foodAllergies || "none specified"}.

Please create a detailed day-by-day itinerary that aligns with these preferences.
    `.trim();

    generateItinerary(
      { prompt },
      {
        onSuccess: (data) => {
          setItinerary(data.itinerary);
          // No database saving - itinerary is kept in local state only
          setAppState("itinerary");
          // Pre-fetch nearby activities in the background, passing the new itinerary directly
          handleFetchNearbyActivities(data.itinerary);
        },
        onError: (error) => {
          console.error("Error generating itinerary:", error);
          setAppState("questionnaire");
        },
      }
    );
  };

  const handleDeleteActivity = (dayIndex: number, activityIndex: number) => {
    if (!itinerary) return;

    const newDays = [...itinerary.days];
    newDays[dayIndex] = {
      ...newDays[dayIndex],
      activities: newDays[dayIndex].activities.filter((_, i) => i !== activityIndex),
    };

    const newTotalCost = newDays.reduce(
      (sum, day) => sum + day.activities.reduce((daySum, act) => daySum + act.estimatedCost, 0),
      0
    );

    setItinerary({
      ...itinerary,
      days: newDays,
      totalEstimatedCost: newTotalCost,
    });
  };

  const handleRefreshActivity = async () => {
    if (!itinerary || !selectedActivity || !selectedActivityPosition) return;

    setIsRefreshingActivity(true);

    const { dayIndex, actIndex } = selectedActivityPosition;
    const currentDay = itinerary.days[dayIndex];
    const currentActivity = currentDay.activities[actIndex];

    // Build context for generating a replacement activity
    const likedTags = Object.entries(preferenceScores)
      .filter(([, score]) => score > 0)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([tag]) => tag)
      .join(", ");

    const actType = currentActivity.type || "activity";
    const menuHighlightsStr = actType === 'food' ? '["Signature Dish 1", "Local Specialty", "Chef Recommendation"]' : 'null';

    // Use the full itinerary structure that the API expects
    const prompt = `Generate a SINGLE replacement ${actType} for ${itinerary.destination}.

CRITICAL: Respond with ONLY valid JSON. No markdown, no code blocks, no explanatory text.

Context:
- Current activity to replace: "${currentActivity.title}" at ${currentActivity.location}
- Time slot: ${currentActivity.time}
- Type: ${actType}
- User preferences: ${likedTags || "general sightseeing"}
- Dietary restrictions: ${dietaryNeeds.length > 0 ? dietaryNeeds.join(", ") : "None"}
- Food allergies: ${foodAllergies || "None"}

IMPORTANT:
1. Generate a COMPLETELY DIFFERENT ${actType} than "${currentActivity.title}".
2. Provide a REALISTIC estimatedCost for this new activity - do NOT just copy the old price. Research actual prices for ${itinerary.destination}.

Your response must be EXACTLY this structure:
{
  "destination": "${itinerary.destination}",
  "tripDates": { "startDate": "${currentDay.date}", "endDate": "${currentDay.date}" },
  "days": [{
    "dayNumber": 1,
    "date": "${currentDay.date}",
    "activities": [{
      "time": "${currentActivity.time}",
      "title": "New Different ${actType === 'food' ? 'Restaurant' : 'Activity'} Name",
      "location": "Specific Address in ${itinerary.destination}",
      "description": "Brief description of this place",
      "estimatedCost": <REALISTIC_COST_FOR_THIS_ACTIVITY>,
      "type": "${actType}",
      "rating": 4.5,
      "detailedInfo": "Detailed information about this place",
      "websiteUrl": "https://example.com",
      "menuHighlights": ${menuHighlightsStr}
    }]
  }],
  "totalEstimatedCost": <SAME_AS_ESTIMATED_COST>
}`;

    generateItinerary(
      { prompt },
      {
        onSuccess: (data) => {
          try {
            let newActivity: Activity | null = null;

            // First try the parsed itinerary from the hook
            if (data.itinerary && data.itinerary.days && data.itinerary.days[0] && data.itinerary.days[0].activities && data.itinerary.days[0].activities[0]) {
              newActivity = data.itinerary.days[0].activities[0];
            }
            // Fallback to raw response parsing
            else if (data.rawResponse) {
              let cleanedResponse = data.rawResponse.trim();
              if (cleanedResponse.startsWith('```json')) {
                cleanedResponse = cleanedResponse.replace(/^```json\n?/, '').replace(/\n?```$/, '');
              } else if (cleanedResponse.startsWith('```')) {
                cleanedResponse = cleanedResponse.replace(/^```\n?/, '').replace(/\n?```$/, '');
              }

              const parsed = JSON.parse(cleanedResponse);

              if (parsed.days && parsed.days[0] && parsed.days[0].activities && parsed.days[0].activities[0]) {
                newActivity = parsed.days[0].activities[0];
              } else if (parsed.title && parsed.time && parsed.location) {
                newActivity = parsed;
              }
            }

            if (!newActivity) {
              throw new Error("No valid activity in response");
            }

            // Update the itinerary with the new activity
            const newDays = [...itinerary.days];
            newDays[dayIndex] = {
              ...newDays[dayIndex],
              activities: newDays[dayIndex].activities.map((act, i) =>
                i === actIndex ? newActivity! : act
              ),
            };

            const newTotalCost = newDays.reduce(
              (sum, day) => sum + day.activities.reduce((daySum, act) => daySum + act.estimatedCost, 0),
              0
            );

            setItinerary({
              ...itinerary,
              days: newDays,
              totalEstimatedCost: newTotalCost,
            });

            // Update selected activity to show the new one
            setSelectedActivity(newActivity);
          } catch (error) {
            console.error("Error parsing refreshed activity:", error, data.rawResponse);
          }
          setIsRefreshingActivity(false);
        },
        onError: (error) => {
          console.error("Error refreshing activity:", error);
          setIsRefreshingActivity(false);
        },
      }
    );
  };

  // Fetch nearby activities for the destination
  const handleFetchNearbyActivities = async (itineraryData?: TravelItinerary) => {
    const targetItinerary = itineraryData || itinerary;
    if (!targetItinerary) return;

    setIsLoadingNearby(true);
    setNearbyActivities([]); // Clear previous results

    const likedTags = Object.entries(preferenceScores)
      .filter(([, score]) => score > 0)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([tag]) => tag)
      .join(", ");

    const preferencesPrompt = `
User Preferences:
- Interests: ${likedTags || "general"}
- Dietary Needs: ${dietaryNeeds.join(", ") || "none"}
- Food Allergies: ${foodAllergies || "none"}
- Meal Budget: ${mealBudget}
- Adventurousness: ${foodAdventurousness}/10
`;

    // Build a structured prompt that will return valid JSON
    const prompt = `You are a local travel guide for ${targetItinerary.destination}. Generate exactly 15 popular nearby activities and attractions that tourists should visit, keeping in mind the user's preferences.

${preferencesPrompt}

CRITICAL: Respond with ONLY a valid JSON object. No markdown, no code blocks, no explanatory text.

Your response must be EXACTLY this structure:
{
  "destination": "${targetItinerary.destination}",
  "tripDates": { "startDate": "2024-01-01", "endDate": "2024-01-02" },
  "days": [{
    "dayNumber": 1,
    "date": "2024-01-01",
    "activities": [
      { "time": "Anytime", "title": "Restaurant Name", "location": "123 Street Name", "description": "Famous local restaurant", "estimatedCost": 30, "type": "food", "rating": 4.5, "detailedInfo": "Great for local cuisine" },
      { "time": "Anytime", "title": "Museum Name", "location": "456 Avenue", "description": "Historic museum", "estimatedCost": 15, "type": "attraction", "rating": 4.7, "detailedInfo": "Must-see exhibits" },
      { "time": "Anytime", "title": "Park Name", "location": "Central Area", "description": "Beautiful park", "estimatedCost": 0, "type": "activity", "rating": 4.3, "detailedInfo": "Great for walks" }
    ]
  }],
  "totalEstimatedCost": 0
}

Generate 15 REAL places in ${targetItinerary.destination} based on the user's preferences:
- 5 restaurants/cafes (type: "food")
- 5 attractions/museums (type: "attraction")
- 5 activities/parks (type: "activity")

Include realistic ratings (3.5-5.0), real addresses, and accurate costs in USD.`;

    generateItinerary(
      { prompt },
      {
        onSuccess: (data) => {
          try {
            let activities: Activity[] = [];

            // First try to use the parsed itinerary from the response
            if (data.itinerary && data.itinerary.days && data.itinerary.days[0]) {
              activities = data.itinerary.days[0].activities || [];
            }
            // Fallback to parsing raw response
            else if (data.rawResponse) {
              let cleanedResponse = data.rawResponse.trim();
              if (cleanedResponse.startsWith('```json')) {
                cleanedResponse = cleanedResponse.replace(/^```json\n?/, '').replace(/\n?```$/, '');
              } else if (cleanedResponse.startsWith('```')) {
                cleanedResponse = cleanedResponse.replace(/^```\n?/, '').replace(/\n?```$/, '');
              }

              const parsed = JSON.parse(cleanedResponse);

              // Handle different response structures
              if (parsed.activities) {
                activities = parsed.activities;
              } else if (parsed.days && parsed.days[0] && parsed.days[0].activities) {
                activities = parsed.days[0].activities;
              }
            }

            if (activities.length === 0) {
              console.warn("No activities found in response, generating fallback");
            }

            setNearbyActivities(activities);
          } catch (error) {
            console.error("Error parsing nearby activities:", error, data.rawResponse);
            setNearbyActivities([]);
          }
          setIsLoadingNearby(false);
        },
        onError: (error) => {
          console.error("Error fetching nearby activities:", error);
          setIsLoadingNearby(false);
        },
      }
    );
  };

  // Add nearby activity to a specific day in the itinerary
  const handleAddNearbyActivity = (activity: Activity, dayIndex: number) => {
    if (!itinerary) return;

    const newDays = [...itinerary.days];
    const updatedActivities = [...newDays[dayIndex].activities, activity];

    // Sort activities by time
    updatedActivities.sort((a, b) => {
      const timeA = a.time.toLowerCase();
      const timeB = b.time.toLowerCase();
      const parseTime = (t: string) => {
        const match = t.match(/(\d+):(\d+)\s*(am|pm)/i);
        if (!match) return 12; // Default to noon for "Anytime"
        let h = parseInt(match[1]);
        const m = parseInt(match[2]);
        const ispm = match[3].toLowerCase() === "pm";
        if (ispm && h !== 12) h += 12;
        if (!ispm && h === 12) h = 0;
        return h * 60 + m;
      };
      return parseTime(timeA) - parseTime(timeB);
    });

    newDays[dayIndex] = {
      ...newDays[dayIndex],
      activities: updatedActivities,
    };

    const newTotalCost = newDays.reduce(
      (sum, day) => sum + day.activities.reduce((daySum, act) => daySum + act.estimatedCost, 0),
      0
    );

    setItinerary({
      ...itinerary,
      days: newDays,
      totalEstimatedCost: newTotalCost,
    });

    // Remove from nearby list once added
    setNearbyActivities(prev => prev.filter(a => a.title !== activity.title));
  };

  const handleInlineRefreshActivity = async (dayIndex: number, actIndex: number) => {
    if (!itinerary) return;

    setRefreshingActivityPosition({ dayIndex, actIndex });

    const currentDay = itinerary.days[dayIndex];
    const currentActivity = currentDay.activities[actIndex];

    // Build context for generating a replacement activity
    const likedTags = Object.entries(preferenceScores)
      .filter(([, score]) => score > 0)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([tag]) => tag)
      .join(", ");

    const actType = currentActivity.type || "activity";
    const menuHighlightsStr = actType === 'food' ? '["Signature Dish 1", "Local Specialty", "Chef Recommendation"]' : 'null';

    // Use the full itinerary structure that the API expects
    const prompt = `Generate a SINGLE replacement ${actType} for ${itinerary.destination}.

CRITICAL: Respond with ONLY valid JSON. No markdown, no code blocks, no explanatory text.

Context:
- Current activity to replace: "${currentActivity.title}" at ${currentActivity.location}
- Time slot: ${currentActivity.time}
- Type: ${actType}
- User preferences: ${likedTags || "general sightseeing"}
- Dietary restrictions: ${dietaryNeeds.length > 0 ? dietaryNeeds.join(", ") : "None"}

IMPORTANT:
1. Generate a COMPLETELY DIFFERENT ${actType} than "${currentActivity.title}".
2. Provide a REALISTIC estimatedCost for this new activity - do NOT just copy the old price. Research actual prices for ${itinerary.destination}.

Your response must be EXACTLY this structure:
{
  "destination": "${itinerary.destination}",
  "tripDates": { "startDate": "${currentDay.date}", "endDate": "${currentDay.date}" },
  "days": [{
    "dayNumber": 1,
    "date": "${currentDay.date}",
    "activities": [{
      "time": "${currentActivity.time}",
      "title": "New Different ${actType === 'food' ? 'Restaurant' : 'Activity'} Name",
      "location": "Specific Address in ${itinerary.destination}",
      "description": "Brief description of this place",
      "estimatedCost": <REALISTIC_COST_FOR_THIS_ACTIVITY>,
      "type": "${actType}",
      "rating": 4.5,
      "detailedInfo": "Detailed information about this place",
      "menuHighlights": ${menuHighlightsStr}
    }]
  }],
  "totalEstimatedCost": <SAME_AS_ESTIMATED_COST>
}`;

    generateItinerary(
      { prompt },
      {
        onSuccess: (data) => {
          try {
            let newActivity: Activity | null = null;

            // First try the parsed itinerary from the hook
            if (data.itinerary && data.itinerary.days && data.itinerary.days[0] && data.itinerary.days[0].activities && data.itinerary.days[0].activities[0]) {
              newActivity = data.itinerary.days[0].activities[0];
            }
            // Fallback to raw response parsing
            else if (data.rawResponse) {
              let cleanedResponse = data.rawResponse.trim();
              if (cleanedResponse.startsWith('```json')) {
                cleanedResponse = cleanedResponse.replace(/^```json\n?/, '').replace(/\n?```$/, '');
              } else if (cleanedResponse.startsWith('```')) {
                cleanedResponse = cleanedResponse.replace(/^```\n?/, '').replace(/\n?```$/, '');
              }

              const parsed = JSON.parse(cleanedResponse);

              if (parsed.days && parsed.days[0] && parsed.days[0].activities && parsed.days[0].activities[0]) {
                newActivity = parsed.days[0].activities[0];
              } else if (parsed.title && parsed.time && parsed.location) {
                newActivity = parsed;
              }
            }

            if (!newActivity) {
              throw new Error("No valid activity in response");
            }

            // Update the itinerary with the new activity
            const newDays = [...itinerary.days];
            newDays[dayIndex] = {
              ...newDays[dayIndex],
              activities: newDays[dayIndex].activities.map((act, i) =>
                i === actIndex ? newActivity! : act
              ),
            };

            const newTotalCost = newDays.reduce(
              (sum, day) => sum + day.activities.reduce((daySum, act) => daySum + act.estimatedCost, 0),
              0
            );

            setItinerary({
              ...itinerary,
              days: newDays,
              totalEstimatedCost: newTotalCost,
            });
          } catch (error) {
            console.error("Error parsing refreshed activity:", error, data.rawResponse);
          }
          setRefreshingActivityPosition(null);
        },
        onError: (error) => {
          console.error("Error refreshing activity:", error);
          setRefreshingActivityPosition(null);
        },
      }
    );
  };

  const handleAddActivity = async () => {
    if (!itinerary || addActivityDayIndex === null) return;

    setIsAddingActivity(true);

    const currentDay = itinerary.days[addActivityDayIndex];

    // Build context for generating a new activity
    const likedTags = Object.entries(preferenceScores)
      .filter(([, score]) => score > 0)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([tag]) => tag)
      .join(", ");

    // Convert 24h time to 12h format for display
    const [hours, minutes] = newActivityTime.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    const formattedTime = `${displayHour}:${minutes} ${ampm}`;

    const prompt = `Generate a SINGLE new activity for an itinerary.

CONTEXT:
- Destination: ${itinerary.destination}
- Day: ${currentDay.date} (Day ${currentDay.dayNumber})
- Time slot: ${formattedTime}
- Activity type requested: ${newActivityType}
- User preferences: ${likedTags || "general sightseeing"}
- Dietary restrictions: ${dietaryNeeds.length > 0 ? dietaryNeeds.join(", ") : "None"}
- Food allergies: ${foodAllergies || "None"}

Generate a suitable ${newActivityType} activity for this time slot.

Return ONLY a single JSON object (no array, no wrapper):
{
  "time": "${formattedTime}",
  "title": "Activity Name",
  "location": "Specific Location",
  "description": "Brief description",
  "estimatedCost": 0,
  "type": "${newActivityType}",
  "detailedInfo": "Detailed information about this place",
  "websiteUrl": "https://example.com or null",
  "rating": 4.5,
  "menuHighlights": ${newActivityType === 'food' ? '["Dish 1", "Dish 2", "Dish 3"]' : 'null'}
}`;

    generateItinerary(
      { prompt },
      {
        onSuccess: (data) => {
          try {
            let newActivity: Activity;

            if (data.rawResponse) {
              let cleanedResponse = data.rawResponse.trim();
              if (cleanedResponse.startsWith('```json')) {
                cleanedResponse = cleanedResponse.replace(/^```json\n?/, '').replace(/\n?```$/, '');
              } else if (cleanedResponse.startsWith('```')) {
                cleanedResponse = cleanedResponse.replace(/^```\n?/, '').replace(/\n?```$/, '');
              }

              const parsed = JSON.parse(cleanedResponse);

              if (parsed.title && parsed.time && parsed.location) {
                newActivity = parsed;
              } else if (parsed.days && parsed.days[0] && parsed.days[0].activities && parsed.days[0].activities[0]) {
                newActivity = parsed.days[0].activities[0];
              } else {
                throw new Error("Unexpected response structure");
              }
            } else if (data.itinerary && data.itinerary.days && data.itinerary.days[0]) {
              newActivity = data.itinerary.days[0].activities[0];
            } else {
              throw new Error("No valid activity in response");
            }

            // Add the new activity to the day's activities
            const newDays = [...itinerary.days];
            const updatedActivities = [...newDays[addActivityDayIndex].activities, newActivity];

            // Sort activities by time
            updatedActivities.sort((a, b) => {
              const timeA = a.time.toLowerCase();
              const timeB = b.time.toLowerCase();
              const parseTime = (t: string) => {
                const match = t.match(/(\d+):(\d+)\s*(am|pm)/i);
                if (!match) return 0;
                let h = parseInt(match[1]);
                const m = parseInt(match[2]);
                const ispm = match[3].toLowerCase() === "pm";
                if (ispm && h !== 12) h += 12;
                if (!ispm && h === 12) h = 0;
                return h * 60 + m;
              };
              return parseTime(timeA) - parseTime(timeB);
            });

            newDays[addActivityDayIndex] = {
              ...newDays[addActivityDayIndex],
              activities: updatedActivities,
            };

            const newTotalCost = newDays.reduce(
              (sum, day) => sum + day.activities.reduce((daySum, act) => daySum + act.estimatedCost, 0),
              0
            );

            setItinerary({
              ...itinerary,
              days: newDays,
              totalEstimatedCost: newTotalCost,
            });

            setAddActivityDialogOpen(false);
            setNewActivityTime("12:00");
            setNewActivityType("activity");
          } catch (error) {
            console.error("Error parsing new activity:", error);
          }
          setIsAddingActivity(false);
        },
        onError: (error) => {
          console.error("Error adding activity:", error);
          setIsAddingActivity(false);
        },
      }
    );
  };

  const handleActivityDragStart = (dayIndex: number, actIndex: number) => {
    setDraggedActivity({ dayIndex, actIndex });
  };

  const handleActivityDragOver = (e: React.DragEvent, dayIndex: number, actIndex: number) => {
    e.preventDefault();
    if (draggedActivity && (draggedActivity.dayIndex !== dayIndex || draggedActivity.actIndex !== actIndex)) {
      setDragOverActivity({ dayIndex, actIndex });
    }
  };

  // Helper function to determine meal type based on time
  const getMealTypeFromTime = (time: string): string | null => {
    const match = time.match(/(\d+):(\d+)\s*(am|pm)/i);
    if (!match) return null;
    let hour = parseInt(match[1]);
    const isPm = match[3].toLowerCase() === "pm";
    if (isPm && hour !== 12) hour += 12;
    if (!isPm && hour === 12) hour = 0;

    if (hour >= 6 && hour < 11) return "Breakfast";
    if (hour >= 11 && hour < 15) return "Lunch";
    if (hour >= 17 && hour < 22) return "Dinner";
    return null;
  };

  // Helper function to update meal title based on new time slot
  const updateMealTitle = (activity: Activity, newTime: string): Activity => {
    if (activity.type !== "food") return { ...activity, time: newTime };

    const newMealType = getMealTypeFromTime(newTime);
    const oldMealType = getMealTypeFromTime(activity.time);

    // Only update if we have a valid new meal time and it differs from old
    if (newMealType && newMealType !== oldMealType) {
      let newTitle = activity.title;
      // Replace meal type in title using a more robust matching
      const mealPatterns = [
        { pattern: /\bbreakfast\b/gi, replacement: newMealType },
        { pattern: /\blunch\b/gi, replacement: newMealType },
        { pattern: /\bdinner\b/gi, replacement: newMealType },
        { pattern: /\bbrunch\b/gi, replacement: newMealType },
      ];

      let titleChanged = false;
      for (const { pattern, replacement } of mealPatterns) {
        if (pattern.test(activity.title)) {
          // Reset lastIndex due to global flag
          pattern.lastIndex = 0;
          newTitle = activity.title.replace(pattern, replacement);
          titleChanged = true;
          break;
        }
      }

      // If the title starts with a meal-related word (like "Breakfast at..."), also update
      if (!titleChanged) {
        const startsWithMeal = /^(breakfast|lunch|dinner|brunch)\s/i.test(activity.title);
        if (startsWithMeal) {
          newTitle = activity.title.replace(/^(breakfast|lunch|dinner|brunch)\s/i, `${newMealType} `);
        }
      }

      return { ...activity, time: newTime, title: newTitle };
    }
    return { ...activity, time: newTime };
  };

  // Helper to parse time string to minutes since midnight
  const parseTimeToMinutes = (time: string): number => {
    const match = time.match(/(\d+):(\d+)\s*(am|pm)/i);
    if (!match) return 8 * 60; // Default to 8 AM
    let hour = parseInt(match[1]);
    const minutes = parseInt(match[2]);
    const isPm = match[3].toLowerCase() === "pm";
    if (isPm && hour !== 12) hour += 12;
    if (!isPm && hour === 12) hour = 0;
    return hour * 60 + minutes;
  };

  // Helper to convert minutes since midnight to time string
  const minutesToTimeString = (totalMinutes: number): string => {
    const clampedMinutes = Math.max(0, Math.min(totalMinutes, 23 * 60 + 59));
    const hour24 = Math.floor(clampedMinutes / 60);
    const minutes = clampedMinutes % 60;
    const ampm = hour24 >= 12 ? "PM" : "AM";
    const displayHour = hour24 % 12 || 12;
    return `${displayHour}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  };

  const handleActivityDrop = (dayIndex: number, actIndex: number) => {
    if (!itinerary || !draggedActivity) return;

    // Only allow reordering within the same day
    if (draggedActivity.dayIndex !== dayIndex) {
      setDraggedActivity(null);
      setDragOverActivity(null);
      return;
    }

    const sourceIdx = draggedActivity.actIndex;

    // If dropping on itself, do nothing
    if (sourceIdx === actIndex) {
      setDraggedActivity(null);
      setDragOverActivity(null);
      return;
    }

    const newDays = [...itinerary.days];
    const activities = [...newDays[dayIndex].activities];
    const movedActivity = { ...activities[sourceIdx] };

    // Determine the new time for the moved activity based on drop position
    let newTimeMinutes: number;

    if (actIndex === 0) {
      // Dropped at the start - take the first activity's time, shift everything else down
      newTimeMinutes = parseTimeToMinutes(activities[0].time);
    } else if (actIndex >= activities.length) {
      // Dropped at the end - place after the last activity
      const lastTime = parseTimeToMinutes(activities[activities.length - 1].time);
      newTimeMinutes = Math.min(lastTime + 90, 22 * 60); // Add 1.5 hours, cap at 10 PM
    } else {
      // Dropped in the middle - take the target position's time
      newTimeMinutes = parseTimeToMinutes(activities[actIndex].time);
    }

    // Remove the activity from its original position
    activities.splice(sourceIdx, 1);

    // Adjust the target index if we removed from before it
    const adjustedTargetIdx = sourceIdx < actIndex ? actIndex - 1 : actIndex;

    // Insert at the new position with the calculated time
    const newTime = minutesToTimeString(newTimeMinutes);
    movedActivity.time = newTime;

    // Update meal title if it's a food activity
    const updatedMovedActivity = updateMealTitle(movedActivity, newTime);
    activities.splice(adjustedTargetIdx, 0, updatedMovedActivity);

    // Now redistribute times for activities that got displaced
    // Only shift activities AFTER the inserted one, not all of them
    const insertedTime = newTimeMinutes;
    let previousEndTime = insertedTime + 90; // Assume 1.5 hours for the moved activity

    for (let i = adjustedTargetIdx + 1; i < activities.length; i++) {
      const actTime = parseTimeToMinutes(activities[i].time);

      // If this activity's time overlaps or is before the previous activity's end time, shift it
      if (actTime < previousEndTime) {
        const shiftedTime = minutesToTimeString(previousEndTime);
        activities[i] = updateMealTitle(activities[i], shiftedTime);
        previousEndTime = previousEndTime + 90; // Each activity takes about 1.5 hours
      } else {
        // No overlap, keep original time but update previousEndTime
        previousEndTime = actTime + 90;
      }
    }

    newDays[dayIndex] = {
      ...newDays[dayIndex],
      activities,
    };

    setItinerary({
      ...itinerary,
      days: newDays,
    });

    setDraggedActivity(null);
    setDragOverActivity(null);
  };

  const handleActivityDragEnd = () => {
    setDraggedActivity(null);
    setDragOverActivity(null);
  };

  // Geocode destination to get coordinates for the map
  const handleOpenMapView = async () => {
    if (!itinerary) return;

    setShowMapView(true);
    setIsLoadingMap(true);

    try {
      // Use Nominatim API to geocode the destination
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(itinerary.destination)}&limit=1`,
        {
          headers: {
            'Accept': 'application/json',
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          setMapCoordinates({
            lat: parseFloat(data[0].lat),
            lon: parseFloat(data[0].lon),
          });
        }
      }
    } catch (error) {
      console.error("Error geocoding destination:", error);
    } finally {
      setIsLoadingMap(false);
    }
  };

  const handleExportPDF = () => {
    if (!itinerary) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;
    let yPosition = 20;

    // Title
    doc.setFontSize(24);
    doc.setTextColor(146, 64, 14); // amber-800
    doc.text(itinerary.destination, pageWidth / 2, yPosition, { align: "center" });
    yPosition += 10;

    // Dates
    doc.setFontSize(12);
    doc.setTextColor(120, 113, 108); // stone-500
    doc.text(
      `${itinerary.tripDates.startDate} - ${itinerary.tripDates.endDate}`,
      pageWidth / 2,
      yPosition,
      { align: "center" }
    );
    yPosition += 15;

    // Separator line
    doc.setDrawColor(217, 119, 6); // amber-600
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;

    // Days
    for (const day of itinerary.days) {
      // Check if we need a new page
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }

      // Day header
      doc.setFontSize(14);
      doc.setTextColor(120, 53, 15); // amber-900
      doc.text(`Day ${day.dayNumber} - ${day.date}`, margin, yPosition);
      yPosition += 8;

      // Activities
      for (const activity of day.activities) {
        // Check if we need a new page
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 20;
        }

        // Time and title
        doc.setFontSize(11);
        doc.setTextColor(8, 145, 178); // cyan-600
        doc.text(activity.time, margin + 5, yPosition);

        doc.setTextColor(120, 53, 15); // amber-900
        doc.text(activity.title, margin + 40, yPosition);

        // Cost
        doc.setTextColor(21, 128, 61); // green-700
        doc.text(`$${activity.estimatedCost}`, pageWidth - margin, yPosition, { align: "right" });
        yPosition += 5;

        // Location
        doc.setFontSize(9);
        doc.setTextColor(120, 113, 108); // stone-500
        doc.text(activity.location, margin + 40, yPosition);
        yPosition += 5;

        // Description (wrapped)
        doc.setTextColor(146, 64, 14); // amber-800
        const descLines = doc.splitTextToSize(activity.description, contentWidth - 45);
        for (const line of descLines) {
          if (yPosition > 280) {
            doc.addPage();
            yPosition = 20;
          }
          doc.text(line, margin + 40, yPosition);
          yPosition += 4;
        }

        // Website link if available
        if (activity.websiteUrl) {
          doc.setTextColor(8, 145, 178); // cyan-600
          doc.textWithLink("Visit Website", margin + 40, yPosition, { url: activity.websiteUrl });
          yPosition += 5;
        }

        yPosition += 3;
      }

      yPosition += 5;
    }

    // Total cost on last page
    if (yPosition > 260) {
      doc.addPage();
      yPosition = 20;
    }
    yPosition += 10;
    doc.setDrawColor(217, 119, 6); // amber-600
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 8;

    doc.setFontSize(14);
    doc.setTextColor(120, 53, 15); // amber-900
    doc.text("Total Estimated Cost:", margin, yPosition);
    doc.setTextColor(21, 128, 61); // green-700
    doc.text(`$${itinerary.totalEstimatedCost.toLocaleString()}`, pageWidth - margin, yPosition, { align: "right" });

    // Footer
    yPosition = doc.internal.pageSize.getHeight() - 10;
    doc.setFontSize(8);
    doc.setTextColor(120, 113, 108); // stone-500
    doc.text("Generated by Tratlus", pageWidth / 2, yPosition, { align: "center" });

    // Save the PDF
    doc.save(`${itinerary.destination.replace(/[^a-z0-9]/gi, "_")}_Itinerary.pdf`);
  };

  const handleReOptimize = () => {
    handleGenerateItinerary();
  };

  // Calculate overall progress
  const totalSwipes = Object.keys(categoryProgress).reduce((acc, category) => {
    const progress = categoryProgress[category as CategoryName];
    const required = REQUIRED_SWIPES_MAP[category as CategoryName];
    return acc + Math.min(progress, required);
  }, 0);
  const maxSwipes = Object.values(REQUIRED_SWIPES_MAP).reduce((a, b) => a + b, 0);
  const overallProgress = Math.round((totalSwipes / maxSwipes) * 100);
  const tratlusScore = Math.min(100, overallProgress);

  // Get required swipes for current category
  const currentRequiredSwipes = REQUIRED_SWIPES_MAP[currentCategory.name];
  const currentCategoryComplete = categoryProgress[currentCategory.name] >= currentRequiredSwipes;
  const pageBgClass = isDarkMode
    ? "from-slate-950 via-slate-900 to-slate-950 text-white"
    : "from-white via-white to-white text-slate-900";
    const glassHeaderClass = isDarkMode
      ? "bg-white/5 border-white/10 shadow-[0_20px_60px_-25px_rgba(59,130,246,0.7)] backdrop-blur-md"
      : "bg-white/30 border-white/30 shadow-[0_20px_60px_-25px_rgba(37,99,235,0.7)] backdrop-blur-md";
    const glassPanelClass = isDarkMode
      ? "bg-white/10 border-white/10 text-white"
      : "bg-white/15 border-white/30 text-slate-900";
  const subTextClass = isDarkMode ? "text-slate-400" : "text-slate-600";
  const badgeGradientClass = isDarkMode
    ? "from-fuchsia-500 via-purple-500 to-sky-500"
    : "from-fuchsia-500 via-purple-500 to-blue-600";
  const primaryGradientButton = isDarkMode
    ? "bg-gradient-to-r from-fuchsia-500 via-purple-500 to-blue-500 text-white shadow-[0_15px_45px_-20px_rgba(59,130,246,0.8)]"
    : "bg-gradient-to-r from-fuchsia-500 via-purple-500 to-blue-600 text-white shadow-[0_15px_45px_-20px_rgba(79,70,229,0.6)]";
    const accentBorderClass = isDarkMode ? "border-white/20 text-white/80 bg-white/5" : "border-white/30 text-slate-700 bg-white/10";

  // Render based on app state
  if (appState === "landing") {
    return (
      <LandingPage onStart={handleStartSwiping} />
    );
  }

  if (appState === "loading") {
    return (
      <div className="h-screen bg-gradient-to-b from-amber-50 to-green-50 flex items-center justify-center p-4 overflow-hidden">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-8 pb-8">
            <Loader2 className="size-16 animate-spin mx-auto mb-4 text-cyan-600" />
            <h2 className="text-xl font-bold text-amber-900 mb-2">Preparing Your Experience</h2>
            <p className="text-amber-700">Loading travel cards and preferences...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (appState === "generating") {
    return (
      <div className="h-screen bg-gradient-to-b from-amber-50 to-green-50 flex items-center justify-center p-4 overflow-hidden">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-8 pb-8">
            <Loader2 className="size-16 animate-spin mx-auto mb-4 text-cyan-600" />
            <h2 className="text-xl font-bold text-amber-900 mb-2">Creating Your Perfect Trip</h2>
            <p className="text-amber-700">Analyzing your preferences and crafting a personalized itinerary...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (appState === "itinerary" && itinerary) {
    return (
      <div className="h-screen bg-gradient-to-b from-amber-50 to-green-50 p-4 overflow-hidden overflow-y-auto">
        <div className="max-w-2xl mx-auto">
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="text-2xl text-amber-900">{itinerary.destination}</CardTitle>
              <CardDescription>
                {itinerary.tripDates.startDate} - {itinerary.tripDates.endDate}
              </CardDescription>
            </CardHeader>
          </Card>

          {itinerary.days.map((day, dayIndex) => (
            <Card key={day.dayNumber} className="mb-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-amber-800">
                  Day {day.dayNumber} - {day.date}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {day.activities.map((activity, actIndex) => {
                  const isTransportBetween = activity.type === "transport-between";

                  // Transport-between blocks are rendered smaller but now draggable
                  if (isTransportBetween) {
                    return (
                      <div
                        key={`${day.dayNumber}-${actIndex}`}
                        className={cn(
                          "flex items-center gap-2 py-1.5 px-3 rounded bg-slate-100 border border-slate-200 text-slate-600 cursor-grab active:cursor-grabbing transition-all",
                          draggedActivity?.dayIndex === dayIndex && draggedActivity?.actIndex === actIndex && "opacity-50 scale-95",
                          dragOverActivity?.dayIndex === dayIndex && dragOverActivity?.actIndex === actIndex && "border-cyan-400 border-2 bg-cyan-50"
                        )}
                        draggable
                        onDragStart={(e) => {
                          e.stopPropagation();
                          handleActivityDragStart(dayIndex, actIndex);
                        }}
                        onDragOver={(e) => handleActivityDragOver(e, dayIndex, actIndex)}
                        onDrop={() => handleActivityDrop(dayIndex, actIndex)}
                        onDragEnd={handleActivityDragEnd}
                      >
                        <GripVertical className="size-3 text-slate-400" />
                        <Car className="size-3.5 text-slate-400" />
                        <span className="text-xs font-medium text-slate-500 min-w-[55px]">
                          {activity.time}
                        </span>
                        <span className="text-xs flex-1">{activity.title}</span>
                        <span className="text-xs text-slate-500">{activity.description}</span>
                        {activity.estimatedCost > 0 && (
                          <span className="text-xs text-green-600">${activity.estimatedCost}</span>
                        )}
                      </div>
                    );
                  }

                  // Main activity blocks - larger and draggable
                  return (
                    <div
                      key={`${day.dayNumber}-${actIndex}`}
                      className={cn(
                        "flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-100 cursor-pointer hover:bg-amber-100 hover:border-amber-200 transition-all group",
                        draggedActivity?.dayIndex === dayIndex && draggedActivity?.actIndex === actIndex && "opacity-50 scale-95",
                        dragOverActivity?.dayIndex === dayIndex && dragOverActivity?.actIndex === actIndex && "border-cyan-400 border-2 bg-cyan-50",
                        refreshingActivityPosition?.dayIndex === dayIndex && refreshingActivityPosition?.actIndex === actIndex && "opacity-50"
                      )}
                      onClick={() => {
                        setSelectedActivity(activity);
                        setSelectedActivityPosition({ dayIndex, actIndex });
                        setActivityDialogOpen(true);
                      }}
                      draggable
                      onDragStart={(e) => {
                        e.stopPropagation();
                        handleActivityDragStart(dayIndex, actIndex);
                      }}
                      onDragOver={(e) => handleActivityDragOver(e, dayIndex, actIndex)}
                      onDrop={() => handleActivityDrop(dayIndex, actIndex)}
                      onDragEnd={handleActivityDragEnd}
                    >
                      {/* Drag Handle */}
                      <div
                        className="flex items-center self-stretch cursor-grab active:cursor-grabbing text-amber-400 hover:text-amber-600"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <GripVertical className="size-4" />
                      </div>
                      <div className="text-sm font-medium text-cyan-700 min-w-[70px]">
                        {activity.time}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-amber-900">{activity.title}</h4>
                          <Info className="size-3.5 text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <p className="text-sm text-amber-700">{activity.location}</p>
                        <p className="text-sm text-amber-600 mt-1">{activity.description}</p>
                      </div>
                      <div className="text-right flex flex-col items-end gap-1">
                        <span className="text-sm font-medium text-green-700">
                          ${activity.estimatedCost}
                        </span>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7 text-cyan-500 hover:text-cyan-700 hover:bg-cyan-50"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleInlineRefreshActivity(dayIndex, actIndex);
                            }}
                            disabled={refreshingActivityPosition?.dayIndex === dayIndex && refreshingActivityPosition?.actIndex === actIndex}
                          >
                            {refreshingActivityPosition?.dayIndex === dayIndex && refreshingActivityPosition?.actIndex === actIndex ? (
                              <Loader2 className="size-3.5 animate-spin" />
                            ) : (
                              <RefreshCw className="size-3.5" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7 text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteActivity(dayIndex, actIndex);
                            }}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Add Activity Button */}
                <Button
                  variant="outline"
                  className="w-full border-dashed border-amber-300 text-amber-600 hover:bg-amber-50 hover:border-amber-400"
                  onClick={() => {
                    setAddActivityDayIndex(dayIndex);
                    setAddActivityDialogOpen(true);
                  }}
                >
                  <Plus className="size-4 mr-2" />
                  Add Activity
                </Button>
              </CardContent>
            </Card>
          ))}

          <Card className="mb-4">
            <CardContent className="flex items-center justify-between py-4">
              <span className="text-lg font-bold text-amber-900">Total Estimated Cost</span>
              <span className="text-2xl font-bold text-green-700">
                ${itinerary.totalEstimatedCost.toLocaleString()}
              </span>
            </CardContent>
          </Card>

          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={() => setAppState("questionnaire")}
              variant="outline"
              className="flex-1"
            >
              <ChevronLeft className="size-4 mr-2" />
              Back to Questionnaire
            </Button>
            <Button
              onClick={handleReOptimize}
              className="flex-1 bg-cyan-600 hover:bg-cyan-700"
              disabled={isGenerating}
            >
              <RefreshCw className="size-4 mr-2" />
              Re-optimize Itinerary
            </Button>
            <Button
              onClick={handleReset}
              variant="outline"
              className="border-red-300 text-red-600 hover:bg-red-50"
            >
              <RotateCcw className="size-4 mr-2" />
              Start Over
            </Button>
          </div>

          {/* Export & Share Buttons */}
          <div className="flex gap-2 flex-wrap mt-4">
            <Button
              onClick={handleExportPDF}
              variant="outline"
              className="flex-1 border-amber-300 text-amber-700 hover:bg-amber-50"
            >
              <Download className="size-4 mr-2" />
              Export PDF
            </Button>
            <Button
              onClick={() => {
                if (!itinerary) return;
                const subject = encodeURIComponent(`My ${itinerary.destination} Itinerary`);
                const body = encodeURIComponent(
                  `Check out my travel itinerary for ${itinerary.destination}!\n\n` +
                  `Dates: ${itinerary.tripDates.startDate} - ${itinerary.tripDates.endDate}\n` +
                  `Total Estimated Cost: $${itinerary.totalEstimatedCost}\n\n` +
                  itinerary.days.map(day =>
                    `Day ${day.dayNumber} (${day.date}):\n` +
                    day.activities.map(act => `  - ${act.time}: ${act.title} at ${act.location}`).join('\n')
                  ).join('\n\n') +
                  '\n\nGenerated by Tratlus'
                );
                window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
              }}
              variant="outline"
              className="flex-1 border-cyan-300 text-cyan-700 hover:bg-cyan-50"
            >
              <Mail className="size-4 mr-2" />
              Email Itinerary
            </Button>
            <Button
              onClick={() => {
                if (!itinerary) return;
                // Create Google Calendar event URL for the first day
                const startDate = itinerary.tripDates.startDate.replace(/-/g, '');
                const endDate = itinerary.tripDates.endDate.replace(/-/g, '');
                const title = encodeURIComponent(`Trip to ${itinerary.destination}`);
                const details = encodeURIComponent(
                  `Travel itinerary for ${itinerary.destination}\n\n` +
                  `Total Estimated Cost: $${itinerary.totalEstimatedCost}\n\n` +
                  itinerary.days.map(day =>
                    `Day ${day.dayNumber}:\n` +
                    day.activities.map(act => `${act.time}: ${act.title}`).join('\n')
                  ).join('\n\n')
                );
                const location = encodeURIComponent(itinerary.destination);
                const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDate}/${endDate}&details=${details}&location=${location}`;
                window.open(calendarUrl, '_blank');
              }}
              variant="outline"
              className="flex-1 border-green-300 text-green-700 hover:bg-green-50"
            >
              <CalendarPlus className="size-4 mr-2" />
              Add to Calendar
            </Button>
          </div>

          {/* Explore & Map Buttons */}
          <div className="flex gap-2 flex-wrap mt-4">
            <Button
              onClick={() => setShowNearbyActivities(true)}
              variant="outline"
              className="flex-1 border-purple-300 text-purple-700 hover:bg-purple-50"
              disabled={isLoadingNearby}
            >
              {isLoadingNearby ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <Compass className="size-4 mr-2" />
                  Nearby Activities
                </>
              )}
            </Button>
            <Button
              onClick={handleOpenMapView}
              variant="outline"
              className="flex-1 border-blue-300 text-blue-700 hover:bg-blue-50"
            >
              <Map className="size-4 mr-2" />
              View Map
            </Button>
          </div>
        </div>

        {/* Nearby Activities Panel */}
        <Dialog open={showNearbyActivities} onOpenChange={setShowNearbyActivities}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-amber-900 flex items-center gap-2">
                <Compass className="size-5" />
                Nearby Activities in {itinerary.destination}
              </DialogTitle>
              <DialogDescription>
                Select activities to add to your itinerary
              </DialogDescription>
            </DialogHeader>

            {/* Category Filter */}
            <div className="flex gap-2 flex-wrap mt-4">
              {[ 
                { id: "all", label: "All", icon: <Sparkles className="size-3" /> },
                { id: "food", label: "Food", icon: <Coffee className="size-3" /> },
                { id: "attraction", label: "Attractions", icon: <Landmark className="size-3" /> },
                { id: "activity", label: "Activities", icon: <TreePine className="size-3" /> },
              ].map((cat) => (
                <Button
                  key={cat.id}
                  variant={nearbyCategory === cat.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setNearbyCategory(cat.id)}
                  className={cn(
                    "text-xs",
                    nearbyCategory === cat.id && "bg-amber-600 hover:bg-amber-700"
                  )}
                >
                  {cat.icon}
                  <span className="ml-1">{cat.label}</span>
                </Button>
              ))}
            </div>

            {/* Activities List */}
            <div className="mt-4 space-y-3">
              {isLoadingNearby ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="size-8 animate-spin text-amber-600" />
                </div>
              ) : nearbyActivities.length === 0 ? (
                <p className="text-center text-amber-600 py-8">
                  No nearby activities found. Try refreshing.
                </p>
              ) : (
                nearbyActivities
                  .filter((act) => nearbyCategory === "all" || act.type === nearbyCategory)
                  .map((activity, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-amber-50 border border-amber-100"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            {activity.type === "food" && <Utensils className="size-4 text-amber-600" />}
                            {activity.type === "attraction" && <Camera className="size-4 text-cyan-600" />}
                            {activity.type === "activity" && <Compass className="size-4 text-green-600" />}
                            <h4 className="font-medium text-amber-900">{activity.title}</h4>
                            {activity.rating && (
                              <div className="flex items-center gap-1 text-xs text-yellow-600">
                                <Star className="size-3 fill-yellow-500" />
                                {activity.rating}
                              </div>
                            )}
                          </div>
                          <p className="text-sm text-amber-700 mt-1">{activity.location}</p>
                          <p className="text-sm text-amber-600">{activity.description}</p>
                          <span className="text-sm font-medium text-green-700">
                            ${activity.estimatedCost}
                          </span>
                        </div>
                        <div className="flex flex-col gap-1">
                          {itinerary.days.map((day, dayIdx) => (
                            <Button
                              key={dayIdx}
                              size="sm"
                              variant="outline"
                              className="text-xs border-cyan-300 text-cyan-700 hover:bg-cyan-50"
                              onClick={() => handleAddNearbyActivity(activity, dayIdx)}
                            >
                              <Plus className="size-3 mr-1" />
                              Day {day.dayNumber}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Map View Dialog */}
        <Dialog open={showMapView} onOpenChange={setShowMapView}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-amber-900 flex items-center gap-2">
                <Map className="size-5" />
                Trip Map - {itinerary.destination}
              </DialogTitle>
              <DialogDescription>
                Your complete itinerary visualized on a map
              </DialogDescription>
            </DialogHeader>

            {/* Map Legend */}
            <div className="flex gap-4 flex-wrap mt-4 p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-2 text-sm">
                <div className="size-3 rounded-full bg-amber-500" />
                <span>Food</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="size-3 rounded-full bg-cyan-500" />
                <span>Attractions</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="size-3 rounded-full bg-green-500" />
                <span>Activities</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="size-3 rounded-full bg-purple-500" />
                <span>Accommodation</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="size-3 rounded-full bg-blue-500" />
                <span>Transportation</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="size-3 rounded-full bg-slate-400" />
                <span>Transit Between</span>
              </div>
            </div>

            {/* Interactive Map Embed */}
            <div className="mt-4 rounded-lg overflow-hidden border border-slate-200">
              {isLoadingMap ? (
                <div className="h-[450px] flex items-center justify-center bg-slate-100">
                  <div className="text-center">
                    <Loader2 className="size-8 animate-spin text-blue-500 mx-auto mb-2" />
                    <p className="text-sm text-slate-600">Loading map for {itinerary.destination}...</p>
                  </div>
                </div>
              ) : mapCoordinates ? (
                <iframe
                  title="Trip Map"
                  width="100%"
                  height="450"
                  frameBorder="0"
                  style={{ border: 0 }}
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${mapCoordinates.lon - 0.15},${mapCoordinates.lat - 0.1},${mapCoordinates.lon + 0.15},${mapCoordinates.lat + 0.1}&layer=mapnik&marker=${mapCoordinates.lat},${mapCoordinates.lon}`}
                  allowFullScreen
                />
              ) : (
                <div className="h-[450px] flex items-center justify-center bg-slate-100">
                  <div className="text-center p-6">
                    <Map className="size-12 text-slate-400 mx-auto mb-3" />
                    <p className="text-sm text-slate-600 mb-4">
                      Unable to load map preview for {itinerary.destination}
                    </p>
                    <p className="text-xs text-slate-500">
                      Use the buttons below to view the location in your preferred map app
                    </p>
                  </div>
                </div>
              )}
              <div className="p-3 bg-slate-100 space-y-2">
                <div className="flex gap-2 justify-center flex-wrap">
                  <a
                    href={mapCoordinates
                      ? `https://www.google.com/maps/@${mapCoordinates.lat},${mapCoordinates.lon},13z`
                      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(itinerary.destination)}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors"
                  >
                    <Navigation className="size-3" />
                    Open in Google Maps
                  </a>
                  <a
                    href={mapCoordinates
                      ? `https://www.openstreetmap.org/?mlat=${mapCoordinates.lat}&mlon=${mapCoordinates.lon}#map=13/${mapCoordinates.lat}/${mapCoordinates.lon}`
                      : `https://www.openstreetmap.org/search?query=${encodeURIComponent(itinerary.destination)}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition-colors"
                  >
                    <Map className="size-3" />
                    Open in OpenStreetMap
                  </a>
                </div>
                {mapCoordinates && (
                  <p className="text-xs text-slate-500 text-center">
                    Showing {itinerary.destination} ({mapCoordinates.lat.toFixed(4)}, {mapCoordinates.lon.toFixed(4)})
                  </p>
                )}
              </div>
            </div>

            {/* Route Summary by Day */}
            <div className="mt-4 space-y-3">
              <h4 className="font-medium text-amber-900">Route Summary</h4>
              {itinerary.days.map((day) => (
                <div key={day.dayNumber} className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                  <h5 className="font-medium text-amber-800 mb-2">
                    Day {day.dayNumber} - {day.date}
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {day.activities.map((activity, idx) => {
                      const colorClass =
                        activity.type === "food" ? "bg-amber-500" :
                        activity.type === "attraction" ? "bg-cyan-500" :
                        activity.type === "activity" ? "bg-green-500" :
                        activity.type === "accommodation" ? "bg-purple-500" :
                        activity.type === "transportation" ? "bg-blue-500" :
                        activity.type === "transport-between" ? "bg-slate-400" :
                        "bg-gray-400";

                      return (
                        <div key={idx} className="flex items-center gap-1">
                          <div className={cn("size-2 rounded-full", colorClass)} />
                          <span className="text-xs text-amber-700">
                            {activity.title}
                          </span>
                          {idx < day.activities.length - 1 && (
                            <ChevronRight className="size-3 text-amber-400" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Google Maps Links for Each Day */}
            <div className="mt-4">
              <h4 className="font-medium text-amber-900 mb-2">Get Directions</h4>
              <div className="flex gap-2 flex-wrap">
                {itinerary.days.map((day) => {
                  // Create a Google Maps directions URL with all locations
                  const mainActivities = day.activities.filter(a => a.type !== "transport-between");
                  const locations = mainActivities.map(a => encodeURIComponent(a.location + ", " + itinerary.destination)).join("/");
                  const mapsUrl = `https://www.google.com/maps/dir/${locations}`;

                  return (
                    <a
                      key={day.dayNumber}
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200 transition-colors"
                    >
                      <Navigation className="size-3" />
                      Day {day.dayNumber} Route
                    </a>
                  );
                })}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Activity Detail Dialog */}
        <Dialog open={activityDialogOpen} onOpenChange={setActivityDialogOpen}>
          <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
            {selectedActivity && (
              <>
                <DialogHeader>
                  <div className="flex items-center gap-2">
                    {selectedActivity.type === 'food' && <Utensils className="size-5 text-amber-600" />}
                    {selectedActivity.type === 'attraction' && <Camera className="size-5 text-cyan-600" />}
                    {selectedActivity.type === 'transportation' && <Bus className="size-5 text-blue-600" />}
                    {selectedActivity.type === 'accommodation' && <Bed className="size-5 text-purple-600" />}
                    {selectedActivity.type === 'activity' && <Compass className="size-5 text-green-600" />}
                    {!selectedActivity.type && <MapPin className="size-5 text-amber-600" />}
                    <DialogTitle className="text-amber-900">{selectedActivity.title}</DialogTitle>
                  </div>
                  <DialogDescription className="flex items-center gap-2 text-amber-700">
                    <MapPin className="size-4" />
                    {selectedActivity.location}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 mt-4">
                  {/* Time and Cost */}
                  <div className="flex items-center justify-between py-2 px-3 bg-amber-50 rounded-lg">
                    <div className="flex items-center gap-2 text-cyan-700">
                      <Clock className="size-4" />
                      <span className="font-medium">{selectedActivity.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-green-700">
                      <DollarSign className="size-4" />
                      <span className="font-medium">${selectedActivity.estimatedCost}</span>
                    </div>
                  </div>

                  {/* Rating */}
                  {selectedActivity.rating && (
                    <div className="flex items-center gap-2">
                      <Star className="size-4 text-yellow-500 fill-yellow-500" />
                      <span className="font-medium text-amber-900">{selectedActivity.rating.toFixed(1)}</span>
                      <span className="text-amber-600 text-sm">/ 5.0</span>
                    </div>
                  )}

                  {/* Description */}
                  <div>
                    <h4 className="font-medium text-amber-900 mb-2">Description</h4>
                    <p className="text-amber-700 text-sm leading-relaxed">{selectedActivity.description}</p>
                  </div>

                  {/* Detailed Info */}
                  {selectedActivity.detailedInfo && (
                    <div>
                      <h4 className="font-medium text-amber-900 mb-2 flex items-center gap-2">
                        <Info className="size-4" />
                        More Details
                      </h4>
                      <p className="text-amber-700 text-sm leading-relaxed">{selectedActivity.detailedInfo}</p>
                    </div>
                  )}

                  {/* Menu Highlights (for food activities) */}
                  {selectedActivity.menuHighlights && selectedActivity.menuHighlights.length > 0 && (
                    <div>
                      <h4 className="font-medium text-amber-900 mb-2 flex items-center gap-2">
                        <Utensils className="size-4" />
                        Menu Highlights
                      </h4>
                      <ul className="space-y-1">
                        {selectedActivity.menuHighlights.map((item, idx) => (
                          <li key={idx} className="text-amber-700 text-sm flex items-center gap-2">
                            <span className="size-1.5 rounded-full bg-amber-400" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Website Link */}
                  {selectedActivity.websiteUrl && (
                    <a
                      href={selectedActivity.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-cyan-600 hover:text-cyan-700 text-sm font-medium"
                    >
                      <ExternalLink className="size-4" />
                      Visit Website
                    </a>
                  )}
                </div>

                <div className="mt-6 flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setActivityDialogOpen(false)}
                  >
                    Close
                  </Button>
                  <Button
                    className="flex-1 bg-cyan-600 hover:bg-cyan-700"
                    onClick={handleRefreshActivity}
                    disabled={isRefreshingActivity}
                  >
                    {isRefreshingActivity ? (
                      <>
                        <Loader2 className="size-4 mr-2 animate-spin" />
                        Refreshing...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="size-4 mr-2" />
                        Find Alternative
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Add Activity Dialog */}
        <Dialog open={addActivityDialogOpen} onOpenChange={setAddActivityDialogOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-amber-900">Add New Activity</DialogTitle>
              <DialogDescription>
                {addActivityDayIndex !== null && itinerary && (
                  <>Add an activity for Day {itinerary.days[addActivityDayIndex].dayNumber}</>
                )}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              <div>
                <Label className="mb-2 block">Time</Label>
                <Input
                  type="time"
                  value={newActivityTime}
                  onChange={(e) => setNewActivityTime(e.target.value)}
                />
              </div>

              <div>
                <Label className="mb-2 block">Activity Type</Label>
                <div className="grid grid-cols-2 gap-2">
                  {[ 
                    { value: "food", label: "Food", icon: <Utensils className="size-4" /> },
                    { value: "attraction", label: "Attraction", icon: <Camera className="size-4" /> },
                    { value: "activity", label: "Activity", icon: <Compass className="size-4" /> },
                    { value: "transportation", label: "Transport", icon: <Bus className="size-4" /> },
                  ].map((type) => (
                    <Button
                      key={type.value}
                      variant={newActivityType === type.value ? "default" : "outline"}
                      className={cn(
                        "flex items-center gap-2 justify-start",
                        newActivityType === type.value && "bg-cyan-600 hover:bg-cyan-700"
                      )}
                      onClick={() => setNewActivityType(type.value)}
                    >
                      {type.icon}
                      {type.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setAddActivityDialogOpen(false);
                  setNewActivityTime("12:00");
                  setNewActivityType("activity");
                }}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-cyan-600 hover:bg-cyan-700"
                onClick={handleAddActivity}
                disabled={isAddingActivity}
              >
                {isAddingActivity ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Plus className="size-4 mr-2" />
                    Add Activity
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  if (appState === "questionnaire") {
    return (
      <div className="h-screen bg-gradient-to-b from-amber-50 to-green-50 p-4 overflow-hidden overflow-y-auto">
        <div className="max-w-lg mx-auto">
          <div className="mb-6">
            <Progress value={(questionnaireStep / 3) * 100} className="h-2" />
            <p className="text-center text-sm text-amber-700 mt-2">Step {questionnaireStep} of 3</p>
          </div>

          {questionnaireStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-amber-900">Food Preferences</CardTitle>
                <CardDescription>Tell us about your dining preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="mb-3 block">Dietary Requirements</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {["Vegetarian", "Vegan", "Gluten-Free", "Halal", "Kosher", "None"].map((diet) => (
                      <label key={diet} className="flex items-center gap-2 cursor-pointer">
                        <Checkbox
                          checked={dietaryNeeds.includes(diet)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setDietaryNeeds([...dietaryNeeds, diet]);
                            } else {
                              setDietaryNeeds(dietaryNeeds.filter((d) => d !== diet));
                            }
                          }}
                        />
                        <span className="text-sm">{diet}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="mb-3 block">Food Allergies</Label>
                  <Input
                    placeholder="e.g., peanuts, shellfish, dairy..."
                    value={foodAllergies}
                    onChange={(e) => setFoodAllergies(e.target.value)}
                  />
                  <p className="text-xs text-amber-600 mt-1">List any food allergies separated by commas</p>
                </div>

                <div>
                  <Label className="mb-3 block">Meal Budget</Label>
                  <div className="flex gap-2">
                    {["$", "$$", "$$$", "$$$$"].map((budget) => (
                      <Button
                        key={budget}
                        variant={mealBudget === budget ? "default" : "outline"}
                        onClick={() => setMealBudget(budget)}
                        className="flex-1"
                      >
                        {budget}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="mb-3 block">Food Adventurousness: {foodAdventurousness}/10</Label>
                  <Slider
                    value={[foodAdventurousness]}
                    onValueChange={([val]) => setFoodAdventurousness(val)}
                    min={1}
                    max={10}
                    step={1}
                  />
                  <div className="flex justify-between text-xs text-amber-600 mt-1">
                    <span>Familiar</span>
                    <span>Adventurous</span>
                  </div>
                </div>

                <div>
                  <Label className="mb-3 block">Favorite Cuisines</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {["Italian", "Chinese", "Japanese", "Mexican", "Indian", "Thai", "French", "Mediterranean", "American", "Korean", "Vietnamese", "Greek", "African"].map((cuisine) => (
                      <label key={cuisine} className="flex items-center gap-2 cursor-pointer">
                        <Checkbox
                          checked={favoriteCuisines.includes(cuisine)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFavoriteCuisines([...favoriteCuisines, cuisine]);
                            } else {
                              setFavoriteCuisines(favoriteCuisines.filter((c) => c !== cuisine));
                            }
                          }}
                        />
                        <span className="text-xs">{cuisine}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setAppState("swiping")} className="flex-1 active:scale-95">
                    <ChevronLeft className="size-4 mr-2" /> Back to Swiping
                  </Button>
                  <Button onClick={() => setQuestionnaireStep(2)} className="flex-1 bg-cyan-600 hover:bg-cyan-700 active:scale-95">
                    Next <ChevronRight className="size-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {questionnaireStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-amber-900">Transportation & Accommodation</CardTitle>
                <CardDescription>How do you like to travel and where do you stay?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="mb-3 block">Transportation Method</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {["Uber/Lyft", "Transit", "Rental", "Flight", "Bike", "Walk", "Limousine"].map((method) => (
                      <label key={method} className="flex items-center gap-2 cursor-pointer">
                        <Checkbox
                          checked={transportationMethod.includes(method)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setTransportationMethod([...transportationMethod, method]);
                            } else {
                              setTransportationMethod(transportationMethod.filter((m) => m !== method));
                            }
                          }}
                        />
                        <span className="text-sm">{method}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="mb-3 block">Priority</Label>
                  <div className="flex flex-wrap gap-2">
                    {[ 
                      { value: "speed" as const, label: "Speed", desc: "Fastest route" },
                      { value: "cost" as const, label: "Cost", desc: "Cheapest option" },
                      { value: "comfort" as const, label: "Comfort", desc: "Most comfortable" },
                    ].map((option) => (
                      <Button
                        key={option.value}
                        variant={transportationPriority === option.value ? "default" : "outline"}
                        onClick={() => setTransportationPriority(option.value)}
                        className="flex-1 flex-col h-auto py-3"
                      >
                        <span>{option.label}</span>
                        <span className="text-xs opacity-70">{option.desc}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="mb-3 block">Accommodation Type</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {["Hotel", "Resort", "Airbnb", "Hostel", "Boutique", "Villa"].map((type) => (
                      <label key={type} className="flex items-center gap-2 cursor-pointer">
                        <Checkbox
                          checked={accommodationType.includes(type)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setAccommodationType([...accommodationType, type]);
                            } else {
                              setAccommodationType(accommodationType.filter((t) => t !== type));
                            }
                          }}
                        />
                        <span className="text-sm">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="mb-3 block">Must-Have Amenities</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {["Pool", "Gym", "WiFi", "Kitchen", "Parking", "AC"].map((amenity) => (
                      <label key={amenity} className="flex items-center gap-2 cursor-pointer">
                        <Checkbox
                          checked={amenities.includes(amenity)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setAmenities([...amenities, amenity]);
                            } else {
                              setAmenities(amenities.filter((a) => a !== amenity));
                            }
                          }}
                        />
                        <span className="text-sm">{amenity}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="mb-3 block">Star Rating: {starRatingMin} - {starRatingMax} stars</Label>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <Label className="text-xs text-amber-600">Minimum</Label>
                      <Slider
                        value={[starRatingMin]}
                        onValueChange={([val]) => {
                          setStarRatingMin(val);
                          if (val > starRatingMax) setStarRatingMax(val);
                        }}
                        min={1}
                        max={5}
                        step={1}
                      />
                    </div>
                    <div className="flex-1">
                      <Label className="text-xs text-amber-600">Maximum</Label>
                      <Slider
                        value={[starRatingMax]}
                        onValueChange={([val]) => {
                          setStarRatingMax(val);
                          if (val < starRatingMin) setStarRatingMin(val);
                        }}
                        min={1}
                        max={5}
                        step={1}
                      />
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-amber-600 mt-1">
                    <span>1 star</span>
                    <span>5 stars</span>
                  </div>
                </div>

                <div>
                  <Label className="mb-3 block">Price Per Night: ${pricePerNight}</Label>
                  <Slider
                    value={[pricePerNight]}
                    onValueChange={([val]) => setPricePerNight(val)}
                    min={50}
                    max={500}
                    step={25}
                  />
                  <div className="flex justify-between text-xs text-amber-600 mt-1">
                    <span>$50</span>
                    <span>$500</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setQuestionnaireStep(1)} className="flex-1">
                    <ChevronLeft className="size-4 mr-2" /> Back
                  </Button>
                  <Button onClick={() => setQuestionnaireStep(3)} className="flex-1 bg-cyan-600 hover:bg-cyan-700">
                    Next <ChevronRight className="size-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {questionnaireStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-amber-900">Trip Details</CardTitle>
                <CardDescription>When and where are you going?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="mb-2 block">Wake Up Time</Label>
                    <Input
                      type="time"
                      value={wakeUpTime}
                      onChange={(e) => setWakeUpTime(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="mb-2 block">Sleep Time</Label>
                    <Input
                      type="time"
                      value={sleepTime}
                      onChange={(e) => setSleepTime(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label className="mb-3 block">Trip Dates</Label>
                  <Calendar
                    mode="range"
                    selected={tripDates}
                    onSelect={(range) => setTripDates(range as { from: Date | undefined; to: Date | undefined })}
                    numberOfMonths={1}
                    className="rounded-md border"
                  />
                </div>

                <div>
                  <Label className="mb-3 block">Departing From</Label>
                  <Input
                    placeholder="Where will you be leaving from?"
                    value={departureLocation}
                    onChange={(e) => setDepartureLocation(e.target.value)}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Label>Destination</Label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <Checkbox
                        checked={surpriseMe}
                        onCheckedChange={(checked) => setSurpriseMe(checked as boolean)}
                      />
                      <span className="text-sm">Surprise me!</span>
                    </label>
                  </div>
                  <Input
                    placeholder="Where do you want to go?"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    disabled={surpriseMe}
                  />
                </div>

                <div>
                  <Label className="mb-3 block">Number of Travelers</Label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5, "6+"].map((num) => (
                      <Button
                        key={num}
                        variant={numberOfTravelers === (typeof num === "string" ? 6 : num) ? "default" : "outline"}
                        onClick={() => setNumberOfTravelers(typeof num === "string" ? 6 : num)}
                        className="flex-1"
                      >
                        {num}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="mb-3 block">Total Budget (Optional)</Label>
                  <Input
                    type="number"
                    placeholder="Enter total budget in $"
                    value={totalBudget || ""}
                    onChange={(e) => setTotalBudget(e.target.value ? Number(e.target.value) : undefined)}
                  />
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setQuestionnaireStep(2)} className="flex-1">
                    <ChevronLeft className="size-4 mr-2" /> Back
                  </Button>
                  <Button
                    onClick={handleGenerateItinerary}
                    className="flex-1 bg-cyan-600 hover:bg-cyan-700"
                    disabled={!tripDates.from || !tripDates.to || !departureLocation.trim() || (!surpriseMe && !destination.trim())}
                  >
                    Generate Itinerary
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  }

  // Swiping UI
  return (
    <div
      className={cn(
        "h-screen relative flex flex-col overflow-hidden transition-colors duration-500",
        "bg-gradient-to-br",
        pageBgClass
      )}
      style={{ touchAction: 'none' }}
    >
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Fuchsia blob - top left */}
        <div className={cn(
          "absolute top-0 left-0 w-[200vw] h-[200vw] sm:w-[80vw] sm:h-[80vw] sm:-top-40 sm:-left-16 rounded-full blur-[100px] sm:blur-[200px]",
          isDarkMode 
            ? "bg-fuchsia-500/45 sm:bg-fuchsia-500/26" 
            : "bg-fuchsia-600/52 sm:bg-fuchsia-600/45"
        )} style={{ transform: 'translate(-40%, -40%)', animation: 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />
        
        {/* Blue blob - middle right */}
        <div className={cn(
          "absolute top-1/3 right-0 w-[180vw] h-[180vw] sm:w-[70vw] sm:h-[70vw] sm:-right-28 rounded-full blur-[100px] sm:blur-[200px]",
          isDarkMode 
            ? "bg-blue-500/41 sm:bg-blue-500/22" 
            : "bg-purple-600/48 sm:bg-purple-600/41"
        )} style={{ transform: 'translate(40%, 0)', animation: 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite', animationDelay: '0.5s' }} />
        
        {/* Purple blob - bottom left */}
        <div className={cn(
          "absolute bottom-0 left-1/4 w-[180vw] h-[180vw] sm:w-[70vw] sm:h-[70vw] sm:bottom-[-10%] rounded-full blur-[100px] sm:blur-[200px]",
          isDarkMode 
            ? "bg-purple-500/41 sm:bg-purple-500/22" 
            : "bg-violet-600/48 sm:bg-violet-600/41"
        )} style={{ transform: 'translate(-25%, 30%)', animation: 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite', animationDelay: '1s' }} />
        <div
          className={cn(
            "absolute inset-0 mix-blend-overlay opacity-50 bg-[size:80px_80px]",
            isDarkMode
              ? "bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)]"
              : "bg-[linear-gradient(rgba(15,23,42,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.08)_1px,transparent_1px)]"
          )}
        />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <header className={cn("px-4 pt-4 pb-2 md:px-6 md:pt-6 md:pb-3", glassHeaderClass)}>
          <div className="max-w-xl mx-auto space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h1
                className={cn(
                  "text-3xl font-black tracking-tight uppercase",
                  "bg-clip-text text-transparent",
                  isDarkMode
                    ? "bg-gradient-to-r from-fuchsia-400 via-purple-400 to-blue-400"
                    : "bg-gradient-to-r from-fuchsia-600 via-purple-600 to-blue-600"
                )}
              >
                Swipe Deck
              </h1>
              <div className="flex items-center gap-2 relative">
                <Button
                  variant="ghost"
                  onClick={handleReset}
                  className={cn(
                    "rounded-2xl border text-[11px] font-semibold px-2 py-1.5 active:scale-95",
                    accentBorderClass,
                    isDarkMode 
                      ? "hover:-translate-y-0.5 hover:bg-white/10 transition-all" 
                      : "hover:-translate-y-0.5 hover:bg-slate-900/10 transition-all"
                  )}
                  aria-label="Reset"
                >
                  <RotateCcw className="size-3" />
                </Button>
                <Button
                  variant="ghost"
                  onClick={handleAutoComplete}
                  disabled={isAutoCompleting}
                  className={cn(
                    "rounded-2xl border text-[11px] font-semibold px-3 py-1.5 active:scale-95",
                    accentBorderClass,
                    isDarkMode 
                      ? "hover:-translate-y-0.5 hover:bg-white/10 transition-all disabled:opacity-60" 
                      : "hover:-translate-y-0.5 hover:bg-slate-900/10 transition-all disabled:opacity-60"
                  )}
                >
                  {isAutoCompleting ? (
                    <Loader2 className="size-3 animate-spin" />
                  ) : (
                    <Sparkles className="size-3" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setShowSettingsMenu((prev) => !prev)}
                  className={cn(
                    "rounded-2xl border text-[11px] font-semibold px-2 py-1.5 active:scale-95",
                    accentBorderClass,
                    isDarkMode 
                      ? "hover:-translate-y-0.5 hover:bg-white/10 transition-all" 
                      : "hover:-translate-y-0.5 hover:bg-slate-900/10 transition-all"
                  )}
                  aria-label="Open settings menu"
                >
                  <Menu className="size-4" />
                </Button>
                {showSettingsMenu && (
                  <div 
                    className={cn(
                      "absolute right-0 top-[calc(100%+0.5rem)] flex flex-col rounded-2xl backdrop-blur-xl z-30 overflow-hidden",
                      isDarkMode 
                        ? "bg-slate-900/20 border border-white/10" 
                        : "bg-white/20 border border-slate-200/40"
                    )}
                    style={{ width: '40px' }}
                  >
                    <Button
                      variant="ghost"
                      onClick={() => {
                        handleThemeToggle();
                        setShowSettingsMenu(false);
                      }}
                      className={cn(
                        "rounded-none border-0 text-[11px] font-semibold px-2 py-1.5 active:scale-95",
                        isDarkMode ? "hover:bg-white/10" : "hover:bg-slate-900/10",
                        "hover:-translate-y-0 transition-all"
                      )}
                      aria-label="Toggle theme"
                    >
                      {isDarkMode ? (
                        <Moon className="size-3" />
                      ) : (
                        <Sun className="size-3" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        handleMuteToggle();
                        setShowSettingsMenu(false);
                      }}
                      className={cn(
                        "rounded-none border-0 text-[11px] font-semibold px-2 py-1.5 active:scale-95",
                        isDarkMode ? "hover:bg-white/10" : "hover:bg-slate-900/10",
                        "hover:-translate-y-0 transition-all"
                      )}
                      aria-label="Toggle sound"
                    >
                      {isMuted ? (
                        <VolumeX className="size-3" />
                      ) : volume < 0.35 ? (
                        <Volume1 className="size-3" />
                      ) : (
                        <Volume2 className="size-3" />
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-[11px] uppercase font-semibold">
                <span className={subTextClass}>Now swiping: {currentCategory.displayName}</span>
                <span className={subTextClass}>{overallProgress}% calibrated</span>
              </div>
              <Progress
                value={overallProgress}
                className={cn(
                  "h-3 mt-2 bg-white/20",
                  "[&_[data-slot=progress-indicator]]:bg-gradient-to-r",
                  "[&_[data-slot=progress-indicator]]:from-fuchsia-500",
                  "[&_[data-slot=progress-indicator]]:to-blue-500"
                )}
              />
            </div>

            <div className="grid grid-cols-6 gap-2">
              {CATEGORIES.map((cat, idx) => {
                const progress = categoryProgress[cat.name];
                const required = REQUIRED_SWIPES_MAP[cat.name];
                const isComplete = progress >= required;
                const percentage = Math.min(100, (progress / required) * 100);
                const isActive = idx === currentCategoryIndex;

                return (
                  <button
                    key={cat.name}
                    onClick={() => {
                      setCurrentCategoryIndex(idx);
                      setShowContinueButton(false);
                      playSound("click");
                    }}
                    className={cn(
                      "rounded-2xl px-2 py-2 flex flex-col items-center gap-1 text-[11px] font-semibold transition-all overflow-visible active:scale-95",
                      isActive
                        ? "bg-gradient-to-br from-fuchsia-500/90 to-blue-500/90 text-white shadow-lg border-transparent"
                        : glassPanelClass,
                      isComplete && !isActive && "text-green-300 border-green-400/40"
                    )}
                  >
                    <div className="relative">
                      <svg className="size-12" viewBox="0 0 36 36">
                        <circle
                          cx="18"
                          cy="18"
                          r="15.9"
                          fill="none"
                          stroke={isDarkMode ? "rgba(255,255,255,0.2)" : "rgba(15,23,42,0.2)"}
                          strokeWidth="2"
                        />
                        <circle
                          cx="18"
                          cy="18"
                          r="15.9"
                          fill="none"
                          stroke={isComplete ? "#22c55e" : "#ec4899"}
                          strokeWidth="2.5"
                          strokeDasharray={`${percentage}, 100`}
                          strokeLinecap="round"
                          transform="rotate(-90 18 18)"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">{cat.icon}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center px-4 py-4 md:py-8">
          <div className="relative w-full max-w-md h-[430px] sm:h-[500px]">
            {cardStack.slice(1, 3).map((card, idx) => (
              <div
                key={card.id + "-bg-" + idx}
                className="absolute inset-x-0 top-0 h-full"
                style={{
                  transform: `scale(${1 - (idx + 1) * 0.05}) translateY(${(idx + 1) * 14}px)`,
                  zIndex: 10 - idx,
                  opacity: 1 - (idx + 1) * 0.25,
                }}
              >
                <Card
                  className={cn(
                    "h-full overflow-hidden border backdrop-blur-xl",
                    glassPanelClass,
                    "shadow-2xl"
                  )}
                >
                  <div className="relative h-[60%]">
                    <img src={card.imageUrl} alt={card.title} className="w-full h-full object-cover opacity-80" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent" />
                  </div>
                </Card>
              </div>
            ))}

            {cardStack[0] && (
              <div
                ref={cardRef}
                className="absolute inset-x-0 top-0 h-full cursor-grab active:cursor-grabbing"
                style={{
                  transform: `translateX(${dragOffset.x}px) translateY(${dragOffset.y}px) rotate(${dragOffset.x * 0.05}deg)`,
                  transition: isDragging ? "none" : "transform 0.3s ease-out",
                  zIndex: 20,
                }}
                onMouseDown={(e) => handleDragStart(e.clientX, e.clientY)}
                onMouseMove={(e) => handleDragMove(e.clientX, e.clientY)}
                onMouseUp={handleDragEnd}
                onMouseLeave={handleDragEnd}
                onTouchStart={(e) => handleDragStart(e.touches[0].clientX, e.touches[0].clientY)}
                onTouchMove={(e) => handleDragMove(e.touches[0].clientX, e.touches[0].clientY)}
                onTouchEnd={handleDragEnd}
              >
                <Card
                  className={cn(
                    "h-full overflow-hidden border backdrop-blur-2xl transition-all",
                    glassPanelClass,
                    "shadow-[0_35px_80px_-40px_rgba(15,23,42,0.8)]",
                    swipeDirection === "right" && "translate-x-[150%] rotate-12 opacity-0",
                    swipeDirection === "left" && "-translate-x-[150%] -rotate-12 opacity-0"
                  )}
                >
                  <div className="absolute inset-0 pointer-events-none rounded-[24px] border border-white/20" />
                  <div
                    className="absolute inset-0 bg-green-500/20 z-10 flex items-center justify-center transition-opacity"
                    style={{ opacity: Math.max(0, dragOffset.x / 120) * 0.8 }}
                  >
                    <div className="bg-green-500 text-white px-6 py-2 rounded-full text-2xl font-black tracking-widest rotate-6 border border-white/40">
                      LIKE
                    </div>
                  </div>
                  <div
                    className="absolute inset-0 bg-red-500/20 z-10 flex items-center justify-center transition-opacity"
                    style={{ opacity: Math.max(0, -dragOffset.x / 120) * 0.8 }}
                  >
                    <div className="bg-red-500 text-white px-6 py-2 rounded-full text-2xl font-black tracking-widest -rotate-6 border border-white/40">
                      SKIP
                    </div>
                  </div>

                  <div className="relative h-[60%]">
                    <img src={cardStack[0].imageUrl} alt={cardStack[0].title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent" />
                    <div className="absolute top-4 left-4">
                      <Badge
                        className={cn(
                          "bg-gradient-to-r text-[11px] font-black tracking-widest uppercase border-none text-white",
                          badgeGradientClass
                        )}
                      >
                        {currentCategory.displayName}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-5 space-y-3">
                    <div className="-mt-1">
                      <h2 className="text-2xl font-black tracking-tight">{cardStack[0].title}</h2>
                      <p className={cn("text-sm mt-2 leading-relaxed", subTextClass)}>{cardStack[0].description}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {cardStack[0].tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="outline"
                          className={cn(
                            "text-[11px] font-semibold uppercase border-white/20 rounded-full px-3 py-1",
                            isDarkMode ? "text-white/80" : "text-slate-700"
                          )}
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </main>

        <footer className="p-4">
          <div
            className={cn(
              "max-w-md mx-auto rounded-[28px] border p-5 backdrop-blur-2xl space-y-4",
              glassPanelClass
            )}
          >
            {cardStack.length > 0 ? (
              <div className="flex justify-center gap-6">
                <Button
                  size="lg"
                  variant="ghost"
                  className={cn(
                    "size-16 rounded-full border-2 text-red-400 hover:text-red-500 transition-all active:scale-95",
                    isDarkMode 
                      ? "border-slate-400/40 bg-white/5 hover:scale-105 hover:bg-slate-400 hover:border-slate-400 dark:hover:bg-slate-400" 
                      : "border-white/30 bg-white/10 hover:scale-105 hover:bg-white hover:border-white"
                  )}
                  onClick={() => handleSwipe("left")}
                >
                  <X className="size-7" />
                </Button>
                <Button
                  size="lg"
                  className={cn(
                    "size-16 rounded-full flex items-center justify-center text-white text-2xl font-black hover:scale-105 active:scale-95 transition-all",
                    primaryGradientButton
                  )}
                  onClick={() => handleSwipe("right")}
                >
                  <Check className="size-7" />
                </Button>
              </div>
            ) : (
              <p className={cn("text-center text-sm font-semibold", subTextClass)}>
                You’ve seen every card in this category.
              </p>
            )}

            {showContinueButton && !currentCategoryComplete && (
              <Button
                onClick={handleContinueToNextCategory}
                className={cn("w-full rounded-2xl py-4 font-semibold active:scale-95", primaryGradientButton)}
              >
                <ChevronRight className="size-4 mr-2" />
                Jump to Next Category
              </Button>
            )}

            {currentCategoryComplete && completedCategories.size < 6 && (
              <Button
                onClick={handleContinueToNextCategory}
                className={cn("w-full rounded-2xl py-4 font-semibold active:scale-95", primaryGradientButton)}
              >
                <ChevronRight className="size-4 mr-2" />
                Continue to Next Category
              </Button>
            )}

            {completedCategories.size === 6 && (
              <Button
                onClick={() => setAppState("questionnaire")}
                className={cn("w-full rounded-2xl py-4 font-semibold active:scale-95", primaryGradientButton)}
              >
                <ChevronRight className="size-4 mr-2" />
                Continue to Questionnaire
              </Button>
            )}
          </div>
        </footer>
      </div>

      {showBadge && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 animate-in fade-in duration-500">
          <Card
            className={cn(
              "text-center p-8 rounded-3xl text-white shadow-2xl border-0 bg-gradient-to-r",
              badgeGradientClass
            )}
          >
            <Award className="size-16 mx-auto mb-3" />
            <h3 className="text-2xl font-black">{showBadge} Complete!</h3>
            <p className="text-sm opacity-90">Badge earned</p>
          </Card>
        </div>
      )}

      {showConfetti && (
        <div className="fixed inset-0 z-40 pointer-events-none">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center space-y-2 animate-pulse">
              <PartyPopper className="size-24 mx-auto text-fuchsia-400" />
              <h2 className="text-3xl font-black">Profile Calibrated!</h2>
              <p className={cn("text-sm", subTextClass)}>Jump into the questionnaire to lock it in.</p>
            </div>
          </div>
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full animate-ping"
              style={{
                backgroundColor: ["#f472b6", "#38bdf8", "#a855f7", "#34d399", "#facc15"][i % 5],
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random()}s`,
                animationDuration: `${1 + Math.random()}s`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
} 