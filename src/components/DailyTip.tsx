import React, { useState, useEffect } from 'react';
import { Lightbulb, RefreshCw, BookOpen } from 'lucide-react';

interface DailyTipProps {
  language: string;
}

const DailyTip: React.FC<DailyTipProps> = ({ language }) => {
  const [currentTip, setCurrentTip] = useState(0);
  
  const tips = {
    en: [
      {
        title: "Start Small, Think Big",
        content: "Focus on serving your local community first. Build strong relationships with nearby customers before expanding to other areas.",
        category: "Growth Strategy"
      },
      {
        title: "Track Your Money Daily",
        content: "Write down every rand that comes in and goes out. Use a simple notebook or your phone to track daily sales and expenses.",
        category: "Financial Management"
      },
      {
        title: "Use WhatsApp for Business",
        content: "Create a WhatsApp Business account to communicate with customers, share product photos, and take orders easily.",
        category: "Digital Tools"
      },
      {
        title: "Know Your Customers",
        content: "Ask your customers what they need and when they need it. This helps you stock the right products at the right time.",
        category: "Customer Service"
      },
      {
        title: "Join Local Business Groups",
        content: "Connect with other business owners in your area. Share experiences, learn from each other, and support one another.",
        category: "Networking"
      }
    ],
    af: [
      {
        title: "Begin Klein, Dink Groot",
        content: "Fokus eers op jou plaaslike gemeenskap. Bou sterk verhoudings met nabygeleë kliënte voordat jy na ander areas uitbrei.",
        category: "Groeistrategie"
      },
      {
        title: "Hou Daagliks Rekord van Jou Geld",
        content: "Skryf elke rand neer wat inkom en uitgaan. Gebruik 'n eenvoudige notaboek of jou foon om daaglikse verkope en uitgawes te volg.",
        category: "Finansiële Bestuur"
      }
    ],
    zu: [
      {
        title: "Qala Kancane, Cabanga Kakhulu",
        content: "Gxila ekusizeni umphakathi wakini kuqala. Yakha ubudlelwano obuqinile namakhasimende aseduze ngaphambi kokuba unabe kwezinye izindawo.",
        category: "Isu Lokukhula"
      },
      {
        title: "Landelela Imali Yakho Nsuku Zonke",
        content: "Bhala wonke amandi angena naphumayo. Sebenzisa incwadi encane noma ifoni yakho ukulandelela ukuthengisa nezindleko zansuku zonke.",
        category: "Ukuphatha Ezezimali"
      }
    ]
  };

  const currentTips = (tips as Record<string, typeof tips.en>)[language] || tips.en;

  useEffect(() => {
    const today = new Date().getDate();
    setCurrentTip(today % currentTips.length);
  }, [language, currentTips.length]);

  const nextTip = () => {
    setCurrentTip((prev) => (prev + 1) % currentTips.length);
  };

  return (
    <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Lightbulb className="w-5 h-5 text-yellow-500" />
          <h3 className="font-semibold text-gray-900">Daily Business Tip</h3>
        </div>
        <button
          onClick={nextTip}
          className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
          title="New tip"
        >
          <RefreshCw className="w-4 h-4 text-gray-500" />
        </button>
      </div>
      
      <div className="mb-3">
        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
          {currentTips[currentTip].category}
        </span>
      </div>
      
      <h4 className="font-medium text-gray-900 mb-2">
        {currentTips[currentTip].title}
      </h4>
      
      <p className="text-gray-700 text-sm leading-relaxed mb-4">
        {currentTips[currentTip].content}
      </p>
      
      <button className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 text-sm font-medium">
        <BookOpen className="w-4 h-4" />
        <span>Learn More</span>
      </button>
    </div>
  );
};

export default DailyTip;