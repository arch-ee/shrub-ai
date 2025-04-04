
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Trophy, Plant, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import ThemeToggle from '@/components/ThemeToggle';
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

interface TriviaQuestion {
  image: string;
  name: string;
  options: string[];
  funFact?: string;
}

// Sample plant data for the trivia game
const PLANT_QUESTIONS: TriviaQuestion[] = [
  {
    image: "https://images.unsplash.com/photo-1520302519031-fc731d078652",
    name: "Monstera Deliciosa",
    options: ["Monstera Deliciosa", "Philodendron", "Pothos", "Snake Plant"],
    funFact: "Also known as the Swiss Cheese Plant due to its distinctive leaf holes"
  },
  {
    image: "https://images.unsplash.com/photo-1463936575829-25148e1db1b8",
    name: "Snake Plant",
    options: ["ZZ Plant", "Snake Plant", "Aloe Vera", "Dracaena"],
    funFact: "One of the most tolerant houseplants that can purify air"
  },
  {
    image: "https://images.unsplash.com/photo-1596722656664-3e9dd9d1c911",
    name: "Fiddle Leaf Fig",
    options: ["Rubber Plant", "Fiddle Leaf Fig", "Bird of Paradise", "Ficus"],
    funFact: "Native to western Africa and grows in lowland tropical rainforests"
  },
  {
    image: "https://images.unsplash.com/photo-1611211232932-da3108398388",
    name: "Pothos",
    options: ["Monstera", "Philodendron", "Pothos", "English Ivy"],
    funFact: "One of the easiest houseplants to grow and propagate in water"
  },
  {
    image: "https://images.unsplash.com/photo-1509423350716-97f9360b4e09",
    name: "Peace Lily",
    options: ["Calla Lily", "Peace Lily", "Anthurium", "Bird's Nest Fern"],
    funFact: "Will droop dramatically when thirsty, but perks up quickly after watering"
  },
  {
    image: "https://images.unsplash.com/photo-1592170077110-517b691cb8ef",
    name: "Succulents",
    options: ["Cacti", "Succulents", "Aloe", "Jade Plant"],
    funFact: "These water-storing plants have adapted to survive in arid conditions"
  },
  {
    image: "https://images.unsplash.com/photo-1622554129902-bb01970e2540",
    name: "Aloe Vera",
    options: ["Haworthia", "Agave", "Aloe Vera", "Snake Plant"],
    funFact: "Its gel has been used for thousands of years for medicinal purposes"
  },
  {
    image: "https://images.unsplash.com/photo-1509423350716-97f9360b4e09",
    name: "Calathea",
    options: ["Calathea", "Maranta", "Stromanthe", "Ctenanthe"],
    funFact: "Known as 'prayer plants' because they raise their leaves at night"
  }
];

