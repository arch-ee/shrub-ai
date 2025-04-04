
export interface DeepSeekMessage {
  role: 'system' | 'user' | 'assistant';
  content: string | DeepSeekContent[];
}

export interface DeepSeekContent {
  type: 'text' | 'image_url';
  text?: string;
  image_url?: {
    url: string;
  };
}

export interface DeepSeekResponse {
  id: string;
  model: string;
  created: number;
  choices: Array<{
    index: number;
    message: DeepSeekMessage;
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Process an image URL to ensure it's in a format DeepSeek can handle
 * DeepSeek only accepts certain image formats and may have size limitations
 */
export const processImageUrl = (imageUrl: string): string => {
  // If the image is a data URL, ensure it's properly formatted
  if (imageUrl.startsWith('data:')) {
    // Extract the base64 part without the data:image prefix
    const base64Data = imageUrl.split(',')[1];
    if (base64Data) {
      // Return just the base64 data for DeepSeek API
      return base64Data;
    }
  }
  return imageUrl;
}

export const sendMessageToDeepSeek = async (
  messages: DeepSeekMessage[],
  apiKey: string
): Promise<string> => {
  try {
    // Process messages to ensure proper format for API
    const processedMessages = messages.map(msg => {
      if (typeof msg.content === 'string') {
        return msg;
      }
      
      // Process content array - this is where the fix is needed
      return {
        ...msg,
        content: msg.content.map(item => {
          if (item.type === 'image_url' && item.image_url) {
            // For DeepSeek, we need to handle base64 images differently
            const processedUrl = processImageUrl(item.image_url.url);
            
            // If it's a data URL that we processed to base64
            if (item.image_url.url.startsWith('data:') && !processedUrl.startsWith('data:')) {
              return {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${processedUrl}`
                }
              };
            }
            
            return {
              type: 'image_url',
              image_url: {
                url: processedUrl
              }
            };
          }
          return item;
        })
      };
    });
    
    console.log('Sending messages to DeepSeek:', JSON.stringify(processedMessages).substring(0, 200) + '...');

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-v2',
        messages: processedMessages,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('DeepSeek API Error Status:', response.status);
      console.error('DeepSeek API Error Details:', errorData);
      throw new Error(`DeepSeek API Error: ${response.status} - ${errorData}`);
    }

    const data: DeepSeekResponse = await response.json();
    return data.choices[0].message.content as string;
  } catch (error) {
    console.error('Error calling DeepSeek API:', error);
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
