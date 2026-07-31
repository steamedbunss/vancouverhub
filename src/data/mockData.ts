//declaring alert item type for mock dashboard data
import type { AlertItem } from '../types'

//declaring sample alert items for development and demo UI
export const MOCK_ALERTS: AlertItem[] = [
  {
    id: '1',
    type: 'weather',
    severity: 'warning',
    title: 'Heat Warning',
    message: 'Take precautions. Stay hydrated. Seek shade during peak hours.',
    issuedAt: 'Jul 23, 2:00 PM',
  },
  {
    id: '2',
    type: 'air-quality',
    severity: 'info',
    title: 'AQI Update',
    message: 'Air quality is low risk in Kitsilano (AQHI 2.0).',
    issuedAt: 'Jul 23, 10:00 AM',
  },
  {
    id: '3',
    type: 'wildfire',
    severity: 'info',
    title: 'Wildfire Watch',
    message: 'Nearest active fire tracked 23 km away. No evacuation orders.',
    issuedAt: 'Jul 22, 6:30 PM',
  },
]

//declaring sample traffic section data with closure count and camera list
export const MOCK_TRAFFIC = {
  closures: 26,
  impact: 'High impact',
  cameras: [
    { id: '403', label: 'CAM #403: GEORGIA ST' },
    { id: '108', label: 'CAM #108: GRANVILLE & BROADWAY' },
    { id: '221', label: 'CAM #221: CAMBIE BRIDGE' },
    { id: '315', label: 'CAM #315: KNIGHT ST BRIDGE' },
  ],
}

//declaring sample environment card data with temperature, AQHI, and warning
export const MOCK_ENVIRONMENT = {
  temperature: 31,
  aqi: 2.0,
  aqiLabel: 'LOW RISK',
  condition: 'Sunny',
  warning: {
    title: 'HEAT WARNING',
    message: 'Take precautions. Stay hydrated. Seek shade during peak hours.',
  },
}

//declaring sample local events for dashboard preview cards
export const MOCK_EVENTS = [
  {
    id: '1',
    title: 'Kitsilano Winter Market',
    day: 'Friday',
    time: '5:30 PM',
    location: 'Stanley Park',
    featured: true,
    image:
      'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=480&h=640&fit=crop',
  },
  {
    id: '2',
    title: 'Sunset Yoga',
    day: 'Saturday',
    time: '7:00 PM',
    location: 'Kits Beach',
    featured: true,
    image:
      'https://images.unsplash.com/photo-1599901860904-17e06ed7088a?w=480&h=640&fit=crop',
  },
  {
    id: '3',
    title: 'False Creek Run',
    day: 'Sunday',
    time: '8:00 AM',
    location: 'Science World',
    featured: false,
    image:
      'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=480&h=640&fit=crop',
  },
  {
    id: '4',
    title: 'Trout Lake Market',
    day: 'Sunday',
    time: '10:00 AM',
    location: 'Trout Lake',
    featured: false,
    image:
      'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=480&h=640&fit=crop',
  },
  {
    id: '5',
    title: 'Granville Night Market',
    day: 'Saturday',
    time: '6:00 PM',
    location: 'Granville Island',
    featured: false,
    image:
      'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=480&h=640&fit=crop',
  },
]

//declaring sample gas price card data with station list
export const MOCK_GAS = {
  fuelType: 'Regular',
  stations: [
    { name: 'Shell - Broadway', price: 201.5, distance: '0.8 km' },
    { name: 'Chevron - Granville', price: 202.9, distance: '1.2 km' },
    { name: 'Petro-Canada', price: 204.1, distance: '2.5 km' },
  ],
}

//declaring sample housing rent benchmark data
export const MOCK_HOUSING = {
  month: 'October 2025',
  oneBed: 2850,
  twoBed: 3900,
}

//declaring sample government programs highlights for dashboard card
export const MOCK_GOV_PROGRAMS = {
  activePrograms: 12,
  highlights: [
    { title: 'Rent Bank Emergency Assistance', deadline: 'Open year-round' },
    { title: 'Home Energy Retrofit Grants', deadline: 'Apply by Sep 30' },
    { title: 'Small Business Green Grant', deadline: 'Rolling intake' },
  ],
}

//declaring sample 311 service request summary for dashboard card
export const MOCK_311 = {
  recentCount: 8,
  requests: [
    {
      id: 'SR-10482',
      type: 'Pothole repair',
      status: 'Open',
      area: 'Kitsilano',
      openDays: 4,
    },
    {
      id: 'SR-10401',
      type: 'Street light out',
      status: 'In progress',
      area: 'Fairview',
      openDays: 2,
    },
    {
      id: 'SR-10388',
      type: 'Missed garbage pickup',
      status: 'Closed',
      area: 'Kitsilano',
      openDays: 0,
    },
  ],
}
