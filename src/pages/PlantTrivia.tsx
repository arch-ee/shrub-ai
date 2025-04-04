
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf, Trophy, ArrowUp, ArrowDown, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import ThemeToggle from '@/components/ThemeToggle';
import { useToast } from '@/hooks/use-toast';
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

interface TriviaQuestion {
  id: string;
  image: string;
  answer: string;
  options: string[];
  funFact: string;
}

// Demo questions
const DEMO_QUESTIONS: TriviaQuestion[] = [
  {
    id: 'q1',
    image: 'https://images.unsplash.com/photo-1520412099551-62b6bafeb5bb?q=80&w=600',
    answer: 'Monstera Deliciosa',
    options: ['Monstera Deliciosa', 'Fiddle Leaf Fig', 'Pothos', 'Snake Plant'],
    funFact: 'Also known as "Swiss Cheese Plant" because of its unique leaf holes!'
  },
  {
    id: 'q2',
    image: 'https://images.unsplash.com/photo-1614594805320-e6a5549a8247?q=80&w=600',
    answer: 'Fiddle Leaf Fig',
    options: ['Snake Plant', 'Fiddle Leaf Fig', 'ZZ Plant', 'Rubber Plant'],
    funFact: 'Native to western Africa, it's one of the most popular indoor plants despite being somewhat challenging to care for.'
  },
  {
    id: 'q3',
    image: 'https://images.unsplash.com/photo-1620127682229-33388276e540?q=80&w=600',
    answer: 'Snake Plant',
    options: ['Peace Lily', 'ZZ Plant', 'Snake Plant', 'Aloe Vera'],
    funFact: 'One of the few plants that convert CO2 to oxygen at night, making it great for bedrooms!'
  },
  {
    id: 'q4',
    image: 'https://images.unsplash.com/photo-1637967886160-fd78dc3ce2ac?q=80&w=600',
    answer: 'Pothos',
    options: ['Philodendron', 'Pothos', 'Ivy', 'Spider Plant'],
    funFact: 'Also called "Devil's Ivy" because it's almost impossible to kill and stays green even in the dark.'
  },
  {
    id: 'q5',
    image: 'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?q=80&w=600',
    answer: 'Aloe Vera',
    options: ['Aloe Vera', 'Agave', 'Haworthia', 'Echeveria'],
    funFact: 'Used medicinally for over 6,000 years! The gel inside its leaves has healing properties.'
  }
];

const SPLASH_TEXTS = [
  "plant quiz",
  "name game",
  "green test",
  "leaf knowledge",
  "botany challenge",
  "identify leaves"
];

