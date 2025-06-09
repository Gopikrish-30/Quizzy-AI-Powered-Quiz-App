
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
      message: 'Outstanding Performance! 🌟',
      description: 'You have mastered this topic!'
    };
    if (percentage >= 80) return { 
      grade: 'A', 
      color: 'text-green-500', 
      bgColor: 'bg-green-50', 
      borderColor: 'border-green-200',
      message: 'Excellent Work! 🎉',
      description: 'You have a strong understanding of the material.'
    };
    if (percentage >= 70) return { 
      grade: 'B', 
      color: 'text-blue-500', 
      bgColor: 'bg-blue-50', 
      borderColor: 'border-blue-200',
      message: 'Good Job! 👍',
      description: 'You have a solid grasp of the concepts.'
    };
    if (percentage >= 60) return { 
      grade: 'C', 
      color: 'text-yellow-500', 
      bgColor: 'bg-yellow-50', 
      borderColor: 'border-yellow-200',
      message: 'Fair Performance! 💪',
      description: 'Consider reviewing the material for better understanding.'
    };
    return { 
      grade: 'D', 
      color: 'text-red-500', 
      bgColor: 'bg-red-50', 
      borderColor: 'border-red-200',
      message: 'Keep Learning! 📚',
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
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
          Quiz Complete! 🎊
        </h1>
        <p className="text-xl text-muted-foreground">
          Here's how you performed on "{quiz.title}"
        </p>
      </div>

      {/* Main Results Card */}
      <Card className={`backdrop-blur-sm bg-white/95 border-2 shadow-2xl rounded-3xl overflow-hidden ${gradeInfo.borderColor}`}>
        <CardHeader className={`${gradeInfo.bgColor} border-b border-gray-100 text-center py-8`}>
          <div className="flex items-center justify-center gap-4 mb-4">
            <Award className={`w-12 h-12 ${gradeInfo.color}`} />
            <div className={`text-8xl font-bold ${gradeInfo.color}`}>
              {gradeInfo.grade}
            </div>
            <Trophy className={`w-12 h-12 ${gradeInfo.color}`} />
          </div>
          <CardTitle className="text-3xl font-bold text-gray-800 mb-2">
            {result.score}/{result.totalQuestions} Correct
          </CardTitle>
          <p className="text-xl font-semibold text-gray-700 mb-2">
            {gradeInfo.message}
          </p>
          <p className="text-lg text-gray-600">
            {gradeInfo.description}
          </p>
        </CardHeader>
        
        <CardContent className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200">
              <div className="flex items-center gap-3 mb-2">
                <Target className="w-6 h-6 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Accuracy</span>
              </div>
              <div className="text-3xl font-bold text-blue-600">{percentage}%</div>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl border border-green-200">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <span className="text-sm font-medium text-green-800">Correct</span>
              </div>
              <div className="text-3xl font-bold text-green-600">{result.score}</div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl border border-purple-200">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="w-6 h-6 text-purple-600" />
                <span className="text-sm font-medium text-purple-800">Total Time</span>
              </div>
              <div className="text-3xl font-bold text-purple-600">{formatTime(result.timeSpent)}</div>
            </div>
            
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-2xl border border-orange-200">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-6 h-6 text-orange-600" />
                <span className="text-sm font-medium text-orange-800">Avg/Question</span>
              </div>
              <div className="text-3xl font-bold text-orange-600">{avgTimePerQuestion}s</div>
            </div>
          </div>

          <div className="text-center">
            <Button
              onClick={onBackToSetup}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-12 py-4 text-xl font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              <RotateCcw className="w-6 h-6 mr-3" />
              Take Another Quiz
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Review */}
      <Card className="backdrop-blur-sm bg-white/95 border-0 shadow-2xl rounded-3xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
          <CardTitle className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <CheckCircle className="w-7 h-7 text-blue-600" />
            Detailed Review
          </CardTitle>
          <p className="text-muted-foreground">Review each question and learn from your answers</p>
        </CardHeader>
        
        <CardContent className="p-8 space-y-6">
          {quiz.questions.map((question, index) => {
            const userAnswer = result.answers[question.id];
            const isCorrect = userAnswer === question.correctAnswer;
            
            return (
              <div key={question.id} className={`border-2 rounded-2xl p-6 transition-all duration-200 ${
                isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
              }`}>
                <div className="flex items-start gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isCorrect ? 'bg-green-500' : 'bg-red-500'
                  }`}>
                    {isCorrect ? (
                      <CheckCircle className="w-5 h-5 text-white" />
                    ) : (
                      <XCircle className="w-5 h-5 text-white" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h4 className="font-bold text-lg text-gray-800 mb-3">
                      {index + 1}. {question.question}
                    </h4>
                    
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white p-4 rounded-xl border">
                          <span className="text-sm font-medium text-gray-600 block mb-1">Your Answer:</span>
                          <span className={`font-semibold ${
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
                          <div className="bg-white p-4 rounded-xl border">
                            <span className="text-sm font-medium text-gray-600 block mb-1">Correct Answer:</span>
                            <span className="text-green-600 font-semibold">
                              {String.fromCharCode(65 + question.correctAnswer)}. {question.options[question.correctAnswer]}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {question.explanation && (
                        <div className="bg-white p-4 rounded-xl border border-blue-200">
                          <span className="text-sm font-medium text-blue-600 block mb-1">Explanation:</span>
                          <p className="text-gray-700">{question.explanation}</p>
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
