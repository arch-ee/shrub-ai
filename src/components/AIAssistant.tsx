
import React, { useState, useRef, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { X, Send, Leaf, Image, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { sendMessageToGemini, getPlantAssistantSystemPrompt, GeminiMessage, GeminiPart, processImageUrl } from '@/services/gemini-service';
import { useIsMobile } from '@/hooks/use-mobile';

interface AIAssistantProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  apiKey: string;
  selectedImage: string | null;
}

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  image?: string;
}

const AIAssistant = ({ open, onOpenChange, apiKey, selectedImage }: AIAssistantProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUploadImage, setSelectedUploadImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isMobile = useIsMobile();

  const triggerHaptic = async (style: ImpactStyle = ImpactStyle.Medium) => {
    if (Capacitor.isNativePlatform()) {
      await Haptics.impact({ style });
    }
  };
  
  useEffect(() => {
    if (open) {
      if (messages.length === 0) {
        // Add system message on first open
        setMessages([
          {
            id: 'system-1',
            role: 'system',
            content: 'Welcome to shrubAI! Ask me any questions about plants, gardening, or upload a plant image for identification.',
            timestamp: new Date()
          }
        ]);
      }
      
      // If we have a selected image from the main screen, use it
      if (selectedImage && !selectedUploadImage) {
        setSelectedUploadImage(selectedImage);
        
        // Auto-send a message with the image
        setTimeout(() => {
          handleSendMessage("What can you tell me about this plant?", selectedImage);
        }, 500);
      }
    } else {
      // Clear the selected image when closing
      setSelectedUploadImage(null);
    }
  }, [open, selectedImage]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatMessageForGemini = (content: string, imageUrl?: string): GeminiPart[] => {
    const parts: GeminiPart[] = [];
    
    if (content) {
      parts.push({ text: content });
    }
    
    if (imageUrl) {
      const processedImage = processImageUrl(imageUrl);
      parts.push({
        inlineData: {
          mimeType: 'image/jpeg',
          data: processedImage
        }
      });
    }
    
    return parts;
  };

  const handleSendMessage = async (text?: string, imageUrl?: string) => {
    const messageContent = text || inputMessage;
    if ((!messageContent && !imageUrl && !selectedUploadImage) || isLoading) return;
    
    const userImageUrl = imageUrl || selectedUploadImage;
    triggerHaptic(ImpactStyle.Medium);
    
    const newUserMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: messageContent,
      timestamp: new Date(),
      image: userImageUrl || undefined
    };
    
    setMessages(prev => [...prev, newUserMessage]);
    setInputMessage('');
    setSelectedUploadImage(null);
    setIsLoading(true);
    
    try {
      // Convert message history to Gemini format
      const systemPrompt = getPlantAssistantSystemPrompt();
      
      const geminiMessages: GeminiMessage[] = [
        {
          role: 'user',
          parts: [{ text: systemPrompt }]
        },
        {
          role: 'user',
          parts: formatMessageForGemini(messageContent, userImageUrl || undefined)
        }
      ];
      
      const response = await sendMessageToGemini(geminiMessages, apiKey);
      
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      triggerHaptic(ImpactStyle.Light);
    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error.message}`,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
      triggerHaptic(ImpactStyle.Heavy);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedUploadImage(reader.result as string);
        triggerHaptic(ImpactStyle.Light);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClearImage = () => {
    setSelectedUploadImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    triggerHaptic(ImpactStyle.Light);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`flex flex-col ${isMobile ? 'h-[95vh] max-w-[95vw]' : 'h-[80vh] max-w-md'} p-0 gap-0 bg-white dark:bg-gray-800`}>
        <div className="flex justify-between items-center p-3 border-b dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8 bg-leaf-500/20">
              <AvatarImage src="/placeholder.svg" alt="ShrubAI" />
              <AvatarFallback className="bg-leaf-500/20 text-leaf-700 dark:text-leaf-300">
                <Leaf className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-sm font-medium dark:text-white">Plant Assistant</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">powered by Gemini</p>
            </div>
          </div>
          <Badge variant="outline" className="h-6 bg-green-500/10 text-green-600 dark:bg-green-900/20 dark:text-green-400">
            AI Chat
          </Badge>
        </div>
        
        <ScrollArea className="flex-1 p-3">
          <div className="space-y-3">
            {messages.map(message => (
              <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <Card className={`max-w-[85%] p-2.5 ${
                  message.role === 'user' 
                    ? 'bg-leaf-500 text-white' 
                    : message.role === 'system'
                    ? 'bg-cream-100 text-gray-800 dark:bg-gray-700 dark:text-cream-100'
                    : 'bg-white text-gray-800 dark:bg-gray-700 dark:text-cream-100'
                }`}>
                  {message.image && (
                    <div className="mb-2">
                      <AspectRatio ratio={16/9} className="overflow-hidden rounded-md mb-2">
                        <img src={message.image} alt="Uploaded" className="w-full h-full object-cover" />
                      </AspectRatio>
                    </div>
                  )}
                  <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                  <div className={`text-[10px] mt-1 text-right ${
                    message.role === 'user' 
                      ? 'text-white/70' 
                      : 'text-gray-400 dark:text-gray-500'
                  }`}>
                    {message.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </div>
                </Card>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <Card className="max-w-[80%] p-3 bg-white dark:bg-gray-700 dark:text-cream-100">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin text-leaf-500" />
                    <span className="text-sm">Thinking...</span>
                  </div>
                </Card>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        
        {selectedUploadImage && (
          <div className="px-3 pt-2">
            <div className="relative rounded-md overflow-hidden h-20 bg-gray-100 dark:bg-gray-700">
              <img src={selectedUploadImage} alt="To upload" className="h-full w-auto object-cover mx-auto" />
              <Button 
                variant="destructive" 
                size="icon" 
                className="absolute top-1 right-1 h-6 w-6" 
                onClick={handleClearImage}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
        
        <Separator className="my-0" />
        
        <div className="p-3 space-y-2">
          <div className="flex gap-2 items-end">
            <Textarea
              ref={textareaRef}
              placeholder="Ask about plants or gardening..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              className="min-h-[60px] resize-none dark:bg-gray-700 dark:text-white dark:border-gray-600 py-2 px-3"
            />
            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-[30px] w-[30px] dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-gray-600 flex items-center justify-center"
                onClick={() => fileInputRef.current?.click()}
              >
                <Image className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-[30px] w-[30px] bg-leaf-500 hover:bg-leaf-600 text-white dark:bg-leaf-600 dark:hover:bg-leaf-700 dark:border-leaf-700 flex items-center justify-center"
                onClick={() => handleSendMessage()}
                disabled={isLoading || (!inputMessage && !selectedUploadImage)}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageUpload}
          />
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
            You can upload images of plants for identification
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AIAssistant;
