
import React, { useState } from 'react';
import QuizSetup from '../components/QuizSetup';
import QuizInterface from '../components/QuizInterface';
import { Quiz } from '../types/quiz';

const Index = () => {
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleQuizGenerated = (quiz: Quiz) => {
    setCurrentQuiz(quiz);
  };

  const handleBackToSetup = () => {
    setCurrentQuiz(null);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-black mb-4">
            Quiz Generator
          </h1>
          <p className="text-lg text-gray-600">
            Generate intelligent quizzes from any topic or PDF document
          </p>
        </div>

        {!currentQuiz ? (
          <QuizSetup 
            onQuizGenerated={handleQuizGenerated} 
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />
        ) : (
          <QuizInterface 
            quiz={currentQuiz} 
            onBackToSetup={handleBackToSetup}
          />
        )}
      </div>
    </div>
  );
};

export default Index;
