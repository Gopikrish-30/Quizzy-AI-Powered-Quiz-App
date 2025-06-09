
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Quiz Genie ✨
          </h1>
          <p className="text-lg text-muted-foreground">
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
