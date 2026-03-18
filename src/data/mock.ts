export const onboardingSlides = [
  {
    id: 'discover',
    title: 'Discover Hidden Gems',
    subtitle: 'Explore secret spots locals love.',
    image:
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'plan',
    title: 'AI Powered Itineraries',
    subtitle: 'Get personalized travel plans instantly.',
    image:
      'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'connect',
    title: 'Join Travel Communities',
    subtitle: 'Share experiences and make friends.',
    image:
      'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1200&q=80'
  }
];

export const stories = [
  {
    id: 's1',
    name: 'Your Story',
    image:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    seen: false,
    isAdd: true
  },
  {
    id: 's2',
    name: 'Travel',
    image:
      'https://images.unsplash.com/photo-1482192596544-9eb780fc7f66?auto=format&fit=crop&w=200&q=80',
    seen: false,
    isAdd: false
  },
  {
    id: 's3',
    name: 'Friends',
    image:
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=80',
    seen: true,
    isAdd: false
  }
];

export const posts = [
  {
    id: 'p1',
    user: 'Sarah Thompson',
    handle: '@sarahwanders',
    location: 'Santorini, Greece',
    image:
      'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1600&q=80',
    caption: 'Watching the sunset over the caldera with friends.',
    likes: 234,
    comments: 45,
    shares: 12
  },
  {
    id: 'p2',
    user: 'Miguel Alvarez',
    handle: '@migalv',
    location: 'Kyoto, Japan',
    image:
      'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1600&q=80',
    caption: 'Quiet morning walk near the bamboo grove.',
    likes: 512,
    comments: 68,
    shares: 27
  }
];

export const hiddenSpotPublicList = [
  {
    id: 'hs-public-1',
    name: 'Misty Cliff Point',
    locationLabel: 'Kodaikanal, Tamil Nadu',
    category: 'Nature',
    description: 'Quiet sunrise viewpoint with pine forest trail and low crowd in mornings.',
    appliedBy: 'Harish Kumar',
    appliedByHandle: '@harishtrails',
    status: 'Approved',
    image:
      'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'hs-public-2',
    name: 'Old Fort Stepwell',
    locationLabel: 'Bundi, Rajasthan',
    category: 'Heritage',
    description: 'Historic stepwell beside an old fort lane, best visited at golden hour.',
    appliedBy: 'Meera Sharma',
    appliedByHandle: '@meeraroams',
    status: 'Approved',
    image:
      'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'hs-public-3',
    name: 'Backwater Jetty Walk',
    locationLabel: 'Alappuzha, Kerala',
    category: 'Waterfront',
    description: 'Local jetty boardwalk with canoe rides and authentic evening food stalls.',
    appliedBy: 'Rafiq Ali',
    appliedByHandle: '@rafiqroutes',
    status: 'Approved',
    image:
      'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80'
  }
];

