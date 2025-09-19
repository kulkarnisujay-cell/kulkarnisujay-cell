import { GoogleGenAI, Chat } from "@google/genai";

// Fix: Implement Gemini service functions to resolve import errors and provide core AI functionality.
// This file was missing, causing 'is not a module' errors.

// Fix: Initialize GoogleGenAI with the API key from environment variables.
// Adheres to the guideline of using new GoogleGenAI({apiKey: process.env.API_KEY}).
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

/**
 * Starts a new chat session with a system instruction.
 * @param systemInstruction The system instruction for the chat model.
 * @returns A Chat object.
 */
export const startChat = (systemInstruction: string): Chat => {
  // Fix: Use the correct model 'gemini-2.5-flash' and create a chat session.
  // This function sets up the conversational AI with a predefined context.
  const chat = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction,
    },
  });
  return chat;
};

/**
 * Sends a message to the chat and gets a streaming response.
 * @param chat The chat session object.
 * @param message The user's message.
 * @returns An async iterator for the streaming response.
 */
export const sendMessageStream = async (chat: Chat, message: string) => {
  // Fix: Use chat.sendMessageStream for streaming responses.
  // This is the correct method for handling real-time, chunked responses from the model.
  const response = await chat.sendMessageStream({ message });
  return response;
};