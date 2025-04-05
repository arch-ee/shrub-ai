
// A large database of plant trivia questions with images
// This simulates having 1000 plant images by creating a generator function

import { shuffle } from 'lodash';

export interface TriviaQuestion {
  id: string;
  image: string;
  answer: string;
  options: string[];
  funFact: string;
}

// Base set of plant names that will be used to generate variations
const PLANT_NAMES = [
  'Monstera Deliciosa', 'Fiddle Leaf Fig', 'Snake Plant', 'Pothos', 'Aloe Vera',
  'Spider Plant', 'Peace Lily', 'ZZ Plant', 'Rubber Plant', 'String of Pearls',
  'Boston Fern', 'Calathea', 'Philodendron', 'Jade Plant', 'Rabbit\'s Foot Fern',
  'Chinese Money Plant', 'English Ivy', 'Air Plant', 'Bird of Paradise', 'Prayer Plant',
  'Dracaena', 'African Violet', 'Haworthia', 'Aglaonema', 'Croton', 
  'Ficus Elastica', 'Alocasia', 'Anthurium', 'Cactus', 'Echeveria',
  'Begonia Rex', 'Peperomia', 'Parlor Palm', 'Schefflera', 'Tradescantia',
  'Staghorn Fern', 'Dieffenbachia', 'Maranta', 'Ponytail Palm', 'Hoya',
  'Areca Palm', 'Cyclamen', 'Bromeliad', 'Aspidistra', 'Yucca',
  'Zebra Plant', 'Kalanchoe', 'Orchid', 'Bamboo Palm', 'Polka Dot Plant'
];

// Plant image URLs from Unsplash (a set of reliable plant images)
const PLANT_IMAGES = [
  'https://images.unsplash.com/photo-1520412099551-62b6bafeb5bb?q=80&w=600', // Monstera
  'https://images.unsplash.com/photo-1614594805320-e6a5549a8247?q=80&w=600', // Fiddle Leaf Fig
  'https://images.unsplash.com/photo-1620127682229-33388276e540?q=80&w=600', // Snake Plant
  'https://images.unsplash.com/photo-1637967886160-fd78dc3ce2ac?q=80&w=600', // Pothos
  'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?q=80&w=600', // Aloe
  'https://images.unsplash.com/photo-1572688484438-313a6e50c333?q=80&w=600', // Spider Plant
  'https://images.unsplash.com/photo-1593482892290-f54317f0e652?q=80&w=600', // Peace Lily
  'https://images.unsplash.com/photo-1646274780098-f5e5a55d464b?q=80&w=600', // ZZ Plant
  'https://images.unsplash.com/photo-1622547748225-3fc4abd2cca0?q=80&w=600', // Rubber Plant
  'https://images.unsplash.com/photo-1637953419766-6c503db448d1?q=80&w=600', // String of Pearls
  'https://images.unsplash.com/photo-1622547748225-3fc4abd2cca0?q=80&w=600', // Boston Fern
  'https://images.unsplash.com/photo-1646401434933-15ae4ea4c8e5?q=80&w=600', // Calathea
  'https://images.unsplash.com/photo-1622547748225-3fc4abd2cca0?q=80&w=600', // Philodendron
  'https://images.unsplash.com/photo-1558693168-c370615b54e0?q=80&w=600', // Jade Plant
  'https://images.unsplash.com/photo-1637953419766-6c503db448d1?q=80&w=600', // Rabbit's Foot Fern
  'https://images.unsplash.com/photo-1614594805320-e6a5549a8247?q=80&w=600', // Chinese Money Plant
  'https://images.unsplash.com/photo-1622547748225-3fc4abd2cca0?q=80&w=600', // English Ivy
  'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?q=80&w=600', // Air Plant
  'https://images.unsplash.com/photo-1593482892290-f54317f0e652?q=80&w=600', // Bird of Paradise
  'https://images.unsplash.com/photo-1637953419766-6c503db448d1?q=80&w=600'  // Prayer Plant
];

// Fun facts about plants
const PLANT_FUN_FACTS = [
  "Known as the 'Swiss Cheese Plant' because of its unique leaf holes!",
  "Native to western Africa, it's one of the most popular indoor plants despite being challenging to care for.",
  "One of the few plants that convert CO2 to oxygen at night, making it great for bedrooms!",
  "Also called 'Devil\\'s Ivy' because it's almost impossible to kill and stays green even in the dark.",
  "Used medicinally for over 6,000 years! The gel inside its leaves has healing properties.",
  "Produces baby plants called 'spiderettes' that hang from the mother plant on long stems.",
  "NASA named it one of the top indoor plants for purifying air.",
  "One of the most drought-tolerant houseplants - perfect for forgetful waterers!",
  "Its leaves can grow up to 12 inches wide in proper conditions.",
  "In its natural habitat, it can trail up to 20 feet or more!",
  "Can live for over 100 years when properly cared for.",
  "Moves its leaves up and down in a daily rhythm responding to light.",
  "Can climb up trees and other structures in nature using aerial roots.",
  "In feng shui, it's believed to attract prosperity and good fortune.",
  "Named after its unique rhizomes that resemble a rabbit's foot.",
  "Also known as Pilea peperomioides, it was smuggled out of China in the 1940s.",
  "Was used by NASA in experiments to clean air in space stations.",
  "Can survive entirely on moisture and nutrients from the air - no soil needed!",
  "Can grow over 30 feet tall in natural conditions with proper care.",
  "Folds its leaves at night, resembling hands in prayer."
];

// A function to generate a dataset of numerous unique plant trivia questions
export function generatePlantTriviaQuestions(count: number = 1000): TriviaQuestion[] {
  const questions: TriviaQuestion[] = [];
  
  // Create variations to simulate a larger dataset
  for (let i = 0; i < count; i++) {
    // Cycle through available images (about 20 unique images)
    const imageIndex = i % PLANT_IMAGES.length;
    const image = PLANT_IMAGES[imageIndex];
    
    // Select a correct answer
    const correctAnswerIndex = i % PLANT_NAMES.length;
    const correctAnswer = PLANT_NAMES[correctAnswerIndex];
    
    // Create options by selecting 3 other random plants plus the correct answer
    let options = [correctAnswer];
    while (options.length < 4) {
      const randomPlant = PLANT_NAMES[Math.floor(Math.random() * PLANT_NAMES.length)];
      if (!options.includes(randomPlant)) {
        options.push(randomPlant);
      }
    }
    
    // Shuffle the options
    options = shuffle(options);
    
    // Select a fun fact (cycling through available fun facts)
    const funFactIndex = i % PLANT_FUN_FACTS.length;
    const funFact = PLANT_FUN_FACTS[funFactIndex];
    
    questions.push({
      id: `q${i + 1}`,
      image,
      answer: correctAnswer,
      options,
      funFact
    });
  }
  
  return questions;
}

// Export a pre-generated set of 1000 questions
export const PLANT_TRIVIA_QUESTIONS = generatePlantTriviaQuestions(1000);