export const places = [
  {
    id: 'pl1',
    name: 'Taj Mahal',
    location: 'Agra, Uttar Pradesh',
    rating: 4.9,
    reviews: 15240,
    latitude: 27.1751,
    longitude: 78.0421,
    category: 'Landmark',
    vrLink: 'https://maps.app.goo.gl/b9fotiasVhcmbJbR7',
    description:
      'The Taj Mahal is a UNESCO World Heritage Site and one of the world\'s most famous monuments, built by Emperor Shah Jahan in memory of Mumtaz Mahal. You can explore its gardens, marble architecture, and surroundings in full 360-degree Street View.',
    image:
      'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'pl2',
    name: 'Hawa Mahal',
    location: 'Jaipur, Rajasthan',
    rating: 4.8,
    reviews: 10430,
    latitude: 26.9239,
    longitude: 75.8267,
    category: 'Landmark',
    vrLink: 'https://maps.app.goo.gl/Hw6AqMG2QwEFE4YF6',
    description:
      'Hawa Mahal, known as the "Palace of Winds," is a unique pink sandstone structure with 953 windows designed for ventilation and royal viewing. It is one of Jaipur\'s most iconic landmarks.',
    image:
      'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'pl3',
    name: 'Golden Temple',
    location: 'Amritsar, Punjab',
    rating: 4.9,
    reviews: 18870,
    latitude: 31.62,
    longitude: 74.8765,
    category: 'Temple',
    vrLink: 'https://maps.app.goo.gl/NgQf2T1bPs1qCTYj8',
    description:
      'The Golden Temple is the holiest shrine of Sikhism and attracts millions of visitors annually. Its gold-covered structure and surrounding water tank create a peaceful spiritual atmosphere.',
    image:
      'https://images.unsplash.com/photo-1585136916302-41f798d5f6f9?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'pl4',
    name: 'Mysore Palace',
    location: 'Mysore, Karnataka',
    rating: 4.8,
    reviews: 9670,
    latitude: 12.3051,
    longitude: 76.6551,
    category: 'Palace',
    vrLink: 'https://maps.app.goo.gl/PxVNwUc2Qt76YRZEA',
    description:
      'Mysore Palace is one of India\'s most beautiful royal residences, famous for its Indo-Saracenic architecture and lighting during festivals.',
    image:
      'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'pl5',
    name: 'Gateway of India',
    location: 'Mumbai, Maharashtra',
    rating: 4.7,
    reviews: 14210,
    latitude: 18.922,
    longitude: 72.8347,
    category: 'Landmark',
    vrLink: 'https://maps.app.goo.gl/fpxupSBL2R1oWp827',
    description:
      'This iconic arch monument was built during British rule and overlooks the Arabian Sea. It is one of Mumbai\'s most popular tourist attractions.',
    image:
      'https://images.unsplash.com/photo-1595658658481-d53d3f999875?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'pl6',
    name: 'Virupaksha Temple',
    location: 'Hampi, Karnataka',
    rating: 4.8,
    reviews: 7210,
    latitude: 15.335,
    longitude: 76.4601,
    category: 'Temple',
    vrLink: 'https://maps.app.goo.gl/BSkaAt28QwJSmvkp8',
    description:
      'Located in Hampi, this ancient temple is part of a UNESCO heritage site known for historic ruins and unique stone architecture.',
    image:
      'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'pl7',
    name: 'Ellora Caves',
    location: 'Aurangabad, Maharashtra',
    rating: 4.8,
    reviews: 8450,
    latitude: 20.0268,
    longitude: 75.179,
    category: 'Heritage',
    vrLink: 'https://maps.app.goo.gl/Kro7Z62ACfiw5KwB8',
    description:
      'Ellora Caves contain rock-cut temples and monasteries carved into mountains. They represent Hindu, Buddhist, and Jain cultures.',
    image:
      'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'pl8',
    name: 'Charminar',
    location: 'Hyderabad, Telangana',
    rating: 4.7,
    reviews: 13320,
    latitude: 17.3616,
    longitude: 78.4747,
    category: 'Monument',
    vrLink: 'https://maps.app.goo.gl/KrY86NRXwHJ34KZ49',
    description:
      'Charminar is a historic monument and symbol of Hyderabad, famous for its four minarets and Indo-Islamic architecture.',
    image:
      'C:\Users\vijay\Desktop\AI Travel Assisstant\assets\Charminar.jpg'
  },
  {
    id: 'pl9',
    name: 'Chittorgarh Fort',
    location: 'Chittorgarh, Rajasthan',
    rating: 4.8,
    reviews: 6890,
    latitude: 24.887,
    longitude: 74.6454,
    category: 'Fort',
    vrLink: 'https://maps.app.goo.gl/ZTAwXV65DLP3eugBA',
    description:
      'Chittorgarh Fort is one of India\'s largest forts and a UNESCO heritage site with temples, palaces, and towers spread across a hilltop.',
    image:
      'https://images.unsplash.com/photo-1506976785307-8732e854ad03?auto=format&fit=crop&w=1200&q=80'
  }
];

export const communities = [
  {
    id: 'c1',
    name: 'Mountain Hikers',
    members: '12.5k',
    online: '45',
    description: 'For those who love peaks and long trails.',
    joined: false,
    image:
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'c2',
    name: 'Beach Lovers',
    members: '8.2k',
    online: '32',
    description: 'Sun, sand, and slow mornings by the water.',
    joined: true,
    image:
      'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80'
  }
];

export const guides = [
  {
    id: 'g1',
    name: 'Rajesh Kumar',
    rating: 4.9,
    reviews: 127,
    location: 'Bangalore, India',
    languages: 'EN, HI, KA',
    experience: '8 years',
    specialties: ['Heritage', 'Food Tours'],
    price: '1500 per day',
    avatar:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80'
  },
  {
    id: 'g2',
    name: 'Sofia Alvarez',
    rating: 4.8,
    reviews: 98,
    location: 'Barcelona, Spain',
    languages: 'EN, ES',
    experience: '6 years',
    specialties: ['Culture', 'Night Walks'],
    price: '180 per day',
    avatar:
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=80'
  }
];

export const chatMessages = [
  {
    id: 'm1',
    role: 'bot',
    text: 'Hi, I am WanderMate. Where would you like to go next?'
  },
  {
    id: 'm2',
    role: 'user',
    text: 'Plan a weekend trip to a beach destination.'
  },
  {
    id: 'm3',
    role: 'bot',
    text: 'Here are three beach escapes with great weather and short flights.'
  }
];

export const chatSuggestions = [
  'Popular destinations',
  'Plan weekend trip',
  'Find cheap flights'
];

export const exploreFilters = ['All', 'Recent', 'New'];
