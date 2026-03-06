/**
 * AqarNow Seed Data
 * Populates the database with sample cities and properties
 * Run: npm run seed
 */

require("dotenv").config({ path: "../.env" });
require("dotenv").config({ path: "../.env.example" }); // fallback
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const City = require("../src/models/City");
const Property = require("../src/models/Property");
const User = require("../src/models/User");

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/aqarnow";

const cities = [
  {
    name: "Riyadh",
    nameAr: "الرياض",
    country: "Saudi Arabia",
    countryCode: "SA",
  },
  { name: "Jeddah", nameAr: "جدة", country: "Saudi Arabia", countryCode: "SA" },
  {
    name: "Mecca",
    nameAr: "مكة المكرمة",
    country: "Saudi Arabia",
    countryCode: "SA",
  },
  {
    name: "Medina",
    nameAr: "المدينة المنورة",
    country: "Saudi Arabia",
    countryCode: "SA",
  },
  { name: "Dubai", nameAr: "دبي", country: "UAE", countryCode: "AE" },
  { name: "Abu Dhabi", nameAr: "أبوظبي", country: "UAE", countryCode: "AE" },
  {
    name: "Kuwait City",
    nameAr: "مدينة الكويت",
    country: "Kuwait",
    countryCode: "KW",
  },
  { name: "Doha", nameAr: "الدوحة", country: "Qatar", countryCode: "QA" },
  { name: "Manama", nameAr: "المنامة", country: "Bahrain", countryCode: "BH" },
  { name: "Muscat", nameAr: "مسقط", country: "Oman", countryCode: "OM" },
];

const generateProperties = (cityIds) => [
  // ─── Riyadh Properties ────────────────────────────────────────────────────
  {
    title: "Luxury Villa in Al-Malqa",
    titleAr: "فيلا فاخرة في الملقا",
    description:
      "Stunning 6-bedroom villa with private pool, modern design, and premium finishes in the prestigious Al-Malqa district of Riyadh.",
    descriptionAr:
      "فيلا 6 غرف نوم مذهلة مع مسبح خاص وتصميم عصري وتشطيبات فاخرة في حي الملقا المرموق بالرياض.",
    listingType: "sale",
    propertyType: "villa",
    price: 4500000,
    currency: "SAR",
    city: cityIds[0],
    district: "Al Malqa",
    area: 650,
    rooms: 6,
    bathrooms: 7,
    floors: 3,
    viewType: ["garden", "city"],
    amenities: [
      "parking",
      "pool",
      "gym",
      "security",
      "elevator",
      "maid_room",
      "central_ac",
    ],
    images: [
      "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800",
    ],
    coverImage:
      "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800",
    contactPhone: "+966501234567",
    contactWhatsApp: "+966501234567",
    agentName: "Ahmed Al-Rashid",
    agentAvatar: "https://i.pravatar.cc/150?img=1",
    isFeatured: true,
    isVerified: true,
    status: "available",
  },
  {
    title: "Modern Apartment in Al-Olaya",
    titleAr: "شقة عصرية في العليا",
    description:
      "Premium 3-bedroom apartment in the heart of Riyadh's business district. Floor-to-ceiling windows with stunning city views.",
    descriptionAr:
      "شقة فاخرة 3 غرف في قلب حي الأعمال بالرياض. نوافذ من الأرض حتى السقف مع إطلالات رائعة على المدينة.",
    listingType: "rent",
    propertyType: "apartment",
    price: 120000,
    currency: "SAR",
    rentPeriod: "yearly",
    city: cityIds[0],
    district: "Al Olaya",
    area: 220,
    rooms: 3,
    bathrooms: 3,
    floorNumber: 15,
    viewType: ["city"],
    amenities: [
      "parking",
      "gym",
      "security",
      "elevator",
      "central_ac",
      "internet",
    ],
    images: [
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
    ],
    coverImage:
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
    contactPhone: "+966502345678",
    contactWhatsApp: "+966502345678",
    agentName: "Sara Al-Ghamdi",
    agentAvatar: "https://i.pravatar.cc/150?img=5",
    isFeatured: true,
    isVerified: true,
    status: "available",
  },
  {
    title: "Cozy Studio in King Fahd District",
    titleAr: "استوديو مريح في حي الملك فهد",
    description:
      "Fully furnished studio apartment, perfect for young professionals. Close to King Fahd Road and all amenities.",
    descriptionAr:
      "شقة استوديو مفروشة بالكامل، مثالية للمهنيين الشباب. قريبة من طريق الملك فهد وجميع الخدمات.",
    listingType: "rent",
    propertyType: "studio",
    price: 35000,
    currency: "SAR",
    rentPeriod: "yearly",
    city: cityIds[0],
    district: "King Fahd District",
    area: 65,
    rooms: 0,
    bathrooms: 1,
    floorNumber: 5,
    viewType: ["city", "street"],
    amenities: [
      "parking",
      "security",
      "elevator",
      "central_ac",
      "furnished",
      "internet",
    ],
    images: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800",
      "https://images.unsplash.com/photo-1534484671045-3997d6e5e88e?w=800",
    ],
    coverImage:
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800",
    contactPhone: "+966503456789",
    agentName: "Mohammed Al-Qahtani",
    agentAvatar: "https://i.pravatar.cc/150?img=8",
    isFeatured: false,
    isVerified: true,
    status: "available",
  },
  // ─── Dubai Properties ────────────────────────────────────────────────────
  {
    title: "Beachfront Penthouse in Dubai Marina",
    titleAr: "بنتهاوس على الشاطئ في دبي مارينا",
    description:
      "Spectacular 4-bedroom penthouse with panoramic sea views, private terrace, and direct beach access in Dubai Marina.",
    descriptionAr:
      "بنتهاوس 4 غرف بإطلالات بحرية بانورامية وشرفة خاصة ووصول مباشر للشاطئ في دبي مارينا.",
    listingType: "sale",
    propertyType: "apartment",
    price: 12000000,
    currency: "AED",
    city: cityIds[4],
    district: "Dubai Marina",
    area: 480,
    rooms: 4,
    bathrooms: 5,
    floorNumber: 42,
    floors: 1,
    viewType: ["sea", "city"],
    amenities: [
      "parking",
      "pool",
      "gym",
      "security",
      "elevator",
      "balcony",
      "central_ac",
      "internet",
    ],
    images: [
      "https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=800",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800",
    ],
    coverImage:
      "https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=800",
    contactPhone: "+971501234567",
    contactWhatsApp: "+971501234567",
    agentName: "Khalid Al-Falasi",
    agentAvatar: "https://i.pravatar.cc/150?img=3",
    isFeatured: true,
    isVerified: true,
    status: "available",
  },
  {
    title: "Garden View Villa in Palm Jumeirah",
    titleAr: "فيلا بإطلالة حديقة في نخلة جميرا",
    description:
      "Exclusive 5-bedroom villa in the iconic Palm Jumeirah. Features lush garden, private pool, and breathtaking sea views.",
    descriptionAr:
      "فيلا 5 غرف حصرية في نخلة جميرا الشهيرة. تضم حديقة خضراء ومسبح خاص وإطلالات بحرية خلابة.",
    listingType: "rent",
    propertyType: "villa",
    price: 800000,
    currency: "AED",
    rentPeriod: "yearly",
    city: cityIds[4],
    district: "Palm Jumeirah",
    area: 750,
    rooms: 5,
    bathrooms: 6,
    floors: 3,
    viewType: ["sea", "garden"],
    amenities: [
      "parking",
      "pool",
      "gym",
      "security",
      "maid_room",
      "storage",
      "central_ac",
    ],
    images: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
      "https://images.unsplash.com/photo-1571939228382-b2f2b585ce15?w=800",
    ],
    coverImage:
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
    contactPhone: "+971502345678",
    contactWhatsApp: "+971502345678",
    agentName: "Fatima Al-Maktoum",
    agentAvatar: "https://i.pravatar.cc/150?img=9",
    isFeatured: true,
    isVerified: true,
    status: "available",
  },
  // ─── Jeddah Properties ────────────────────────────────────────────────────
  {
    title: "Sea View Chalet in Corniche",
    titleAr: "شاليه بإطلالة بحرية في الكورنيش",
    description:
      "Beautiful beachfront chalet with stunning Red Sea views, modern amenities, and direct beach access on Jeddah Corniche.",
    descriptionAr:
      "شاليه جميل على الواجهة البحرية مع إطلالات رائعة على البحر الأحمر ووسائل راحة حديثة ووصول مباشر للشاطئ.",
    listingType: "rent",
    propertyType: "chalet",
    price: 180000,
    currency: "SAR",
    rentPeriod: "yearly",
    city: cityIds[1],
    district: "Al Corniche",
    area: 300,
    rooms: 4,
    bathrooms: 4,
    floorNumber: 3,
    viewType: ["sea", "city"],
    amenities: [
      "parking",
      "pool",
      "security",
      "balcony",
      "central_ac",
      "furnished",
    ],
    images: [
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800",
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800",
    ],
    coverImage:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800",
    contactPhone: "+966504567890",
    contactWhatsApp: "+966504567890",
    agentName: "Nora Al-Zahrani",
    agentAvatar: "https://i.pravatar.cc/150?img=6",
    isFeatured: true,
    isVerified: true,
    status: "available",
  },
];

