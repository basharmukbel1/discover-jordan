const Destination = require("../models/Destination");

const destinationData = [
  {
    name: "Petra",
    city: "Wadi Musa",
    region: "Ma'an",
    country: "Jordan",
    category: "Historical",
    shortDescription: "An ancient Nabataean city carved into rose-red cliffs.",
    description:
      "Petra is one of Jordan's most iconic attractions, known for its dramatic rock-cut architecture and rich historical layers. It offers a memorable experience for history lovers and adventurers alike.",
    image:
      "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4e/The_Treasury%2C_Petra%2C_Jordan1.jpg/1280px-The_Treasury%2C_Petra%2C_Jordan1.jpg",
    imageCredit:
      "https://commons.wikimedia.org/wiki/File:The_Treasury,_Petra,_Jordan1.jpg",
    gallery: [],
    duration: "1 day",
    bestFor: ["History lovers", "Hikers", "Photographers"],
    highlights: ["Treasury", "Monastery", "Siq"],
    price: 25,
    rating: 4.9,
    isFeatured: true,
    location: { lat: 30.3285, lng: 35.4444 },
  },
  {
    name: "Wadi Rum",
    city: "Rum",
    region: "Aqaba",
    country: "Jordan",
    category: "Adventure",
    shortDescription: "A vast desert valley with breathtaking sandstone landscapes.",
    description:
      "Wadi Rum is a UNESCO World Heritage site famous for its dramatic desert scenery, Bedouin culture, and stargazing adventures. Visitors can explore canyons, dunes, and jeep trails.",
    image:
      "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c2/Wadi_rum_desert.jpg/1280px-Wadi_rum_desert.jpg",
    imageCredit: "https://commons.wikimedia.org/wiki/File:Wadi_rum_desert.jpg",
    gallery: [],
    duration: "2 days",
    bestFor: ["Desert lovers", "Campers", "Adventure travelers"],
    highlights: ["Bedouin camps", "Dune tours", "Night sky"],
    price: 110,
    rating: 4.8,
    isFeatured: true,
    location: { lat: 29.5312, lng: 35.4219 },
  },
  {
    name: "Dead Sea",
    city: "Sweimeh",
    region: "Balqa",
    country: "Jordan",
    category: "Relaxation",
    shortDescription: "A mineral-rich hypersaline lake known for its healing waters.",
    description:
      "The Dead Sea is a unique natural wonder where visitors can float effortlessly in salty waters and enjoy panoramic views of the Jordan Valley. It is ideal for wellness and leisure trips.",
    image:
      "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/70/Dead_Sea%2C_Jordan_02.jpg/1280px-Dead_Sea%2C_Jordan_02.jpg",
    imageCredit:
      "https://commons.wikimedia.org/wiki/File:Dead_Sea,_Jordan_02.jpg",
    gallery: [],
    duration: "1 day",
    bestFor: ["Wellness travelers", "Families", "Relaxation seekers"],
    highlights: ["Floating experience", "Mud baths", "Sunset views"],
    price: 40,
    rating: 4.7,
    location: { lat: 31.557, lng: 35.473 },
  },
  {
    name: "Jerash",
    city: "Jerash",
    region: "Balqa",
    country: "Jordan",
    category: "Historical",
    shortDescription: "A remarkably preserved Greco-Roman city with grand ruins.",
    description:
      "Jerash is one of the best-preserved Roman provincial cities in the world. The site features colonnaded streets, temples, amphitheaters, and a fascinating glimpse into ancient urban life.",
    image:
      "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f6/Roman_ruins_at_Jerash_00.JPG/1280px-Roman_ruins_at_Jerash_00.JPG",
    imageCredit:
      "https://commons.wikimedia.org/wiki/File:Roman_ruins_at_Jerash_00.JPG",
    gallery: [],
    duration: "1 day",
    bestFor: ["Archaeology fans", "History students", "Culture lovers"],
    highlights: ["Oval Plaza", "Hadrian's Arch", "Theater"],
    price: 18,
    rating: 4.7,
    location: { lat: 32.2808, lng: 35.8997 },
  },
  {
    name: "Dana Biosphere Reserve",
    city: "Dana",
    region: "Balqa",
    country: "Jordan",
    category: "Nature",
    shortDescription: "Jordan's largest nature reserve with mountain trails and biodiversity.",
    description:
      "Dana Biosphere Reserve combines dramatic mountain scenery with a rich variety of flora and fauna. It is a favorite destination for hikers and eco-tourism enthusiasts.",
    image:
      "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/0c/Dana_Reserve_02.jpg/1280px-Dana_Reserve_02.jpg",
    imageCredit: "https://commons.wikimedia.org/wiki/File:Dana_Reserve_02.jpg",
    gallery: [],
    duration: "2 days",
    bestFor: ["Nature lovers", "Hikers", "Eco travelers"],
    highlights: ["Nature trails", "Wildlife", "Scenic viewpoints"],
    price: 75,
    rating: 4.8,
    location: { lat: 30.6736, lng: 35.6267 },
  },
  {
    name: "Aqaba",
    city: "Aqaba",
    region: "Aqaba",
    country: "Jordan",
    category: "Relaxation",
    shortDescription: "A vibrant Red Sea resort city perfect for diving and beach time.",
    description:
      "Aqaba offers warm waters, coral reefs, and a relaxed seaside atmosphere. The city is ideal for snorkeling, diving, and a laid-back coastal holiday.",
    image:
      "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/14/South_Beach%2C_Aqaba%2C_Jordan.jpg/1280px-South_Beach%2C_Aqaba%2C_Jordan.jpg",
    imageCredit:
      "https://commons.wikimedia.org/wiki/File:South_Beach,_Aqaba,_Jordan.jpg",
    gallery: [],
    duration: "2 days",
    bestFor: ["Beach seekers", "Divers", "Families"],
    highlights: ["Red Sea snorkeling", "Beach resorts", "Coral reefs"],
    price: 95,
    rating: 4.6,
    isFeatured: true,
    location: { lat: 29.5267, lng: 35.0078 },
  },
  {
    name: "Madaba",
    city: "Madaba",
    region: "Madaba",
    country: "Jordan",
    category: "Cultural",
    shortDescription: "The city of mosaics and a gateway to holy sites.",
    description:
      "Madaba is known for its intricate mosaic art and its role as a spiritual crossroads for Jordan. It is a fascinating stop for cultural and historical exploration.",
    image:
      "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d6/Mosaic_in_Madaba.jpg/1280px-Mosaic_in_Madaba.jpg",
    imageCredit: "https://commons.wikimedia.org/wiki/File:Mosaic_in_Madaba.jpg",
    gallery: [],
    duration: "1 day",
    bestFor: ["Culture lovers", "History buffs", "Pilgrims"],
    highlights: ["Mosaic map", "Churches", "Craft markets"],
    price: 20,
    rating: 4.5,
    location: { lat: 31.716, lng: 35.793 },
  },
  {
    name: "Umm Qais",
    city: "Umm Qais",
    region: "Irbid",
    country: "Jordan",
    category: "Historical",
    shortDescription: "A hilltop town with panoramic views and Greco-Roman ruins.",
    description:
      "Umm Qais offers sweeping valley views and ancient ruins that reveal Jordan's connections to Roman and Hellenistic civilizations. It is a perfect place for scenic exploration.",
    image:
      "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/58/Umm_Qais_00_%283%29.JPG/1280px-Umm_Qais_00_%283%29.JPG",
    imageCredit: "https://commons.wikimedia.org/wiki/File:Umm_Qais_00_(3).JPG",
    gallery: [],
    duration: "1 day",
    bestFor: ["Sightseers", "Photographers", "History lovers"],
    highlights: ["Roman ruins", "Scenic overlooks", "Local cafés"],
    price: 15,
    rating: 4.4,
    location: { lat: 32.653, lng: 35.685 },
  },
  {
    name: "Ajloun Forest Reserve",
    city: "Ajloun",
    region: "Ajloun",
    country: "Jordan",
    category: "Reserve",
    shortDescription: "Oak woodland reserve with wildlife and marked forest trails.",
    description:
      "Ajloun Forest Reserve protects northern Jordan's Mediterranean woodland. Its visitor trails offer forest scenery, wildlife, and access to nearby Ajloun.",
    image:
      "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/77/Ajloun_Forest_Reserve_in_Jordan_kz04.jpg/1280px-Ajloun_Forest_Reserve_in_Jordan_kz04.jpg",
    imageCredit:
      "https://commons.wikimedia.org/wiki/File:Ajloun_Forest_Reserve_in_Jordan_kz04.jpg",
    gallery: [],
    duration: "Half day",
    bestFor: ["Hikers", "Nature lovers", "Families"],
    highlights: ["Forest trails", "Oak woodland", "Wildlife"],
    price: 8,
    rating: 4.6,
    location: { lat: 32.355, lng: 35.751 },
  },
  {
    name: "Wadi Mujib Siq Trail",
    city: "Dead Sea",
    region: "Madaba",
    country: "Jordan",
    category: "Hiking",
    shortDescription: "A seasonal water hike through the dramatic Mujib gorge.",
    description:
      "The Siq Trail is a guided, water-based canyon adventure in Wadi Mujib. It is seasonal and subject to weather, age, swimming ability, and operator requirements; confirm availability before traveling.",
    image:
      "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/48/Wadi_Mujib_BW_2.JPG/1280px-Wadi_Mujib_BW_2.JPG",
    imageCredit: "https://commons.wikimedia.org/wiki/File:Wadi_Mujib_BW_2.JPG",
    gallery: [],
    duration: "3-4 hours",
    bestFor: ["Experienced swimmers", "Adventure travelers"],
    highlights: ["Guided canyon walk", "Waterfall", "Dead Sea gorge"],
    price: 21,
    rating: 4.8,
    location: { lat: 31.467, lng: 35.573 },
  },
  {
    name: "Azraq Wetland Reserve",
    city: "Azraq",
    region: "Zarqa",
    country: "Jordan",
    category: "Reserve",
    shortDescription: "A desert oasis and migratory-bird sanctuary in eastern Jordan.",
    description:
      "Azraq Wetland Reserve is a protected oasis known for its wetlands, boardwalks, and seasonal birdlife. Trail and visitor access may vary with water and conservation conditions.",
    image:
      "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/76/Azraq_view.jpg/1280px-Azraq_view.jpg",
    imageCredit: "https://commons.wikimedia.org/wiki/File:Azraq_view.jpg",
    gallery: [],
    duration: "2-3 hours",
    bestFor: ["Birdwatchers", "Families", "Nature lovers"],
    highlights: ["Wetland boardwalk", "Migratory birds", "Desert oasis"],
    price: 8,
    rating: 4.4,
    location: { lat: 31.833, lng: 36.817 },
  },
  {
    name: "Shaumari Wildlife Reserve",
    city: "Azraq",
    region: "Zarqa",
    country: "Jordan",
    category: "Reserve",
    shortDescription: "A protected wildlife reserve and breeding center near Azraq.",
    description:
      "Shaumari Wildlife Reserve supports conservation and reintroduction work for native wildlife. Visitor access, tours, and animal sightings depend on current reserve operations.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/4/4c/Shaumarinaturereserve.jpg",
    imageCredit: "https://commons.wikimedia.org/wiki/File:Shaumarinaturereserve.jpg",
    gallery: [],
    duration: "2-3 hours",
    bestFor: ["Wildlife enthusiasts", "Families", "Conservation learners"],
    highlights: ["Wildlife viewing", "Conservation center", "Guided visit"],
    price: 8,
    rating: 4.3,
    location: { lat: 31.8, lng: 36.783 },
  },
  {
    name: "Wadi Dana Trail",
    city: "Dana",
    region: "Tafilah",
    country: "Jordan",
    category: "Hiking",
    shortDescription: "A long-distance trail descending through Dana's mountain reserve.",
    description:
      "The Wadi Dana Trail descends from Dana village through changing mountain and desert landscapes. Plan with the reserve or a licensed local guide and check trail conditions before setting out.",
    image:
      "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/0c/Dana_Reserve_02.jpg/1280px-Dana_Reserve_02.jpg",
    imageCredit: "https://commons.wikimedia.org/wiki/File:Dana_Reserve_02.jpg",
    gallery: [],
    duration: "Full day",
    bestFor: ["Hikers", "Nature photographers"],
    highlights: ["Mountain-to-desert route", "Biodiversity", "Scenic viewpoints"],
    price: 15,
    rating: 4.8,
    location: { lat: 30.6736, lng: 35.6267 },
  },
  {
    name: "Wadi Rum Jabal Burdah Hike",
    city: "Wadi Rum",
    region: "Aqaba",
    country: "Jordan",
    category: "Hiking",
    shortDescription: "A guided desert hike to the famous Burdah rock bridge.",
    description:
      "The Jabal Burdah route is a challenging guided desert hike with scrambling sections. Book with a local licensed guide and check weather and route suitability.",
    image:
      "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c2/Wadi_rum_desert.jpg/1280px-Wadi_rum_desert.jpg",
    imageCredit: "https://commons.wikimedia.org/wiki/File:Wadi_rum_desert.jpg",
    gallery: [],
    duration: "Half day",
    bestFor: ["Experienced hikers", "Adventure travelers"],
    highlights: ["Burdah rock bridge", "Desert landscape", "Guided scramble"],
    price: 35,
    rating: 4.7,
    location: { lat: 29.575, lng: 35.433 },
  },
  {
    name: "Jordan Museum",
    city: "Amman",
    region: "Amman",
    country: "Jordan",
    category: "Museum",
    shortDescription: "A national museum covering Jordan's history and archaeological heritage.",
    description:
      "The Jordan Museum presents archaeological collections and stories from Jordan's past. Confirm current opening hours and ticket prices before visiting.",
    image:
      "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/87/Jordan_Museum.JPG/1280px-Jordan_Museum.JPG",
    imageCredit: "https://commons.wikimedia.org/wiki/File:Jordan_Museum.JPG",
    gallery: [],
    duration: "2-3 hours",
    bestFor: ["History lovers", "Families", "Culture seekers"],
    highlights: ["Archaeology", "Jordanian heritage", "Museum galleries"],
    price: 5,
    rating: 4.6,
    location: { lat: 31.9454, lng: 35.9284 },
  },
  {
    name: "Royal Automobile Museum",
    city: "Amman",
    region: "Amman",
    country: "Jordan",
    category: "Museum",
    shortDescription: "A museum collection exploring Jordan's modern history through vehicles.",
    description:
      "The Royal Automobile Museum displays historic cars and motorcycles connected to Jordan's modern history. Check the museum's official site for current admission and hours.",
    image:
      "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/40/Jordan_Royal_Automobile_Museum_3.JPG/1280px-Jordan_Royal_Automobile_Museum_3.JPG",
    imageCredit:
      "https://commons.wikimedia.org/wiki/File:Jordan_Royal_Automobile_Museum_3.JPG",
    gallery: [],
    duration: "1-2 hours",
    bestFor: ["Families", "Automotive fans", "History lovers"],
    highlights: ["Historic vehicles", "Royal history", "Indoor exhibits"],
    price: 3,
    rating: 4.5,
    location: { lat: 31.9825, lng: 35.8394 },
  },
  {
    name: "Amman Citadel",
    city: "Amman",
    region: "Amman",
    country: "Jordan",
    category: "Historical",
    shortDescription: "An ancient hilltop site with ruins and panoramic city views.",
    description:
      "Amman Citadel combines archaeological remains from several periods with wide views over downtown Amman. The estimate is for entry only and can change.",
    image:
      "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/aa/Temple_of_Hercules%2C_Amman_Citadel_06.jpg/1280px-Temple_of_Hercules%2C_Amman_Citadel_06.jpg",
    imageCredit:
      "https://commons.wikimedia.org/wiki/File:Temple_of_Hercules,_Amman_Citadel_06.jpg",
    gallery: [],
    duration: "2-3 hours",
    bestFor: ["History lovers", "Photographers", "City explorers"],
    highlights: ["Temple of Hercules", "Umayyad Palace", "City views"],
    price: 3,
    rating: 4.6,
    location: { lat: 31.9544, lng: 35.9345 },
  },
  {
    name: "Mount Nebo",
    city: "Madaba",
    region: "Madaba",
    country: "Jordan",
    category: "Historical",
    shortDescription: "A hilltop landmark with historic sites and views over the Jordan Valley.",
    description:
      "Mount Nebo is an important historic and religious site overlooking the Jordan Valley and Dead Sea region. Visitor access and entry charges may change.",
    image:
      "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/07/Mount_Nebo_BW_6.JPG/1280px-Mount_Nebo_BW_6.JPG",
    imageCredit: "https://commons.wikimedia.org/wiki/File:Mount_Nebo_BW_6.JPG",
    gallery: [],
    duration: "1-2 hours",
    bestFor: ["History lovers", "Pilgrims", "Sightseers"],
    highlights: ["Memorial church", "Panoramic views", "Historic site"],
    price: 3,
    rating: 4.5,
    location: { lat: 31.765, lng: 35.725 },
  },
  {
    name: "Bethany Beyond the Jordan",
    city: "Al-Maghtas",
    region: "Balqa",
    country: "Jordan",
    category: "Historical",
    shortDescription: "A UNESCO World Heritage site on the east bank of the Jordan River.",
    description:
      "Al-Maghtas, also known as Bethany Beyond the Jordan, is a protected archaeological and religious site. Entry is typically arranged with an official visitor service; verify access and current ticket prices.",
    image:
      "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d6/Bethany_Beyond_the_Jordan_-_8342923349.jpg/1280px-Bethany_Beyond_the_Jordan_-_8342923349.jpg",
    imageCredit:
      "https://commons.wikimedia.org/wiki/File:Bethany_Beyond_the_Jordan_-_8342923349.jpg",
    gallery: [],
    duration: "2-3 hours",
    bestFor: ["Pilgrims", "History lovers", "Culture seekers"],
    highlights: ["Archaeological remains", "Jordan River", "Visitor route"],
    price: 12,
    rating: 4.6,
    location: { lat: 31.836, lng: 35.548 },
  },
  {
    name: "Qasr Amra",
    city: "Azraq",
    region: "Zarqa",
    country: "Jordan",
    category: "Historical",
    shortDescription: "An Umayyad desert castle and UNESCO-listed heritage site.",
    description:
      "Qasr Amra is an early Islamic desert complex famed for its preserved frescoes. It is part of the eastern desert heritage route; confirm site hours and combined-ticket details.",
    image:
      "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b6/Qasr_Amra%2C_Jordan.jpg/1280px-Qasr_Amra%2C_Jordan.jpg",
    imageCredit: "https://commons.wikimedia.org/wiki/File:Qasr_Amra,_Jordan.jpg",
    gallery: [],
    duration: "1-2 hours",
    bestFor: ["History lovers", "Architecture fans", "Road trips"],
    highlights: ["Umayyad frescoes", "Desert architecture", "UNESCO heritage"],
    price: 3,
    rating: 4.5,
    location: { lat: 31.8014, lng: 36.587 },
  },
];

const seedDestinations = async () => {
  try {
    await Destination.bulkWrite(
      destinationData.map((destination) => {
        const { image, imageCredit, gallery, location, ...seedFields } =
          destination;

        return {
          updateOne: {
            filter: { name: destination.name },
            update: {
              $set: { image, imageCredit, gallery, location },
              $setOnInsert: seedFields,
            },
            upsert: true,
          },
        };
      })
    );
    console.log("Jordan destination photos and seed data are ready.");
  } catch (error) {
    console.error("Seed error:", error.message);
    throw error;
  }
};

module.exports = { seedDestinations, destinationData };
