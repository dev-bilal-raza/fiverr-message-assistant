import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Bot,
  ClipboardCopy,
  Send,
  Wand2,
  X,
  Sparkles,
  Copy,
  CheckCheck,
  ChevronDown
} from 'lucide-react';
import OpenAI from 'openai';

import { Input } from '@/components/ui/input';
import { SYSTEM_PROMPT } from '@/constants/prompt';
import { cn } from '@/lib/utils';

// Define TypeScript interfaces (keep existing interfaces)
interface MessageType {
  value: string;
  label: string;
  icon: string;
  prompt: string;
}

interface ChatMessage {
  role: 'user' | 'assistant' | 'suggestion';
  message: string;
  type: 'text' | 'markdown';
  assistantResponse?: {
    feedback?: string;
    messageRewrite?: string;
    suggestions?: string[];
    communicationTips?: string[];
    originalInput?: string;
  };
}

interface OpenAIResponse {
  output: {
    messageRewrite?: string;
    suggestions?: string[];
    communicationTips?: string[];
    inputSuggestions?: string[];
  };
}

const MESSAGE_TYPES: MessageType[] = [
  {
    value: 'professional-inquiry',
    label: 'Professional Inquiry',
    icon: '💼',
    prompt: 'Generate professional suggestions for initial project communication'
  },
  {
    value: 'project-clarification',
    label: 'Project Clarification',
    icon: '❓',
    prompt: 'Generate suggestions for asking about project requirements'
  },
  {
    value: 'price-negotiation',
    label: 'Price Negotiation',
    icon: '💰',
    prompt: 'Generate diplomatic suggestions for discussing project pricing'
  },
  {
    value: 'deadline-extension',
    label: 'Deadline Extension',
    icon: '⏰',
    prompt: 'Generate courteous suggestions for requesting deadline extension'
  },
  {
    value: 'revision-request',
    label: 'Revision Request',
    icon: '✏️',
    prompt: 'Generate polite suggestions for requesting project revisions'
  }
];