const seed = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Clear existing data
    await Promise.all([
      City.deleteMany({}),
      Property.deleteMany({}),
      User.deleteMany({ role: "admin" }),
    ]);
    console.log("🗑️  Cleared existing data");

    // Create admin user
    const adminPassword = process.env.ADMIN_PASSWORD || "Admin@AqarNow2025";
    const adminUser = await User.create({
      phone: "+9660000000000",
      name: "AqarNow Admin",
      email: process.env.ADMIN_EMAIL || "admin@aqarnow.com",
      role: "admin",
      isVerified: true,
      isActive: true,
      password: adminPassword,
    });
    console.log(`✅ Admin user created`);
    console.log(`   📧 Email: ${adminUser.email}`);
    console.log(`   🔑 Password: ${adminPassword}`);

    // Insert cities
    const createdCities = await City.insertMany(cities);
    console.log(`✅ Created ${createdCities.length} cities`);

    // Create city ID map
    const cityMap = {};
    createdCities.forEach((city) => {
      cityMap[city.name] = city._id;
    });

    const cityIds = [
      cityMap["Riyadh"],
      cityMap["Jeddah"],
      cityMap["Mecca"],
      cityMap["Medina"],
      cityMap["Dubai"],
      cityMap["Abu Dhabi"],
    ];

    // Insert properties
    const properties = generateProperties(cityIds);
    const createdProperties = await Property.insertMany(properties);
    console.log(`✅ Created ${createdProperties.length} properties`);

    console.log("\n🎉 Seed completed successfully!");
    console.log("📊 Summary:");
    console.log(`   - 1 admin user`);
    console.log(`   - ${createdCities.length} cities`);
    console.log(`   - ${createdProperties.length} properties`);

    mongoose.connection.close();
  } catch (error) {
    console.error("❌ Seed error:", error);
    process.exit(1);
  }
};

seed();
