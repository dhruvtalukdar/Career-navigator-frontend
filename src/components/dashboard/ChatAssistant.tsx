import { useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  actions?: { label: string; variant?: 'primary' | 'outline' }[];
}

const ChatAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const messages: Message[] = [
    {
      id: '1',
      type: 'user',
      content: 'Based on my current profile, are there any interesting career paths that I might be a good fit for?'
    },
    {
      id: '2',
      type: 'assistant',
      content: "That's a great question! After analyzing your profile, one path stands out:",
      actions: [
        { label: 'View Job Portal', variant: 'primary' },
        { label: 'Go to MyLearning Hub', variant: 'outline' },
        { label: 'Show Required Skills', variant: 'outline' }
      ]
    }
  ];

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg flex items-center justify-center hover:opacity-90 transition-opacity z-40"
      >
        <MessageCircle className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-0 right-6 w-[340px] bg-white rounded-t-xl shadow-2xl z-50 flex flex-col max-h-[500px]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-primary text-primary-foreground rounded-t-xl">
        <span className="font-medium">Ask Anything!</span>
        <button 
          onClick={() => setIsOpen(false)}
          className="p-1 hover:bg-white/20 rounded transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            {message.type === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white mr-2 flex-shrink-0">
                <MessageCircle className="w-4 h-4" />
              </div>
            )}
            <div className={`max-w-[85%] ${message.type === 'user' ? 'order-1' : ''}`}>
              <div 
                className={`px-3 py-2 rounded-lg text-sm ${
                  message.type === 'user' 
                    ? 'bg-gray-100 text-foreground' 
                    : 'bg-transparent text-foreground'
                }`}
              >
                {message.content}
                {message.type === 'assistant' && (
                  <div className="mt-2">
                    <a href="#" className="text-primary font-medium hover:underline">Solutions Architect</a>
                    <p className="text-sm text-muted-foreground mt-2">
                      Your experience in Software Development and skills in Cloud Infrastructure make you a strong candidate for this type of role, which blends deep technical knowledge with customer-facing design.
                    </p>
                  </div>
                )}
              </div>
              {message.actions && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {message.actions.map((action, idx) => (
                    <Button
                      key={idx}
                      variant={action.variant === 'primary' ? 'default' : 'outline'}
                      size="sm"
                      className="text-xs h-7 px-3"
                    >
                      {action.label}
                    </Button>
                  ))}
                </div>
              )}
            </div>
            {message.type === 'user' && (
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center ml-2 flex-shrink-0 overflow-hidden">
                <span className="text-xs font-medium text-gray-600">J</span>
              </div>
            )}
          </div>
        ))}
        
        {/* Typing indicator */}
        <div className="flex items-start">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white mr-2 flex-shrink-0">
            <MessageCircle className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-1 px-3 py-2">
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>

      {/* Input */}
      <div className="p-3 border-t border-border">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="..."
            className="flex-1 px-3 py-2 text-sm bg-gray-50 rounded-lg border border-border focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <button className="p-2 text-muted-foreground hover:text-primary transition-colors">
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatAssistant;