const PlantTrivia = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const { toast } = useToast();
  
  // Load high score from localStorage
  useEffect(() => {
    const savedHighScore = localStorage.getItem('plantTriviaHighScore');
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore));
    }
  }, []);

  // Save high score to localStorage when it changes
  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('plantTriviaHighScore', score.toString());
    }
  }, [score, highScore]);

  const triggerHaptic = async (style: ImpactStyle = ImpactStyle.Medium) => {
    if (Capacitor.isNativePlatform()) {
      await Haptics.impact({ style });
    }
  };

  const handleOptionSelect = (option: string) => {
    if (selectedOption || showAnswer) return;
    
    setSelectedOption(option);
    setShowAnswer(true);
    
    const isCorrect = option === PLANT_QUESTIONS[currentQuestionIndex].name;
    
    if (isCorrect) {
      setScore(prevScore => prevScore + 1);
      toast({
        title: "correct!",
        description: "You identified the plant correctly",
        className: "bg-leaf-600/90 text-white"
      });
      triggerHaptic(ImpactStyle.Light);
    } else {
      toast({
        title: "not quite",
        description: `That's a ${PLANT_QUESTIONS[currentQuestionIndex].name}`,
        variant: "destructive"
      });
      triggerHaptic(ImpactStyle.Medium);
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < PLANT_QUESTIONS.length - 1) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
      setSelectedOption(null);
      setShowAnswer(false);
      triggerHaptic(ImpactStyle.Light);
    } else {
      setGameOver(true);
      triggerHaptic(ImpactStyle.Heavy);
      toast({
        title: "quiz complete!",
        description: `Your score: ${score}/${PLANT_QUESTIONS.length}`,
      });
    }
  };

  const restartGame = () => {
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setShowAnswer(false);
    setGameOver(false);
    setScore(0);
    triggerHaptic(ImpactStyle.Medium);
  };

  const currentQuestion = PLANT_QUESTIONS[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / PLANT_QUESTIONS.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 dark:from-gray-900 dark:to-gray-800 p-4 flex flex-col items-center">
      <div className="w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <Link to="/">
            <Button variant="outline" size="icon" className="bg-gray-800/50 hover:bg-gray-800/80 rounded-full">
              <ArrowLeft className="h-5 w-5 text-cream-100" />
              <span className="sr-only">Back to home</span>
            </Button>
          </Link>
          <Badge className="bg-leaf-600 text-white">plant trivia</Badge>
          <ThemeToggle />
        </div>
        
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-cream-200" />
            <span className="text-cream-100">Score: {score}</span>
          </div>
          <div className="flex items-center gap-2">
            <Plant className="h-5 w-5 text-cream-200" />
            <span className="text-cream-100">Best: {highScore}</span>
          </div>
        </div>
        
        {!gameOver ? (
          <>
            <Progress value={progress} className="h-2 mb-6" />
            
            <Card className="bg-gray-800/60 border-gray-700 shadow-xl mb-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-cream-100 text-lg">Identify this plant</CardTitle>
                <CardDescription>Question {currentQuestionIndex + 1} of {PLANT_QUESTIONS.length}</CardDescription>
              </CardHeader>
              <CardContent>
                <AspectRatio ratio={4/3} className="overflow-hidden rounded-md mb-4">
                  <img 
                    src={currentQuestion.image} 
                    alt="Mystery plant" 
                    className="object-cover w-full h-full"
                  />
                </AspectRatio>
                
                <div className="grid grid-cols-1 gap-2">
                  {currentQuestion.options.map(option => (
                    <Button
                      key={option}
                      variant={
                        showAnswer 
                          ? option === currentQuestion.name 
                            ? "default" 
                            : option === selectedOption 
                              ? "destructive" 
                              : "outline"
                          : "outline"
                      }
                      className={`justify-start text-left h-auto py-3 ${
                        showAnswer && option === currentQuestion.name 
                          ? "bg-leaf-600 hover:bg-leaf-600 text-white" 
                          : showAnswer && option === selectedOption && option !== currentQuestion.name 
                            ? "bg-destructive/90 hover:bg-destructive" 
                            : "bg-gray-700/50 hover:bg-gray-700 text-cream-100 hover:text-white"
                      }`}
                      onClick={() => handleOptionSelect(option)}
                      disabled={showAnswer}
                    >
                      {option}
                    </Button>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between pt-2">
                {showAnswer && (
                  <p className="text-sm text-cream-200">{currentQuestion.funFact}</p>
                )}
                {showAnswer && (
                  <Button 
                    onClick={nextQuestion}
                    className="ml-auto bg-leaf-600 hover:bg-leaf-700 text-white"
                  >
                    {currentQuestionIndex < PLANT_QUESTIONS.length - 1 ? 'Next' : 'Finish'}
                  </Button>
                )}
              </CardFooter>
            </Card>
          </>
        ) : (
          <Card className="bg-gray-800/60 border-gray-700 shadow-xl">
            <CardHeader>
              <CardTitle className="text-cream-100">Quiz Complete!</CardTitle>
              <CardDescription>You scored {score} out of {PLANT_QUESTIONS.length}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <Trophy className="h-20 w-20 text-cream-500" />
              <div className="text-center">
                <p className="text-xl font-bold text-cream-100 mb-2">
                  {score === PLANT_QUESTIONS.length 
                    ? 'Perfect Score!' 
                    : score > PLANT_QUESTIONS.length / 2 
                      ? 'Great Job!' 
                      : 'Keep Learning!'}
                </p>
                <p className="text-cream-300">
                  {score === PLANT_QUESTIONS.length 
                    ? 'You\'re a plant identification master!' 
                    : score > PLANT_QUESTIONS.length / 2 
                      ? 'You know your plants well!' 
                      : 'With practice, you\'ll become a plant expert!'}
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={restartGame}
                className="w-full bg-leaf-600 hover:bg-leaf-700 text-white"
              >
                Play Again
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PlantTrivia;
