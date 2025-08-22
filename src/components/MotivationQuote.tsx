import React, { useState, useEffect } from 'react';
import { Quote, RefreshCw } from 'lucide-react';

const MotivationQuote: React.FC = () => {
  const [currentQuote, setCurrentQuote] = useState(0);
  
  const quotes = [
    {
      text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
      author: "Winston Churchill"
    },
    {
      text: "The way to get started is to quit talking and begin doing.",
      author: "Walt Disney"
    },
    {
      text: "Innovation distinguishes between a leader and a follower.",
      author: "Steve Jobs"
    },
    {
      text: "Your limitation—it's only your imagination.",
      author: "Unknown"
    },
    {
      text: "Don't be afraid to give up the good to go for the great.",
      author: "John D. Rockefeller"
    },
    {
      text: "The future belongs to those who believe in the beauty of their dreams.",
      author: "Eleanor Roosevelt"
    }
  ];

  useEffect(() => {
    // Change quote daily
    const today = new Date().getDate();
    setCurrentQuote(today % quotes.length);
  }, []);

  const nextQuote = () => {
    setCurrentQuote((prev) => (prev + 1) % quotes.length);
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Quote className="w-5 h-5 text-primary-500" />
          <h3 className="font-semibold text-gray-900">Daily Motivation</h3>
        </div>
        <button
          onClick={nextQuote}
          className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
          title="New quote"
        >
          <RefreshCw className="w-4 h-4 text-gray-500" />
        </button>
      </div>
      
      <blockquote className="text-gray-700 italic mb-3 text-lg leading-relaxed">
        "{quotes[currentQuote].text}"
      </blockquote>
      
      <cite className="text-primary-600 font-medium text-sm">
        — {quotes[currentQuote].author}
      </cite>
    </div>
  );
};

export default MotivationQuote;