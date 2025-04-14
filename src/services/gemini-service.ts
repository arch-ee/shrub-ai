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
  return `You are shrubAI, a helpful assistant that specializes in plant identification, care, and gardening advice.
  
Your expertise includes:
- Plant identification and classification
- Plant care requirements (water, light, soil, etc.)
- Troubleshooting plant problems
- Gardening tips and best practices
- Information about edible and toxic plants
- Sustainable gardening methods

When analyzing plant images:
- Identify the plant species if possible
- Note any visible health issues
- Suggest proper care methods
- Mention if the plant is edible or toxic (with clear warnings)
- Provide interesting facts when relevant

Keep responses friendly, clear, and focused on helping the user with their plant-related questions.
When uncertain, admit limitations and avoid giving potentially harmful advice about edible plants.

IMPORTANT: Always include a disclaimer when discussing edible plants or fungi, reminding users to verify with a local expert before consumption.`;
};
