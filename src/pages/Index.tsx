
import { useState } from "react";
import PlantIdentifier from "@/components/PlantIdentifier";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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
          </DialogHeader>
          <div className="prose prose-sm dark:prose-invert">
            <h2>Overview</h2>
            <p>
              shrubAI is a plant identification application that uses artificial intelligence to 
              identify plants from images and provide care information.
            </p>
            
            <h2>Features</h2>
            <ul>
              <li>
                <strong>Plant Identification</strong> - Upload an image or take a photo of a plant
                and receive AI-powered identification
              </li>
              <li>
                <strong>Health Assessment</strong> - Get a health rating and diagnosis of any issues
                detected in your plant
              </li>
              <li>
                <strong>Care Information</strong> - Learn about water needs, sunlight requirements,
                and temperature preferences for your plant
              </li>
              <li>
                <strong>Dark Mode</strong> - Toggle between light and dark themes for comfortable
                viewing in any environment
              </li>
            </ul>
            
            <h2>How to Use</h2>
            <ol>
              <li>Take a photo using the camera button or upload an existing image</li>
              <li>Click "identify plant" to analyze the image</li>
              <li>View detailed information about your plant</li>
              <li>If issues are detected, review the diagnosis and treatment recommendations</li>
            </ol>
            
            <h2>Technology</h2>
            <p>
              shrubAI uses Google's Gemini 2.0 API for plant identification and analysis.
              The application is built with React, TypeScript, and Tailwind CSS.
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
