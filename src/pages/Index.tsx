
import { useState } from "react";
import PlantIdentifier from "@/components/PlantIdentifier";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const Index = () => {
  const [showDocs, setShowDocs] = useState(false);

  return (
    <>
      <div className="fixed bottom-4 right-4 z-10">
        <Button 
          onClick={() => setShowDocs(true)}
          variant="outline" 
          size="sm"
          className="rounded-full h-10 w-10 p-0 flex items-center justify-center"
        >
          <FileText className="h-5 w-5" />
        </Button>
      </div>
      
      <Dialog open={showDocs} onOpenChange={setShowDocs}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>shrubAI Documentation</DialogTitle>
            <DialogDescription>
              Plant, berry, and fungi identification with safety information
            </DialogDescription>
          </DialogHeader>
          <div className="prose prose-sm dark:prose-invert">
            <h2>Overview</h2>
            <p>
              shrubAI is an identification application that uses artificial intelligence to 
              identify plants, berries, fruits, and fungi from images, with a special focus on edibility and safety.
            </p>
            
            <h2>Features</h2>
            <ul>
              <li>
                <strong>Plant & Fungi Identification</strong> - Upload an image or take a photo
                and receive AI-powered identification
              </li>
              <li>
                <strong>Edibility Assessment</strong> - Learn whether plants, berries, or fungi are safe to consume
              </li>
              <li>
                <strong>Toxicity Warnings</strong> - Receive clear indicators about potential dangers
                and harmful effects
              </li>
              <li>
                <strong>Health Assessment</strong> - Get a health rating and diagnosis of any issues
                detected in plants
              </li>
              <li>
                <strong>Care Information</strong> - Learn about water needs, sunlight requirements,
                and temperature preferences for identified plants
              </li>
              <li>
                <strong>Dark Mode</strong> - Toggle between light and dark themes for comfortable
                viewing in any environment
              </li>
            </ul>
            
            <h2>How to Use</h2>
            <ol>
              <li>Take a photo using the camera button or upload an existing image</li>
              <li>Click "identify" to analyze the image</li>
              <li>View detailed information about what you've found</li>
              <li>Pay special attention to edibility indicators and any warning messages</li>
              <li>If toxic or dangerous, follow any safety recommendations provided</li>
            </ol>
            
            <h2>Technology</h2>
            <p>
              shrubAI uses Google's Gemini 2.0 API for image analysis and identification.
              The application is built with React, TypeScript, and Tailwind CSS.
            </p>
            
            <h2>Important Safety Disclaimer</h2>
            <p className="text-red-600 dark:text-red-400 font-medium">
              Never consume any plant, berry, fruit, or fungus based solely on this app's identification. 
              Always cross-reference with multiple reliable sources and consult with foraging experts 
              before consuming any wild-growing organism. This application provides informational 
              content only and is not a substitute for professional advice.
            </p>
            
            <h2>Privacy</h2>
            <p>
              Images are processed locally and only sent to Google's API for analysis.
              No personal data or images are stored permanently.
            </p>
            
            <div className="text-center mt-8 text-sm text-gray-500 dark:text-gray-400">
              © 2024 shrubAI. All rights reserved.
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      <PlantIdentifier />
    </>
  );
};

export default Index;