const FiverrMessageAssistant: React.FC<{isExpanded: boolean, setIsExpanded: React.Dispatch<React.SetStateAction<boolean>>}> = ({isExpanded, setIsExpanded}) => {
  const [value, setValue] = useState<string>('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [currentContext, setCurrentContext] = useState<string[]>([]);
  const [messageType, setMessageType] = useState<string>('professional-inquiry');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [suggestionLoading, setSuggestionLoading] = useState<boolean>(false);
  const [copiedMessageIndex, setCopiedMessageIndex] = useState<number | null>(null);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const chatBoxRef = useRef<HTMLDivElement>(null);

  const extractCurrentConversation = () => {
    // Adjust selector based on your actual Fiverr message page structure
    const messageWrappers = Array.from(document.querySelectorAll('.message-wrapper'));
    const messages = messageWrappers.map(wrapper => {
      const messageElement = wrapper.querySelector('.message-body');
      return messageElement ? messageElement.textContent?.trim() || '' : '';
    });
    setCurrentContext(messages);
  };

  const generateSuggestions = async (type: string) => {
    try {
      setSuggestionLoading(true);

      // Fetch API key from Chrome storage (adjust if using a different storage method)
      const storageResult = await chrome.storage.local.get('apiKey');
      const apiKey = storageResult.apiKey;

      if (!apiKey) {
        alert('OpenAI API Key is required');
        return;
      }

      const openai = new OpenAI({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true,
      });

      const selectedTypeData = MESSAGE_TYPES.find(t => t.value === type);

      if (!selectedTypeData) {
        throw new Error('Invalid message type');
      }

      const systemPromptModified = SYSTEM_PROMPT.replace(
        '{{current_message_context}}',
        currentContext.join('\n')
      );

      const apiResponse = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemPromptModified },
          {
            role: 'user',
            content: `Generate detailed communication suggestions for: ${selectedTypeData.prompt}. 
            Provide at least 5 specific, actionable suggestions.
            Current conversation context: ${currentContext.join('\n')}`
          },
        ],
      });

      const responseContent = apiResponse.choices[0].message.content;

      if (responseContent) {
        try {
          const result = JSON.parse(responseContent) as { output: OpenAIResponse };

          if (result.output?.suggestions) {
            setChatHistory((prev) => [
              ...prev,
              {
                role: 'suggestion',
                message: 'Suggestions for ' + selectedTypeData.label,
                type: 'markdown',
                assistantResponse: {
                  feedback: `Suggestions for ${selectedTypeData.label}`,
                  suggestions: result.output.suggestions,
                  communicationTips: result.output.communicationTips || []
                },
              },
            ]);

            chatBoxRef.current?.scrollIntoView({ behavior: 'smooth' });
          }
        } catch (parseError) {
          console.error('Error parsing API response:', parseError);
          alert('Failed to parse generated suggestions.');
        }
      }
    } catch (error) {
      console.error('Error generating suggestions:', error);
      alert('Failed to generate suggestions. Please try again.');
    } finally {
      setSuggestionLoading(false);
    }
  };

  const handleGenerateMessage = async (type?: string, inputText?: string) => {
    try {
      setIsLoading(true);

      // Fetch API key from Chrome storage (adjust if using a different storage method)
      const storageResult = await chrome.storage.local.get('apiKey');
      const apiKey = storageResult.apiKey;

      if (!apiKey) {
        alert('OpenAI API Key is required');
        return;
      }

      const openai = new OpenAI({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true,
      });

      const selectedType = type || messageType;
      const selectedTypeData = MESSAGE_TYPES.find(t => t.value === selectedType);

      if (!selectedTypeData) {
        throw new Error('Invalid message type');
      }

      const systemPromptModified = SYSTEM_PROMPT.replace(
        '{{current_message_context}}',
        currentContext.join('\n')
      );

      const apiResponse = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemPromptModified },
          {
            role: 'user',
            content: `Generate a Fiverr message for: ${selectedTypeData.prompt}. 
            Current conversation context: ${currentContext.join('\n')}
            Additional context: ${inputText || value}`
          },
        ],
      });

      const responseContent = apiResponse.choices[0].message.content;

      if (responseContent) {
        try {
          const result = JSON.parse(responseContent) as { output: OpenAIResponse };

          if (result.output) {
            setChatHistory((prev) => [
              ...prev,
              {
                message: 'NA',
                role: 'assistant',
                type: 'markdown',
                assistantResponse: {
                  feedback: `Generated ${selectedTypeData.label} Message`,
                  messageRewrite: result.output.messageRewrite,
                  suggestions: result.output.suggestions || [],
                  communicationTips: result.output.communicationTips || []
                },
              },
            ]);

            chatBoxRef.current?.scrollIntoView({ behavior: 'smooth' });
          }
        } catch (parseError) {
          console.error('Error parsing API response:', parseError);
          alert('Failed to parse generated message.');
        }
      }
    } catch (error) {
      console.error('Error generating message:', error);
      alert('Failed to generate message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const generateInputSuggestions = async (inputText: string) => {
    try {
      setIsLoading(true);

      // Fetch API key from Chrome storage
      const storageResult = await chrome.storage.local.get('apiKey');
      const apiKey = storageResult.apiKey;

      if (!apiKey) {
        alert('OpenAI API Key is required');
        return;
      }

      const openai = new OpenAI({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true,
      });

      const systemPromptModified = SYSTEM_PROMPT.replace(
        '{{current_message_context}}',
        currentContext.join('\n')
      );

      const apiResponse = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemPromptModified },
          {
            role: 'user',
            content: `Analyze the following message and provide improvement suggestions:
            Message: ${inputText}
            
            Provide suggestions to:
            1. Improve clarity
            2. Enhance professionalism
            3. Make the communication more effective
            4. Identify potential communication gaps`
          },
        ],
      });

      const responseContent = apiResponse.choices[0].message.content;

      if (responseContent) {
        try {
          const result = JSON.parse(responseContent) as { output: OpenAIResponse };

          if (result.output?.inputSuggestions) {
            setChatHistory((prev) => [
              ...prev,
              {
                role: 'suggestion',
                message: 'Input Message Suggestions',
                type: 'markdown',
                assistantResponse: {
                  feedback: 'Message Input Analysis',
                  originalInput: inputText,
                  suggestions: result.output.inputSuggestions,
                  communicationTips: result.output.communicationTips || []
                },
              },
            ]);

            chatBoxRef.current?.scrollIntoView({ behavior: 'smooth' });
          }
        } catch (parseError) {
          console.error('Error parsing API response:', parseError);
          alert('Failed to parse generated suggestions.');
        }
      }
    } catch (error) {
      console.error('Error generating input suggestions:', error);
      alert('Failed to generate input suggestions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyMessage = (message: string, index: number) => {
    navigator.clipboard.writeText(message).then(() => {
      setCopiedMessageIndex(index);
      setTimeout(() => setCopiedMessageIndex(null), 2000); // Reset after 2 seconds
    });
  };

  const onSendMessage = () => {
    if (!value.trim()) return;

    // Add user message to chat history
    setChatHistory((prev) => [
      ...prev,
      { role: 'user', message: value, type: 'text' },
    ]);

    // Generate suggestions for the input message
    generateInputSuggestions(value);

    // Optionally, generate a response message
    handleGenerateMessage(undefined, value);

    chatBoxRef.current?.scrollIntoView({ behavior: 'smooth' });
    setValue('');
  };

  useEffect(() => {
    extractCurrentConversation();
  }, []);

  return (
    <div className={cn(
      "fixed bottom-5 right-5 z-[9999] w-[450px] bg-white rounded-xl shadow-2xl border border-gray-200 transition-all duration-300 flex flex-col",
      !isExpanded && "scale-75 opacity-50",
      isMinimized && "h-16 overflow-hidden"
    )}>
      {/* Header */}
      <div className="bg-[#1DBF73] text-white p-3 rounded-t-xl flex justify-between items-center">
        <div className="flex items-center">
          <Bot className="mr-2" />
          <h3 className="font-semibold text-base text-white">Fiverr AI Message Assistant</h3>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="hover:bg-[#14a362] rounded-full p-1 mr-2"
          >
            <ChevronDown className={cn(
              "h-5 w-5 transition-transform", 
              isMinimized ? "rotate-180" : ""
            )} />
          </button>
          <button
            onClick={() => setIsExpanded(false)}
            className="hover:bg-[#14a362] rounded-full p-1"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Chat History */}
      <div className="p-4 overflow-y-auto flex-grow max-h-[350px] space-y-4">
        {chatHistory.map((message, index) => (
          <div
            key={index}
            className={cn(
              'flex flex-col gap-2 rounded-lg p-3 text-sm relative group',
              message.role === 'user'
                ? 'bg-[#F5F5F5] self-end ml-auto'
                : 'bg-[#E6F3EE]'
            )}
          >
            {/* Copy Button for Assistant Messages */}
            {(message.role === 'assistant' || message.role === 'suggestion') && (message.assistantResponse?.messageRewrite || message.assistantResponse?.originalInput) && (
              <button
                onClick={() => handleCopyMessage(
                  message.assistantResponse?.messageRewrite ||
                  message.assistantResponse?.originalInput ||
                  '',
                  index
                )}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                {copiedMessageIndex === index ? (
                  <CheckCheck className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4 text-gray-500 hover:text-gray-700" />
                )}
              </button>
            )}

            {/* Message Content */}
            {(message.role === 'assistant' || message.role === 'suggestion') && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Bot className="h-4 w-4 text-[#1DBF73]" />
                  <p className="font-semibold text-sm text-[#1DBF73]">
                    {message.assistantResponse?.feedback}
                  </p>
                </div>

                {/* Original Input for Suggestion */}
                {message.assistantResponse?.originalInput && (
                  <div className="bg-white p-2 rounded-md border border-gray-200">
                    <h4 className="font-medium mb-1 text-sm text-gray-900">Original Input:</h4>
                    <p className="text-sm text-gray-800 italic ml-3">
                      "{message.assistantResponse.originalInput}"
                    </p>
                  </div>
                )}

                {/* Suggestions Section */}
                {message.assistantResponse?.suggestions &&
                  message.assistantResponse.suggestions.length > 0 && (
                    <div className="bg-white p-2 rounded-md border border-gray-200">
                      <h4 className="font-medium mb-1 text-sm text-gray-900">Suggestions:</h4>
                      <ul className="list-disc list-inside text-sm space-y-1 text-gray-800 ml-3">
                        {message.assistantResponse.suggestions.map((suggestion, idx) => (
                          <li key={idx} className="mb-1">{suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                {/* Message Rewrite (if available) */}
                {message.assistantResponse?.messageRewrite && (
                  <div className="bg-white p-2 rounded-md border border-gray-200">
                    <h4 className="font-medium mb-1 text-sm text-gray-900">Suggested Message:</h4>
                    <p className="text-sm text-gray-800 ml-3">
                      {message.assistantResponse.messageRewrite}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* User Message */}
            {message.role === 'user' && (
              <p className="text-sm">{message.message}</p>
            )}
          </div>
        ))}
        <div ref={chatBoxRef} />
      </div>

      {/* Input Section */}
      <div className="p-3 border-t border-gray-200">
        {/* Message Type Buttons */}
        <div className="grid grid-cols-2 space-x-1 mb-2">
          {MESSAGE_TYPES.map((type) => (
            <Button
              key={type.value}
              variant={messageType === type.value ? 'default' : 'outline'}
              className={cn(
                'text-sm p-2 py-1.5 h-auto mb-1 flex items-center',
                messageType === type.value
                  ? 'bg-[#1DBF73] hover:bg-[#14a362] text-white font-medium'
                  : 'border-2 border-black text-gray-600 bg-gray-200 hover:bg-gray-300 hover:text-black'
              )}
              onClick={() => {
                setMessageType(type.value);
                generateSuggestions(type.value);
              }}
              disabled={suggestionLoading}
            >
              <span className="mr-1 text-sm">{type.icon}</span>
              <span className="truncate">{type.label}</span>
              {suggestionLoading && messageType === type.value && (
                <Sparkles className="ml-1 h-3 w-3 animate-pulse" />
              )}
            </Button>
          ))}
        </div>

        {/* Input and Generate Button */}
        <div className="flex space-x-2">
          <Input
            placeholder="Type your message or get suggestions..."
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="flex-1 h-8 text-xs"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !isLoading) {
                onSendMessage();
              }
            }}
          />
          <Button
            onClick={onSendMessage}
            disabled={value.length === 0 || isLoading}
            className="bg-[#1DBF73] hover:bg-[#14a362] h-8 p-2 py-1.5 text-white font-medium"
          >
            {isLoading ? 'Generating...' : <><Wand2 className="mr-1 h-4 w-4" /> Generate</>}
          </Button>
        </div>
      </div>
    </div>
  );
};

const ContentPage: React.FC = () => {
  const [chatboxExpanded, setChatboxExpanded] = React.useState(false)

  return (
    <div className="__chat-container dark z-50 w-full">
      {chatboxExpanded && <FiverrMessageAssistant isExpanded={chatboxExpanded} setIsExpanded={setChatboxExpanded}/>}
      <div className='fixed bottom-5 right-5'>
        <Button 
          className='bg-[#1DBF73] hover:bg-[#14a362] text-white font-medium' 
          onClick={() => setChatboxExpanded(!chatboxExpanded)}
        >
          <Bot />
          Message AI
        </Button>
      </div>
    </div>
  )
}

export default ContentPage