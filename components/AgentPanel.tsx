import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, AgentAction } from '../types';
import { startChat, sendMessageStream } from '../services/geminiService';
import { Chat } from '@google/genai';
import { SendIcon } from './icons/SendIcon';
import { PlusIcon } from './icons/PlusIcon';
import { mockAssets } from '../data/assets';
import { ArrowRightIcon } from './icons/ArrowRightIcon';

const SparkleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
        <path fillRule="evenodd" d="M10.868 2.884c.321-.772 1.415-.772 1.736 0l1.681 4.06c.064.155.19.284.348.348l4.06 1.681c.772.321.772 1.415 0 1.736l-4.06 1.681c-.158.064-.284.19-.348.348l-1.681 4.06c-.321.772-1.415.772-1.736 0l-1.681-4.06c-.064-.155-.19-.284-.348-.348l-4.06-1.681c-.772-.321-.772-1.415 0-1.736l4.06-1.681c.158.064.284.19.348.348l1.681-4.06z" clipRule="evenodd" />
    </svg>
);
const SuggestionIcon: React.FC<{ type: 'summarize' | 'list' | 'latency' }> = ({ type }) => {
    const paths = {
        summarize: <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />,
        list: <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h7.5M8.25 12h7.5m-7.5 5.25h7.5m-9-3 .75 .75 2.25-2.25M3 12l.75.75 2.25-2.25m-3 6 .75 .75 2.25-2.25" />,
        latency: <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.28m5.94 2.28L19.5 21M12 2.25v2.25m0 15v2.25M4.5 12H2.25m19.5 0h-2.25" />
    };
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            {paths[type]}
        </svg>
    )
};

const MessageContent: React.FC<{ text: string }> = ({ text }) => {
    const parts = text.split('---');
    if (parts.length === 3 && parts[1].trim().startsWith('Workflow Plan')) {
        return (
            <>
                <p className="mb-2">Here is the generated workflow plan:</p>
                <pre className="whitespace-pre-wrap bg-gray-800 text-white font-mono text-xs p-3 rounded-md overflow-x-auto">
                    <code>{parts[1].trim()}</code>
                </pre>
            </>
        );
    }
    return <>{text}</>;
};


interface AgentPanelProps {
  onAgentAction: (action: AgentAction) => void;
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
}

