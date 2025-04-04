
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Camera, Image, Send, Loader2, Info, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { 
  DeepSeekMessage, 
  DeepSeekContent, 
  sendMessageToDeepSeek, 
  getPlantAssistantSystemPrompt 
} from '@/services/deepseek-service';

interface AIAssistantProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  apiKey: string;
  selectedImage?: string | null;
}

interface ChatMessage {
  id: string;
  role: 'system' | 'user' | 'assistant';
  content: string | DeepSeekContent[];
  isPending?: boolean;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ 
  open, 
  onOpenChange, 
  apiKey,
  selectedImage
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [imageUpload, setImageUpload] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Initialize with system message when component mounts
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'system-1',
          role: 'system',
          content: getPlantAssistantSystemPrompt()
        }
      ]);
    }
  }, [messages.length]);

  // Add initial image from plant identifier if available
  useEffect(() => {
    if (selectedImage && open) {
      handleImageUpload(selectedImage);
      handleSend("What can you tell me about this plant?");
    }
  }, [selectedImage, open]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const triggerHaptic = async (style: ImpactStyle = ImpactStyle.Light) => {
    if (Capacitor.isNativePlatform()) {
      await Haptics.impact({ style });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Image = reader.result as string;
        handleImageUpload(base64Image);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = (base64Image: string) => {
    setImageUpload(base64Image);
    triggerHaptic();
    toast({
      title: "Image uploaded",
      description: "You can now ask questions about this image."
    });
  };

  const handleSend = async (textOverride?: string) => {
    const messageText = textOverride || input;
    if ((!messageText || messageText.trim() === '') && !imageUpload) return;

    triggerHaptic();
    const messageId = `msg-${Date.now()}`;
    let newUserMessage: ChatMessage;

    // Create message content based on whether we have an image
    if (imageUpload) {
      newUserMessage = {
        id: messageId,
        role: 'user',
        content: [
          { 
            type: 'image_url', 
            image_url: { url: imageUpload }
          },
          { 
            type: 'text', 
            text: messageText 
          }
        ]
      };
      setImageUpload(null); // Clear the image after sending
    } else {
      newUserMessage = {
        id: messageId,
        role: 'user',
        content: messageText
      };
    }

    // Create a pending message for the assistant
    const pendingAssistantMessage: ChatMessage = {
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      content: '...',
      isPending: true
    };

    // Add the user message and pending assistant message
    setMessages(prev => [...prev, newUserMessage, pendingAssistantMessage]);
    setInput(''); // Clear input field
    setIsLoading(true);

    try {
      // Format messages for the API
      const apiMessages: DeepSeekMessage[] = messages
        .filter(msg => !msg.isPending)
        .map(msg => ({
          role: msg.role,
          content: msg.content
        })) as DeepSeekMessage[];

      // Add the new user message
      apiMessages.push({
        role: 'user',
        content: newUserMessage.content
      });

      console.log('Sending to DeepSeek:', JSON.stringify(apiMessages).substring(0, 200) + '...');

      // Send to DeepSeek API
      const response = await sendMessageToDeepSeek(apiMessages, apiKey);

      // Update messages with the assistant's response
      setMessages(prev => 
        prev.map(msg => 
          msg.id === pendingAssistantMessage.id
            ? { ...msg, content: response, isPending: false }
            : msg
        )
      );
      triggerHaptic(ImpactStyle.Medium);
    } catch (error) {
      console.error('Error in AI Assistant:', error);
      
      // Update the pending message with the error
      setMessages(prev => 
        prev.map(msg => 
          msg.id === pendingAssistantMessage.id
            ? { 
                ...msg, 
                content: "Sorry, I encountered an error processing your request. Please try again.", 
                isPending: false 
              }
            : msg
        )
      );
      
      toast({
        title: "Error",
        description: "Failed to get a response from the AI assistant.",
        variant: "destructive"
      });
      triggerHaptic(ImpactStyle.Heavy);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCameraCapture = () => {
    // Delegate to the file input
    fileInputRef.current?.click();
  };

  const renderMessageContent = (message: ChatMessage) => {
    if (typeof message.content === 'string') {
      return <p className="whitespace-pre-wrap">{message.content}</p>;
    }
    
    // For content arrays (messages with images)
    return (
      <div>
        {(message.content as DeepSeekContent[]).map((content, index) => {
          if (content.type === 'image_url') {
            return (
              <div key={`img-${index}`} className="mb-2">
                <img 
                  src={content.image_url?.url} 
                  alt="Uploaded"
                  className="rounded-md max-h-48 object-contain"
                />
              </div>
            );
          } else if (content.type === 'text' && content.text) {
            return <p key={`text-${index}`} className="whitespace-pre-wrap">{content.text}</p>;
          }
          return null;
        })}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh] flex flex-col h-[600px] sm:h-[600px]">
        <DialogHeader>
          <DialogTitle>shrubAI Assistant</DialogTitle>
          <DialogDescription>
            Ask me about plants, gardening, or upload a photo for identification
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="flex-grow pr-4 mb-4">
          <div className="space-y-4">
            {messages.filter(msg => msg.role !== 'system').map((message) => (
              <div 
                key={message.id} 
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.role === 'user' 
                      ? 'bg-leaf-500 text-white' 
                      : 'bg-cream-50 dark:bg-gray-800 text-leaf-800 dark:text-cream-100'
                  }`}
                >
                  {message.isPending ? (
                    <div className="flex items-center">
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      <span>Thinking...</span>
                    </div>
                  ) : (
                    renderMessageContent(message)
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        
        {imageUpload && (
          <div className="relative mb-2">
            <div className="p-2 bg-cream-50 dark:bg-gray-800 rounded-md">
              <img 
                src={imageUpload} 
                alt="To send" 
                className="h-16 object-contain rounded mx-auto"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-0 right-0"
                onClick={() => setImageUpload(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
        
        <div className="flex gap-2">
          <Button 
            variant="outline"
            size="icon"
            onClick={handleCameraCapture}
            disabled={isLoading}
          >
            <Camera className="h-4 w-4" />
            <span className="sr-only">Upload Image</span>
          </Button>
          
          <Button 
            variant="outline"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
          >
            <Image className="h-4 w-4" />
            <span className="sr-only">Upload Image</span>
          </Button>
          
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />
          
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 min-h-10 h-10 max-h-32"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          
          <Button 
            onClick={() => handleSend()}
            disabled={isLoading || (!input && !imageUpload)}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            <span className="sr-only">Send</span>
          </Button>
        </div>
        
        <div className="text-xs text-gray-500 mt-2 flex items-center">
          <Info className="w-3 h-3 mr-1" />
          <span>Powered by DeepSeek AI</span>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AIAssistant;
