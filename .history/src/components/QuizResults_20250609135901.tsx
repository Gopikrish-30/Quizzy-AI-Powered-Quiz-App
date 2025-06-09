
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Clock, CheckCircle, XCircle, RotateCcw, Award, Target, TrendingUp } from 'lucide-react';
import { Quiz, QuizResult } from '../types/quiz';

interface QuizResultsProps {
  quiz: Quiz;
  result: QuizResult;
  onBackToSetup: () => void;
}

const QuizResults: React.FC<QuizResultsProps> = ({ quiz, result, onBackToSetup }) => {
  const percentage = Math.round((result.score / result.totalQuestions) * 100);
  
  const getGradeInfo = () => {
    if (percentage >= 90) return {
      grade: 'A+',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      message: 'Outstanding Performance',
      description: 'You have mastered this topic.'
    };
    if (percentage >= 80) return {
      grade: 'A',
      color: 'text-green-500',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      message: 'Excellent Work',
      description: 'You have a strong understanding of the material.'
    };
    if (percentage >= 70) return {
      grade: 'B',
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      message: 'Good Performance',
      description: 'You have a solid grasp of the concepts.'
    };
    if (percentage >= 60) return {
      grade: 'C',
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      message: 'Fair Performance',
      description: 'Consider reviewing the material for better understanding.'
    };
    return {
      grade: 'D',
      color: 'text-red-500',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      message: 'Needs Improvement',
      description: 'Review the material and try again to improve your score.'
    };
  };

  const gradeInfo = getGradeInfo();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const avgTimePerQuestion = Math.round(result.timeSpent / result.totalQuestions);

  return (
    <div className="max-w-6xl mx-auto space-y-8 px-4">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-black mb-2">
          Quiz Complete
        </h1>
        <p className="text-lg text-gray-600">
          Results for "{quiz.title}"
        </p>
      </div>

      {/* Main Results Card */}
      <Card className="bg-white border border-gray-200">
        <CardHeader className="border-b border-gray-100 text-center py-6">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="text-6xl font-bold text-black">
              {gradeInfo.grade}
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-black mb-2">
            {result.score}/{result.totalQuestions} Correct
          </CardTitle>
          <p className="text-lg font-medium text-gray-700 mb-1">
            {gradeInfo.message}
          </p>
          <p className="text-gray-600">
            {gradeInfo.description}
          </p>
        </CardHeader>

        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 mb-1">
                <Target className="w-4 h-4 text-gray-600" />
                <span className="text-xs font-medium text-gray-600">Accuracy</span>
              </div>
              <div className="text-xl font-bold text-black">{percentage}%</div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="w-4 h-4 text-gray-600" />
                <span className="text-xs font-medium text-gray-600">Correct</span>
              </div>
              <div className="text-xl font-bold text-black">{result.score}</div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-gray-600" />
                <span className="text-xs font-medium text-gray-600">Total Time</span>
              </div>
              <div className="text-xl font-bold text-black">{formatTime(result.timeSpent)}</div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-gray-600" />
                <span className="text-xs font-medium text-gray-600">Avg/Question</span>
              </div>
              <div className="text-xl font-bold text-black">{avgTimePerQuestion}s</div>
            </div>
          </div>

          <div className="text-center">
            <Button
              onClick={onBackToSetup}
              className="bg-black hover:bg-gray-800 text-white px-8 py-3 font-medium"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Take Another Quiz
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Review */}
      <Card className="bg-white border border-gray-200">
        <CardHeader className="border-b border-gray-200">
          <CardTitle className="text-xl font-bold text-black flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-gray-600" />
            Detailed Review
          </CardTitle>
          <p className="text-gray-600 text-sm">Review each question and learn from your answers</p>
        </CardHeader>

        <CardContent className="p-6 space-y-4">
          {quiz.questions.map((question, index) => {
            const userAnswer = result.answers[question.id];
            const isCorrect = userAnswer === question.correctAnswer;

            return (
              <div key={question.id} className={`border rounded-lg p-4 ${
                isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
              }`}>
                <div className="flex items-start gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isCorrect ? 'bg-green-500' : 'bg-red-500'
                  }`}>
                    {isCorrect ? (
                      <CheckCircle className="w-4 h-4 text-white" />
                    ) : (
                      <XCircle className="w-4 h-4 text-white" />
                    )}
                  </div>

                  <div className="flex-1">
                    <h4 className="font-medium text-sm text-black mb-2">
                      {index + 1}. {question.question}
                    </h4>

                    <div className="space-y-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="bg-white p-3 rounded-lg border border-gray-200">
                          <span className="text-xs font-medium text-gray-600 block mb-1">Your Answer:</span>
                          <span className={`text-sm font-medium ${
                            userAnswer !== undefined
                              ? (isCorrect ? 'text-green-600' : 'text-red-600')
                              : 'text-gray-500'
                          }`}>
                            {userAnswer !== undefined
                              ? `${String.fromCharCode(65 + userAnswer)}. ${question.options[userAnswer]}`
                              : 'Not answered'
                            }
                          </span>
                        </div>

                        {!isCorrect && (
                          <div className="bg-white p-3 rounded-lg border border-gray-200">
                            <span className="text-xs font-medium text-gray-600 block mb-1">Correct Answer:</span>
                            <span className="text-green-600 text-sm font-medium">
                              {String.fromCharCode(65 + question.correctAnswer)}. {question.options[question.correctAnswer]}
                            </span>
                          </div>
                        )}
                      </div>

                      {question.explanation && (
                        <div className="bg-white p-3 rounded-lg border border-gray-200">
                          <span className="text-xs font-medium text-gray-600 block mb-1">Explanation:</span>
                          <p className="text-sm text-gray-700">{question.explanation}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
};

export default QuizResults;
