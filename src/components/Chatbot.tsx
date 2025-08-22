import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Search, ChevronDown, ChevronUp } from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  keywords: string[];
}

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showFAQs, setShowFAQs] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const categories = [
    { id: 'all', name: 'All Topics' },
    { id: 'getting-started', name: 'Getting Started' },
    { id: 'dashboard', name: 'Dashboard' },
    { id: 'learning', name: 'Learning' },
    { id: 'marketplace', name: 'Marketplace' },
    { id: 'mentorship', name: 'Mentorship' },
    { id: 'analytics', name: 'Analytics' },
    { id: 'account', name: 'Account' }
  ];

  const faqs: FAQ[] = [
    {
      id: '1',
      question: 'How do I get started with BizBoost Hub?',
      answer: 'Welcome to BizBoost Hub! Start by completing your profile, then explore the Learning Modules to build essential business skills. Check out the Quick Actions on your dashboard for guided next steps.',
      category: 'getting-started',
      keywords: ['start', 'begin', 'new', 'first', 'setup']
    },
    {
      id: '2',
      question: 'What are XP points and how do I earn them?',
      answer: 'XP (Experience Points) are rewards you earn by completing activities like learning modules, marketplace listings, and community participation. Earn XP to level up and unlock new badges and features!',
      category: 'dashboard',
      keywords: ['xp', 'points', 'experience', 'level', 'badges', 'gamification']
    },
    {
      id: '3',
      question: 'How do I list my products on the marketplace?',
      answer: 'Go to the Marketplace section and click "List Product". Fill in your product details, upload photos, set your price, and select your location. Your listing will be visible to the community immediately.',
      category: 'marketplace',
      keywords: ['list', 'product', 'sell', 'marketplace', 'upload', 'photos']
    },
    {
      id: '4',
      question: 'How can I find a mentor?',
      answer: 'Visit the Mentorship Hub and browse available mentors by expertise and location. You can filter by industry, language, and availability. Click "Connect" to send a mentorship request.',
      category: 'mentorship',
      keywords: ['mentor', 'mentorship', 'connect', 'advice', 'guidance']
    },
    {
      id: '5',
      question: 'What learning modules are available?',
      answer: 'We offer modules on Business Planning, Marketing & Sales, Financial Management, Operations, and Leadership. Each module includes interactive content, videos, and practical exercises. Start with beginner modules and progress to advanced topics.',
      category: 'learning',
      keywords: ['learning', 'modules', 'courses', 'training', 'education', 'skills']
    },
    {
      id: '6',
      question: 'How do I track my business performance?',
      answer: 'Use the Analytics section to view your business metrics. Upload your financial data in the Data Input section to get AI-powered insights and recommendations for growth.',
      category: 'analytics',
      keywords: ['analytics', 'performance', 'metrics', 'data', 'insights', 'tracking']
    },
    {
      id: '7',
      question: 'Can I change my business information?',
      answer: 'Yes! Go to your Profile section to update your personal and business information. You can also change your notification preferences and security settings there.',
      category: 'account',
      keywords: ['profile', 'update', 'change', 'business', 'information', 'settings']
    },
    {
      id: '8',
      question: 'What is the Roadmap Generator?',
      answer: 'The Roadmap Generator creates a personalized growth plan for your business. Answer questions about your business type, goals, and timeline to receive a customized action plan with specific steps and milestones.',
      category: 'getting-started',
      keywords: ['roadmap', 'generator', 'plan', 'goals', 'growth', 'strategy']
    },
    {
      id: '9',
      question: 'How do I join the community discussions?',
      answer: 'Visit the Community section to participate in discussions, ask questions, and share experiences. You can filter by topics like startup advice, marketing, finance, and more. Click "New Discussion" to start your own topic.',
      category: 'getting-started',
      keywords: ['community', 'discussions', 'forum', 'questions', 'networking']
    },
    {
      id: '10',
      question: 'What business tools are available?',
      answer: 'The Toolkit section offers templates, calculators, and software trials. Download business plan templates, use ROI calculators, or try premium software with free trials. All tools are designed for South African businesses.',
      category: 'getting-started',
      keywords: ['tools', 'toolkit', 'templates', 'calculators', 'software', 'downloads']
    },
    {
      id: '11',
      question: 'How do I access expert sessions?',
      answer: 'Go to Expert Q&A to view upcoming live sessions and recorded content. Register for upcoming sessions or watch recorded sessions on topics like fundraising, marketing, and operations.',
      category: 'learning',
      keywords: ['expert', 'sessions', 'qa', 'live', 'recorded', 'webinar']
    },
    {
      id: '12',
      question: 'What funding opportunities are available?',
      answer: 'The Funding Finder section lists grants, loans, competitions, and investor opportunities. Filter by funding type, industry, and amount to find opportunities that match your business needs.',
      category: 'getting-started',
      keywords: ['funding', 'grants', 'loans', 'investors', 'money', 'capital']
    },
    {
      id: '13',
      question: 'How do I upload my business data?',
      answer: 'Use the Data Input section to upload financial data, customer information, or documents. This data helps generate AI insights and personalized recommendations for your business growth.',
      category: 'analytics',
      keywords: ['upload', 'data', 'financial', 'documents', 'ai', 'insights']
    },
    {
      id: '14',
      question: 'Can I use the platform in my local language?',
      answer: 'Yes! BizBoost Hub supports multiple South African languages including English, Afrikaans, isiZulu, isiXhosa, Sesotho, and Setswana. Change your language preference in the dashboard settings.',
      category: 'account',
      keywords: ['language', 'afrikaans', 'zulu', 'xhosa', 'sesotho', 'setswana', 'local']
    },
    {
      id: '15',
      question: 'How do I contact support?',
      answer: 'For technical support, email support@bizboost.co.za. For business advice, use the Mentorship Hub or Community discussions. You can also access help resources in each section of the platform.',
      category: 'account',
      keywords: ['support', 'help', 'contact', 'email', 'assistance', 'problem']
    }
  ];

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Add welcome message when chatbot opens for the first time
      const welcomeMessage: Message = {
        id: 'welcome',
        type: 'bot',
        content: 'Hello! I\'m here to help you navigate BizBoost Hub. You can ask me questions or browse the FAQs below. How can I assist you today?',
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, messages.length]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const findBestMatch = (query: string): FAQ | null => {
    const lowercaseQuery = query.toLowerCase();
    
    // First, try to find exact keyword matches
    const keywordMatches = faqs.filter(faq =>
      faq.keywords.some(keyword => lowercaseQuery.includes(keyword.toLowerCase()))
    );

    if (keywordMatches.length > 0) {
      return keywordMatches[0];
    }

    // Then try question text matching
    const questionMatches = faqs.filter(faq =>
      faq.question.toLowerCase().includes(lowercaseQuery) ||
      lowercaseQuery.includes(faq.question.toLowerCase())
    );

    if (questionMatches.length > 0) {
      return questionMatches[0];
    }

    // Finally try answer text matching
    const answerMatches = faqs.filter(faq =>
      faq.answer.toLowerCase().includes(lowercaseQuery)
    );

    return answerMatches.length > 0 ? answerMatches[0] : null;
  };

  const simulateTyping = async (content: string): Promise<void> => {
    setIsTyping(true);
    
    // Add typing indicator
    const typingMessage: Message = {
      id: `typing-${Date.now()}`,
      type: 'bot',
      content: '',
      timestamp: new Date(),
      isTyping: true
    };
    
    setMessages(prev => [...prev, typingMessage]);
    
    // Simulate typing delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
    
    // Remove typing indicator and add actual message
    setMessages(prev => {
      const filtered = prev.filter(msg => !msg.isTyping);
      return [...filtered, {
        id: `bot-${Date.now()}`,
        type: 'bot',
        content,
        timestamp: new Date()
      }];
    });
    
    setIsTyping(false);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    // Find best matching FAQ
    const matchedFAQ = findBestMatch(inputValue);
    
    let botResponse = '';
    if (matchedFAQ) {
      botResponse = matchedFAQ.answer;
    } else {
      botResponse = `I couldn't find a specific answer to your question. Here are some things you might want to explore:

• Check the Learning Modules for comprehensive training
• Visit the Community section to ask other entrepreneurs
• Use the Mentorship Hub to connect with experts
• Browse the Toolkit for business templates and tools

You can also contact our support team at support@bizboost.co.za for personalized assistance.`;
    }

    await simulateTyping(botResponse);
  };

  const handleFAQClick = async (faq: FAQ) => {
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: faq.question,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    await simulateTyping(faq.answer);
    setShowFAQs(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const filteredFAQs = faqs.filter(faq =>
    selectedCategory === 'all' || faq.category === selectedCategory
  );

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary-500 text-white rounded-full shadow-lg hover:bg-primary-600 transition-all duration-300 flex items-center justify-center z-50 hover:scale-110"
      >
        <MessageCircle className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-80 h-96 bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col z-50 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-primary-500 text-white rounded-t-xl">
        <div className="flex items-center space-x-2">
          <Bot className="w-5 h-5" />
          <span className="font-semibold">BizBoost Assistant</span>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="p-1 hover:bg-primary-600 rounded transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map(message => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex items-start space-x-2 max-w-[85%] ${
              message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
            }`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.type === 'user' 
                  ? 'bg-primary-500 text-white' 
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {message.type === 'user' ? (
                  <User className="w-3 h-3" />
                ) : (
                  <Bot className="w-3 h-3" />
                )}
              </div>
              
              <div className={`px-3 py-2 rounded-lg text-sm ${
                message.type === 'user'
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {message.isTyping ? (
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap">{message.content}</div>
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* FAQ Section */}
      {showFAQs && messages.length <= 1 && (
        <div className="border-t border-gray-200 p-4 max-h-48 overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-900 text-sm">Frequently Asked Questions</h4>
            <button
              onClick={() => setShowFAQs(false)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <ChevronUp className="w-4 h-4 text-gray-500" />
            </button>
          </div>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-2 py-1 text-xs border border-gray-300 rounded mb-3 focus:ring-1 focus:ring-primary-500"
          >
            {categories.map(category => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
          
          <div className="space-y-2">
            {filteredFAQs.slice(0, 4).map(faq => (
              <button
                key={faq.id}
                onClick={() => handleFAQClick(faq)}
                className="w-full text-left p-2 text-xs text-gray-700 hover:bg-gray-50 rounded transition-colors border border-gray-200"
              >
                {faq.question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Show FAQs Button */}
      {!showFAQs && (
        <div className="border-t border-gray-200 p-2">
          <button
            onClick={() => setShowFAQs(true)}
            className="w-full flex items-center justify-center space-x-1 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ChevronDown className="w-4 h-4" />
            <span>Show FAQs</span>
          </button>
        </div>
      )}

      {/* Input Area */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything..."
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            disabled={isTyping}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isTyping}
            className="px-3 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex items-center justify-center mt-2">
          <span className="text-xs text-gray-500">
            Powered by BizBoost AI • Available 24/7
          </span>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;