const PlantTrivia = () => {
  const [questions, setQuestions] = useState<TriviaQuestion[]>(DEMO_QUESTIONS);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [splashText, setSplashText] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Load high score from localStorage
    const savedHighScore = localStorage.getItem('plantTriviaHighScore');
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore));
    }
    
    // Set random splash text
    const randomIndex = Math.floor(Math.random() * SPLASH_TEXTS.length);
    setSplashText(SPLASH_TEXTS[randomIndex]);
    
    // Shuffle questions
    setQuestions([...DEMO_QUESTIONS].sort(() => Math.random() - 0.5));
  }, []);

  const triggerHaptic = async (style: ImpactStyle = ImpactStyle.Medium) => {
    if (Capacitor.isNativePlatform()) {
      await Haptics.impact({ style });
    }
  };

  const handleOptionSelect = (option: string) => {
    setSelectedOption(option);
    setShowAnswer(true);
    
    if (option === getCurrentQuestion().answer) {
      setScore(prev => prev + 1);
      triggerHaptic(ImpactStyle.Medium);
      toast({
        title: "correct!",
        description: `That's ${getCurrentQuestion().answer}`,
        variant: "default",
      });
    } else {
      triggerHaptic(ImpactStyle.Heavy);
      toast({
        title: "not quite",
        description: `The answer is ${getCurrentQuestion().answer}`,
        variant: "destructive",
      });
    }
  };
  
  const handleNextQuestion = () => {
    triggerHaptic(ImpactStyle.Light);
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
      setShowAnswer(false);
    } else {
      // End of quiz
      if (score > highScore) {
        setHighScore(score);
        localStorage.setItem('plantTriviaHighScore', score.toString());
        toast({
          title: "new high score!",
          description: `You got ${score} out of ${questions.length} correct!`,
        });
        triggerHaptic(ImpactStyle.Heavy);
      } else {
        toast({
          title: "quiz complete",
          description: `You got ${score} out of ${questions.length} correct!`,
        });
      }
      
      // Reset quiz with shuffled questions
      setTimeout(() => {
        setQuestions([...DEMO_QUESTIONS].sort(() => Math.random() - 0.5));
        setCurrentQuestionIndex(0);
        setScore(0);
        setSelectedOption(null);
        setShowAnswer(false);
      }, 1500);
    }
  };
  
  const getCurrentQuestion = (): TriviaQuestion => {
    return questions[currentQuestionIndex];
  };
  
  const getProgressPercentage = () => {
    return ((currentQuestionIndex + 1) / questions.length) * 100;
  };
  
  const isCorrect = (option: string) => {
    return showAnswer && option === getCurrentQuestion().answer;
  };
  
  const isIncorrect = (option: string) => {
    return showAnswer && selectedOption === option && option !== getCurrentQuestion().answer;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream-50 to-cream-100 dark:from-gray-900 dark:to-gray-800 p-4 flex flex-col items-center transition-colors duration-300">
      <ThemeToggle />
      
      <div className="w-full max-w-md space-y-4 animate-fade-in">
        <div className="text-center space-y-2">
          <Badge variant="subtle" className="mb-2 bg-cream-100 dark:bg-gray-800 dark:text-cream-100">shrubAI</Badge>
          <h1 className="text-2xl font-light text-leaf-900 dark:text-cream-100">{splashText}</h1>
        </div>
        
        <div className="flex justify-between items-center px-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/')}
            className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <ArrowUp className="h-4 w-4 mr-1 rotate-90" />
            back home
          </Button>
          
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-yellow-500" />
            <span className="text-sm font-medium dark:text-cream-100">
              {score}/{questions.length} • high: {highScore}
            </span>
          </div>
          
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setShowHelp(true)}
            className="h-8 w-8"
          >
            <HelpCircle className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </Button>
        </div>
        
        <Progress value={getProgressPercentage()} className="h-1 bg-gray-200 dark:bg-gray-700" />
        
        <Card className="p-6 backdrop-blur-sm bg-white/80 border-leaf-200 shadow-lg dark:bg-gray-800/60 dark:border-gray-700 dark:shadow-gray-900/30">
          <div className="space-y-4">
            <div className="flex justify-center">
              <AspectRatio ratio={4/3} className="relative w-full rounded-lg overflow-hidden">
                <img
                  src={getCurrentQuestion().image}
                  alt="Mystery plant"
                  className="w-full h-full object-cover"
                />
              </AspectRatio>
            </div>
            
            <div className="text-center">
              <h2 className="text-lg font-medium dark:text-cream-100">
                What plant is this?
              </h2>
            </div>
            
            <div className="grid grid-cols-1 gap-2">
              {getCurrentQuestion().options.map((option) => (
                <Button
                  key={option}
                  variant={
                    isCorrect(option) ? "default" : 
                    isIncorrect(option) ? "destructive" : 
                    "outline"
                  }
                  className={`
                    justify-start px-4 py-6 h-auto text-left
                    ${isCorrect(option) ? "bg-green-500 hover:bg-green-600 text-white" : ""}
                    ${!showAnswer ? "hover:bg-gray-100 dark:hover:bg-gray-700" : ""}
                    ${showAnswer && !isCorrect(option) && !isIncorrect(option) ? "opacity-70" : ""}
                    dark:text-cream-100 dark:border-gray-600
                  `}
                  disabled={showAnswer}
                  onClick={() => handleOptionSelect(option)}
                >
                  {option}
                  {isCorrect(option) && (
                    <Leaf className="ml-auto h-5 w-5 text-white" />
                  )}
                </Button>
              ))}
            </div>
            
            {showAnswer && (
              <div className="mt-4 p-3 bg-cream-50 rounded-md text-sm dark:bg-gray-700 dark:text-cream-100">
                <p className="font-medium mb-1">Fun Fact:</p>
                <p>{getCurrentQuestion().funFact}</p>
              </div>
            )}
            
            {showAnswer && (
              <Button 
                onClick={handleNextQuestion}
                className="w-full bg-leaf-500 hover:bg-leaf-600 text-white dark:bg-leaf-600 dark:hover:bg-leaf-700"
              >
                {currentQuestionIndex < questions.length - 1 ? "next plant" : "play again"}
              </Button>
            )}
          </div>
        </Card>
      </div>
      
      <Dialog open={showHelp} onOpenChange={setShowHelp}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>How to Play Plant Trivia</DialogTitle>
            <DialogDescription>
              Test your plant identification knowledge
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 text-sm">
            <div>
              <h3 className="font-medium mb-1">Game Rules</h3>
              <p>Each round shows you a plant image and four possible names. Select the correct plant name to score a point.</p>
            </div>
            <div>
              <h3 className="font-medium mb-1">Scoring</h3>
              <p>Get as many correct answers as possible. Your high score is saved between sessions.</p>
            </div>
            <Separator />
            <div className="text-xs text-gray-500">
              <p>Plant images sourced from Unsplash.</p>
              <p>Test your knowledge and have fun learning about different plants!</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PlantTrivia;
