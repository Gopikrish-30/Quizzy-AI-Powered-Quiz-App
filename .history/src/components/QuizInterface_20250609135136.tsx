
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, CheckCircle, XCircle, Clock, Trophy, ArrowRight } from 'lucide-react';
import { Quiz, QuizResult } from '../types/quiz';
import QuizResults from './QuizResults';

interface QuizInterfaceProps {
  quiz: Quiz;
  onBackToSetup: () => void;
}

const QuizInterface: React.FC<QuizInterfaceProps> = ({ quiz, onBackToSetup }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [questionId: number]: number }>({});
  const [showResults, setShowResults] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [startTime] = useState(Date.now());
  const [showFeedback, setShowFeedback] = useState(false);
  const [questionAnswered, setQuestionAnswered] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime]);

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;
  const selectedAnswer = selectedAnswers[currentQuestion.id];
  const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

  const handleAnswerSelect = (answerIndex: number) => {
    if (questionAnswered) return; // Prevent changing answer after feedback is shown
    
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: answerIndex
    }));
    setQuestionAnswered(true);
    setShowFeedback(true);
  };

  const handleNext = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setShowFeedback(false);
      setQuestionAnswered(false);
    } else {
      handleFinishQuiz();
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setShowFeedback(!!selectedAnswers[quiz.questions[currentQuestionIndex - 1].id]);
      setQuestionAnswered(!!selectedAnswers[quiz.questions[currentQuestionIndex - 1].id]);
    }
  };

  const handleFinishQuiz = () => {
    setShowResults(true);
  };

  const calculateScore = (): QuizResult => {
    let correctAnswers = 0;
    quiz.questions.forEach(question => {
      if (selectedAnswers[question.id] === question.correctAnswer) {
        correctAnswers++;
      }
    });

    return {
      score: correctAnswers,
      totalQuestions: quiz.questions.length,
      answers: selectedAnswers,
      timeSpent
    };
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (showResults) {
    return <QuizResults quiz={quiz} result={calculateScore()} onBackToSetup={onBackToSetup} />;
  }

  return (
    <div className="max-w-3xl mx-auto px-4">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between bg-white border border-gray-200 rounded-lg p-4">
        <Button
          variant="outline"
          onClick={onBackToSetup}
          className="flex items-center gap-2 border-gray-300 hover:bg-gray-50"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Setup
        </Button>

        <div className="text-center">
          <h2 className="text-xl font-bold text-black">
            {quiz.title}
          </h2>
          <p className="text-gray-600 text-sm mt-1">Test your knowledge</p>
        </div>

        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <Clock className="w-4 h-4" />
            <span>{formatTime(timeSpent)}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <span>
              {Object.keys(selectedAnswers).length}/{quiz.questions.length} answered
            </span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">
            Question {currentQuestionIndex + 1} of {quiz.questions.length}
          </span>
          <span className="text-sm text-gray-600">
            {Math.round(progress)}% Complete
          </span>
        </div>
        <Progress value={progress} className="h-2 bg-gray-200" />
      </div>

      {/* Question Card */}
      <Card className="bg-white border border-gray-200">
        <CardHeader className="border-b border-gray-100">
          <CardTitle className="text-xl font-bold text-black leading-relaxed">
            {currentQuestion.question}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-8">
          <div className="space-y-4 mb-8">
            {currentQuestion.options.map((option, index) => {
              let optionClass = "p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 transform hover:scale-[1.02] ";
              
              if (selectedAnswer === index && showFeedback) {
                if (isCorrect) {
                  optionClass += "border-green-500 bg-green-50 shadow-lg shadow-green-100";
                } else {
                  optionClass += "border-red-500 bg-red-50 shadow-lg shadow-red-100";
                }
              } else if (showFeedback && index === currentQuestion.correctAnswer) {
                optionClass += "border-green-500 bg-green-50 shadow-lg shadow-green-100";
              } else if (selectedAnswer === index) {
                optionClass += "border-blue-500 bg-blue-50 shadow-lg shadow-blue-100";
              } else {
                optionClass += "border-gray-200 hover:border-gray-300 hover:bg-gray-50 hover:shadow-md";
              }

              return (
                <div
                  key={index}
                  className={optionClass}
                  onClick={() => handleAnswerSelect(index)}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      selectedAnswer === index && showFeedback
                        ? (isCorrect ? 'border-green-500 bg-green-500' : 'border-red-500 bg-red-500')
                        : showFeedback && index === currentQuestion.correctAnswer
                        ? 'border-green-500 bg-green-500'
                        : selectedAnswer === index
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300'
                    }`}>
                      {showFeedback && index === currentQuestion.correctAnswer && (
                        <CheckCircle className="w-4 h-4 text-white" />
                      )}
                      {showFeedback && selectedAnswer === index && !isCorrect && (
                        <XCircle className="w-4 h-4 text-white" />
                      )}
                      {!showFeedback && selectedAnswer === index && (
                        <div className="w-3 h-3 bg-white rounded-full" />
                      )}
                    </div>
                    
                    <div className="flex items-center gap-3 flex-1">
                      <span className="text-lg font-semibold text-gray-600">
                        {String.fromCharCode(65 + index)}.
                      </span>
                      <span className="text-lg text-gray-800">{option}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Feedback Section */}
          {showFeedback && (
            <div className={`p-6 rounded-2xl mb-6 border-l-4 ${
              isCorrect 
                ? 'bg-green-50 border-green-500' 
                : 'bg-red-50 border-red-500'
            }`}>
              <div className="flex items-start gap-3">
                {isCorrect ? (
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                )}
                <div>
                  <h4 className={`font-bold text-lg mb-2 ${
                    isCorrect ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {isCorrect ? '🎉 Correct!' : '❌ Incorrect'}
                  </h4>
                  <p className={`text-base ${
                    isCorrect ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {currentQuestion.explanation}
                  </p>
                  {!isCorrect && (
                    <p className="text-green-700 mt-2 font-medium">
                      Correct answer: {String.fromCharCode(65 + currentQuestion.correctAnswer)}. {currentQuestion.options[currentQuestion.correctAnswer]}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between items-center pt-4">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className="px-6 py-3 text-lg hover:bg-gray-50 transition-colors"
            >
              Previous
            </Button>
            
            <Button
              onClick={handleNext}
              disabled={!questionAnswered}
              className="px-8 py-3 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              {currentQuestionIndex === quiz.questions.length - 1 ? (
                <>Finish Quiz <Trophy className="w-5 h-5 ml-2" /></>
              ) : (
                <>Next Question <ArrowRight className="w-5 h-5 ml-2" /></>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuizInterface;
