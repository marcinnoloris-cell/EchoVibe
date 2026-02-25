export type Mood = 'Relax' | 'Energy' | 'Inspiration' | 'Calm' | 'Adventure' | 'Melancholy' | 'Joy';

export interface MoodProfile {
  primaryMood: Mood;
  intensity: number; // 0 to 1
  description: string;
  suggestedColors: string[];
  spotifyInsights?: string;
}

export interface ItineraryOption {
  id: string;
  title: string;
  type: 'Relax' | 'Energy' | 'Inspiration';
  destination: string;
  description: string;
  highlights: string[];
  estimatedCost: string;
  image: string;
}

export interface TravelPlan {
  moodProfile: MoodProfile;
  options: ItineraryOption[];
}
