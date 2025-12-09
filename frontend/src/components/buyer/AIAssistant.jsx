import React, { useState, useContext } from 'react';
import { sendVoiceCommand } from '../../api/aiAgent';
import ProductCard from './ProductCard'; 
import CartContext from '../../context/CartContext';

const AIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false); // Controls the results modal
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState({ type: 'ai', text: 'Hi! Click the mic and describe what you want.' });
  const [foundProducts, setFoundProducts] = useState([]);
  
  const { addToCart } = useContext(CartContext);

  // 1. Browser Text-to-Speech
  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  };

  // 2. Browser Speech-to-Text
  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Browser not supported. Use Chrome or Edge.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.start();
    setIsListening(true);
    setMessages({ type: 'ai', text: 'Listening...' });

    recognition.onresult = async (event) => {
      const transcript = event.results[0][0].transcript;
      setIsListening(false);
      handleCommand(transcript);
    };

    recognition.onerror = () => {
      setIsListening(false);
      setMessages({ type: 'ai', text: "I didn't catch that. Try again." });
    };
  };

  const handleCommand = async (text) => {
    setMessages({ type: 'user', text: `"${text}"` });
    setIsProcessing(true);

    try {
      // Call Backend
      const res = await sendVoiceCommand(text);
      
      if (res.success) {
        setFoundProducts(res.products);
        setMessages({ type: 'ai', text: res.aiReply });
        speak(res.aiReply); // AI Speaks back!
        setIsOpen(true); // Open results panel
      }
    } catch (err) {
      setMessages({ type: 'ai', text: "Sorry, my brain is offline." });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      {/* --- Floating Action Button (FAB) --- */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end space-y-2">
        {/* Chat Bubble Hint */}
        {!isOpen && (
          <div className="bg-white px-4 py-2 rounded-lg shadow-lg border border-gray-100 text-sm mb-2 animate-fade-in-up">
            {isProcessing ? "Thinking..." : messages.text}
          </div>
        )}

        {/* Mic Button */}
        <button
          onClick={startListening}
          disabled={isListening || isProcessing}
          className={`h-16 w-16 rounded-full shadow-2xl flex items-center justify-center transition-all transform hover:scale-105 ${
            isListening ? 'bg-red-500 animate-pulse' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isProcessing ? (
             <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
             <span className="text-3xl">🎙️</span>
          )}
        </button>
      </div>

      {/* --- Results Modal / Overlay --- */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl h-[80vh] rounded-xl shadow-2xl flex flex-col overflow-hidden relative">
            
            {/* Header */}
            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
              <div>
                <h3 className="font-bold text-lg text-gray-800">AI Shopping Agent</h3>
                <p className="text-sm text-gray-500">{messages.text}</p>
              </div>
              <button 
                onClick={() => setIsOpen(false)} 
                className="text-gray-500 hover:text-red-500 text-2xl"
              >
                &times;
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-100">
              {foundProducts.length === 0 ? (
                <div className="text-center py-20 text-gray-500">
                  <p className="text-xl">🤷‍♂️</p>
                  <p>No products matched your description.</p>
                  <button onClick={() => setIsOpen(false)} className="text-blue-500 mt-4 underline">Close and try again</button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {foundProducts.map(product => (
                    <ProductCard 
                      key={product._id} 
                      product={product} 
                      onAddToCart={addToCart} 
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Footer Mic */}
            <div className="p-4 border-t bg-white flex justify-center">
               <button 
                 onClick={startListening}
                 className="flex items-center space-x-2 text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-full transition"
               >
                 <span>🎤</span>
                 <span>Try another command</span>
               </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};

export default AIAssistant;