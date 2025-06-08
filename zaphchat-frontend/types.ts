import React from 'react';

export interface NavItemConfig {
  id: string; // Unique identifier for the navigation item (e.g., 'dashboard', 'analytics')
  name: string; // Display name
  icon: React.ElementType<{ className?: string }>;
  sectionTitle?: string; // Optional title to denote a new section in the sidebar
}

// Props for page components, can be expanded as needed
export interface PageProps {
  // setActivePageTitle is no longer needed here as App.tsx manages the title
}

// Types for react-grid-layout
export interface Layout {
  i: string; // Item key
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  maxW?: number;
  minH?: number;
  maxH?: number;
  static?: boolean;
  isDraggable?: boolean;
  isResizable?: boolean;
}
export type Layouts = { [breakpoint: string]: Layout[] };


// Type for Weather Data
export interface WeatherData {
  temperature: number;
  condition: string; // e.g., "Sunny", "Cloudy", "Rain"
  iconCode: string; // e.g., "01d" for sunny day, "01n" for clear night
  locationName?: string;
  isDay: boolean;
  sunrise?: number; // timestamp
  sunset?: number; // timestamp
  error?: string;
}

export interface Bot {
  _id?: string;
  botName: string;
  phoneNumber: string;
  whatsappId: string;
  status: 'online' | 'paused' | 'archived';
  personality: string;
  contacts: { name: string; phoneNumber: string }[];
  conversations: any[];
  messages: any[];
}