import { GoogleGenerativeAI } from '@google/generative-ai';
import { secureAIRequest } from './aiSecurity';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
if (!apiKey) {
  console.error('VITE_GEMINI_API_KEY is not configured');
}

const genAI = new GoogleGenerativeAI(apiKey || '');

// Internal function to generate AI response (used by security wrapper)
const generateRawAIResponse = async (prompt: string): Promise<string> => {
  if (!apiKey) {
    throw new Error('API key not configured');
  }

  const model = genAI.getGenerativeModel({ model: 'gemma-3n-e2b-it' });
  const result = await model.generateContent(prompt);
  const response = await result.response;
  // console.log('Gemini raw response:', response.text());
  return response.text();
};

// Secure AI response generation with comprehensive protection
export const generateAIResponse = async (userMessage: string, cafeContext: string = '', userId?: string): Promise<string> => {
  if (!apiKey) {
    return "I'm having trouble connecting right now, but I'd love to help you with our menu! Our cappuccino is particularly popular today.";
  }

  try {
    // Use the secure AI request wrapper
    return await secureAIRequest(userMessage, cafeContext, generateRawAIResponse, userId);
  } catch (error) {
    console.error('Error generating AI response:', error);
    return "I'm having trouble connecting right now, but I'd love to help you with our menu! Our cappuccino is particularly popular today.";
  }
};