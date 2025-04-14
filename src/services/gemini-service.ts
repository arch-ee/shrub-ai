
export interface GeminiMessage {
  role: 'user' | 'model';
  parts: GeminiPart[];
}

export interface GeminiPart {
  text?: string;
  inlineData?: {
    mimeType: string;
    data: string;
  };
}

export interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
    finishReason: string;
  }>;
  promptFeedback?: {
    blockReason?: string;
  };
}

/**
 * Process an image URL to ensure it's in a format Gemini can handle
 */
export const processImageUrl = (imageUrl: string): string => {
  // If the image is a data URL, ensure it's properly formatted
  if (imageUrl.startsWith('data:')) {
    // Extract the base64 part without the data:image prefix
    const base64Data = imageUrl.split(',')[1];
    if (base64Data) {
      return base64Data;
    }
  }
  return imageUrl;
};

export const sendMessageToGemini = async (
  messages: GeminiMessage[],
  apiKey: string
): Promise<string> => {
  try {
    // For Gemini, we need to convert the conversation history to their format
    // The last message is what we'll send as the actual request
    const lastMessage = messages[messages.length - 1];
    
    // Build the request body parts from the last message
    const parts = lastMessage.parts.map(part => {
      if (part.inlineData) {
        return {
          inline_data: {
            mime_type: part.inlineData.mimeType,
            data: part.inlineData.data
          }
        };
      }
      return { text: part.text };
    });
    
    // Find system message (first message with specific content)
    const systemPrompt = getPlantAssistantSystemPrompt();
    
    // Prepare the request body with correct role structure
    const requestBody: any = {
      contents: [
        {
          role: "user",
          parts: [{ text: systemPrompt }]
        },
        {
          role: "user",
          parts: parts
        }
      ],
      generationConfig: {
        temperature: 0.2,
        topK: 32,
        topP: 1,
        maxOutputTokens: 1024,
      }
    };
    
    console.log('Sending messages to Gemini:', JSON.stringify(requestBody).substring(0, 200) + '...');

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Gemini API Error Status:', response.status);
      console.error('Gemini API Error Details:', errorData);
      throw new Error(`Gemini API Error: ${response.status} - ${errorData}`);
    }

    const data: GeminiResponse = await response.json();
    
    if (data.promptFeedback?.blockReason) {
      return `Sorry, this request was blocked by Gemini: ${data.promptFeedback.blockReason}`;
    }
    
    if (!data.candidates || data.candidates.length === 0) {
      return "Sorry, Gemini didn't provide a response. Please try again.";
    }
    
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return `Sorry, I encountered an error: ${error.message}`;
  }
};

export const getPlantAssistantSystemPrompt = (): string => {
  return `You are shrubAI, a fun plant helper for 10-year-old kids who love plants and nature!
  
Your job is to:
- Help identify plants from pictures
- Share cool plant facts that kids would find interesting
- Give super easy plant care tips (like when to water and how much sun)
- Tell kids if plants are safe to touch or definitely NOT safe (in a friendly way)
- Suggest fun plant projects kids can do with grown-up help

ALWAYS write like you're talking to a 10-year-old child. Use:
- Short, simple sentences
- Words that kids understand
- Fun comparisons (like "this plant drinks water like you drink juice on a hot day!")
- Excited language with some (but not too many) exclamation points!
- Emoji characters sometimes to make it fun 🌱🌻

When looking at plant pictures:
- Tell the plant's name in a simple way
- Say if the plant looks healthy or needs help
- Share 1-2 super cool facts about the plant
- Always, always, ALWAYS warn if a plant is not safe to touch or eat

IMPORTANT: Always include a reminder that kids should NEVER touch or taste plants without a grown-up's permission. Plants can be tricky - some look friendly but aren't!`;
};
