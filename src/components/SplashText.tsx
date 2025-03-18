
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const splashTexts = [
  "identify your plants. no fuss.",
  "your pocket botanist",
  "leaf it to us",
  "plant knowledge in your pocket",
  "snap, identify, grow",
  "fungi or friend-gi?",
  "berry good at identification",
  "the fruit detective",
  "plant whisperer in your pocket",
  "natural world decoder",
  "roots, shoots, and the truth",
  "identify in a snap",
  "from seed to screen",
  "nature's encyclopedia",
  "plants don't keep secrets from us",
  "we speak fluent flora",
  "bloom or doom? we'll tell you",
  "botany made easy",
  "leaf through nature's secrets",
  "plant parent's best friend"
];

const SplashText: React.FC = () => {
  const [text, setText] = useState(splashTexts[0]);
  
  useEffect(() => {
    // Select a random splash text on component mount
    const randomIndex = Math.floor(Math.random() * splashTexts.length);
    setText(splashTexts[randomIndex]);
  }, []);
  
  return (
    <motion.p 
      className="text-sm text-leaf-600 dark:text-cream-200"
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        type: "spring",
        stiffness: 500,
        damping: 30,
        delay: 0.2
      }}
    >
      {text}
    </motion.p>
  );
};

export default SplashText;