const AgentPanel: React.FC<AgentPanelProps> = ({ onAgentAction, messages, setMessages }) => {
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [chat, setChat] = useState<Chat | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [showChat, setShowChat] = useState(false);
  
  useEffect(() => {
    if (messages.length > 0 && !showChat) {
      setShowChat(true);
    }
  }, [messages, showChat]);

  useEffect(() => {
    const assetList = mockAssets.map(a => `'${a.name}'`).join(', ');
    const systemInstruction = `You are an expert workflow assistant for the "Flower Asset Hub". The user can see a list of assets.
Available assets: ${assetList}.
When a user describes a workflow they want to create, your primary goal is to suggest a list of relevant stages from the available assets.
You MUST respond with a single, valid JSON object and nothing else. This object must have a 'response' key with your text for the user, and an 'action' key to highlight the suggested assets in the UI. The 'assetNames' field in the action should be an array of strings.
Example User Query: "I want to submit a CL and then update its description."
Example JSON Response:
{
  "response": "Great idea. For that, I'd suggest using the 'SUBMIT_CHANGELIST' and 'UPDATE_DESCRIPTION' stages. I've highlighted them for you.",
  "action": { "type": "highlight_asset", "assetNames": ["SUBMIT_CHANGELIST", "UPDATE_DESCRIPTION"] }
}
For any other conversational questions, just respond with plain text.`;
    
    const newChat = startChat(systemInstruction);
    setChat(newChat);
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (messages.length === 1 && messages[0].sender === 'user' && !isGenerating) {
        const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
        handleSendMessage(fakeEvent, messages[0].text);
    }
  }, [messages, isGenerating]);

  const handleSendMessage = async (e: React.FormEvent, messageText?: string) => {
    e.preventDefault();
    const currentInput = messageText || input;
    if (!currentInput.trim() || isGenerating || !chat) return;
    if (!showChat) setShowChat(true);

    const userMessage: ChatMessage = { id: Date.now().toString(), sender: 'user', text: currentInput };
    if(!messageText) { // Avoid duplicating message from intent modal
        setMessages(prev => [...prev, userMessage]);
    }
    setInput('');
    setIsGenerating(true);

    const agentMessageId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: agentMessageId, sender: 'agent', text: '', isGenerating: true }]);

    try {
      const stream = await sendMessageStream(chat, currentInput);
      let agentResponse = '';
      for await (const chunk of stream) {
        agentResponse += chunk.text;
      }

      let displayText = agentResponse;
      try {
        const cleanedResponse = agentResponse.replace(/```json|```/g, '').trim();
        const parsed = JSON.parse(cleanedResponse);
        if (parsed.response && parsed.action) {
          displayText = parsed.response;
          if (parsed.action.type === 'highlight_asset' && Array.isArray(parsed.action.assetNames)) {
            onAgentAction(parsed.action);
          }
        }
      } catch (e) { /* Not a JSON response */ }

      setMessages(prev => prev.map(msg => 
        msg.id === agentMessageId ? { ...msg, text: displayText, isGenerating: false } : msg
      ));
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages(prev => prev.map(msg => 
        msg.id === agentMessageId ? { ...msg, text: "Sorry, I encountered an error.", isGenerating: false } : msg
      ));
    } finally {
      setIsGenerating(false);
    }
  };
  
  const SuggestionChip: React.FC<{text: string; detail:string; iconType: 'summarize'|'list'|'latency'}> = ({text, detail, iconType}) => (
      <button 
        onClick={(e) => handleSendMessage(e, text)}
        className="w-full flex items-center gap-4 p-3 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors text-left"
      >
          <SuggestionIcon type={iconType} />
          <div>
              <p className="font-semibold text-sm text-slate-800">{text}</p>
              <p className="text-xs text-gray-500">{detail}</p>
          </div>
      </button>
  );

  return (
    <aside className="w-[380px] flex-shrink-0 flex flex-col border-l bg-white">
      <div className="flex-shrink-0 p-4 border-b flex justify-between items-center">
        <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <SparkleIcon className="w-5 h-5 text-slate-700"/>
            AI agent
        </h3>
      </div>
      
      <div ref={chatContainerRef} className="flex-1 p-4 overflow-y-auto">
        {!showChat ? (
             <div className="text-left">
                <p className="text-lg text-slate-600">Hello, there</p>
                <h1 className="text-2xl font-bold text-slate-900 mt-1">How can I help you today?</h1>

                <div className="mt-6 space-y-3">
                    <SuggestionChip text="Find the buganizer stage" detail="and highlight it for me" iconType="list" />
                    <SuggestionChip text="What's the difference between CODEMAKER and SUBMIT_CHANGELIST?" detail="in more detail" iconType="summarize" />
                    <SuggestionChip text="Show me all CI/CD stages" detail="from the asset list" iconType="latency" />
                </div>
                <button className="text-sm font-medium text-blue-600 hover:underline mt-4 flex items-center gap-1">
                    <span>More suggestions</span>
                    <ArrowRightIcon className="h-4 w-4"/>
                </button>
            </div>
        ) : (
            <div className="space-y-4">
            {messages.map((message) => (
            <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`rounded-lg px-4 py-2 max-w-xs lg:max-w-md ${message.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-slate-800'}`}>
                <MessageContent text={message.text} />
                {message.isGenerating && !message.text && (
                    <div className="flex items-center justify-center p-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s] mx-1"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    </div>
                )}
                </div>
            </div>
            ))}
            </div>
        )}
      </div>

      <div className="border-t p-4 flex-shrink-0">
        <form onSubmit={handleSendMessage} className="relative">
          <textarea
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(e); } }}
            placeholder="Enter a prompt here"
            className="w-full resize-none rounded-lg border bg-white border-gray-300 text-slate-800 placeholder-gray-400 py-3 pl-12 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isGenerating}
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center">
            <button type="button" className="text-gray-400 hover:text-gray-600">
              <PlusIcon className="h-6 w-6"/>
            </button>
          </div>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
             <button 
              type="submit" 
              className="bg-gray-800 text-white rounded-full h-8 w-8 flex items-center justify-center hover:bg-gray-900 disabled:bg-gray-300"
              disabled={!input.trim() || isGenerating}
            >
              <SendIcon className="h-4 w-4" />
            </button>
          </div>
        </form>
         <p className="text-xs text-gray-400 mt-2 text-center">AI may display inaccurate information. <a href="#" className="underline">Learn more</a></p>
      </div>
    </aside>
  );
};

export default AgentPanel;