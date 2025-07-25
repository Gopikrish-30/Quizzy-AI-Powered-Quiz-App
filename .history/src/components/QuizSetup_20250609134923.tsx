
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, BookOpen, FileText, Sparkles, Brain, Zap, Target } from 'lucide-react';
import { generateQuizFromTopic, generateQuizFromPDF } from '../utils/quizGenerator';
import { Quiz } from '../types/quiz';
import { useToast } from '@/hooks/use-toast';

interface QuizSetupProps {
  onQuizGenerated: (quiz: Quiz) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const QuizSetup: React.FC<QuizSetupProps> = ({ onQuizGenerated, isLoading, setIsLoading }) => {
  const [topic, setTopic] = useState('');
  const [numQuestions, setNumQuestions] = useState('5');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
      setTopic(''); // Clear topic when PDF is uploaded
      toast({
        title: "PDF uploaded successfully! 📄",
        description: `Ready to generate quiz from "${file.name}"`,
      });
    } else {
      toast({
        title: "Invalid file format",
        description: "Please upload a PDF file.",
        variant: "destructive",
      });
    }
  };

  const handleStartQuiz = async () => {
    if (!topic.trim() && !pdfFile) {
      toast({
        title: "Missing input",
        description: "Please enter a topic or upload a PDF file.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      let quiz: Quiz;
      
      if (pdfFile) {
        quiz = await generateQuizFromPDF(pdfFile, parseInt(numQuestions));
      } else {
        quiz = await generateQuizFromTopic(topic, parseInt(numQuestions));
      }
      
      onQuizGenerated(quiz);
      toast({
        title: "Quiz generated successfully! 🎉",
        description: `Created ${quiz.questions.length} questions with AI-powered content.`,
      });
    } catch (error) {
      console.error('Error generating quiz:', error);
      toast({
        title: "Generation failed",
        description: "Failed to generate quiz. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4">
      {/* Main Setup Card */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader className="border-b border-gray-100 text-center py-6">
          <CardTitle className="text-2xl font-bold text-black mb-2">
            Create Your Quiz
          </CardTitle>
          <p className="text-gray-600">
            Generate intelligent quizzes from any topic or PDF document
          </p>
        </CardHeader>
        
        <CardContent className="p-6 space-y-6">
          {/* Topic Input Section */}
          <div className="space-y-3">
            <Label htmlFor="topic" className="text-sm font-medium text-black">
              Topic of Interest
            </Label>
            <Input
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter your topic (e.g., Machine Learning, History, Biology, etc.)"
              disabled={!!pdfFile || isLoading}
              className="border border-gray-300 focus:border-black focus:ring-1 focus:ring-black"
            />
            <p className="text-sm text-gray-500">
              Try topics like "Artificial Intelligence", "World War II", or "Climate Change"
            </p>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t-2 border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm uppercase">
              <span className="bg-white px-4 py-2 text-muted-foreground font-medium rounded-full border border-gray-200">
                or upload document
              </span>
            </div>
          </div>

          {/* PDF Upload Section */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold flex items-center gap-3">
              <FileText className="w-5 h-5 text-purple-600" />
              Upload PDF Document
            </Label>
            <div
              className={`border-3 border-dashed rounded-2xl p-8 text-center hover:border-purple-400 transition-all duration-200 cursor-pointer ${
                pdfFile 
                  ? 'border-purple-400 bg-purple-50' 
                  : 'border-gray-300 bg-gray-50 hover:bg-purple-50'
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className={`w-12 h-12 mx-auto mb-4 ${pdfFile ? 'text-purple-600' : 'text-gray-400'}`} />
              <p className={`text-lg font-medium mb-2 ${pdfFile ? 'text-purple-800' : 'text-gray-600'}`}>
                {pdfFile ? `📄 ${pdfFile.name}` : 'Click to upload PDF or drag and drop'}
              </p>
              <p className="text-sm text-muted-foreground">
                {pdfFile ? 'Quiz will be generated from this document' : 'Supports educational materials, research papers, textbooks'}
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                className="hidden"
                disabled={isLoading}
              />
            </div>
            
            {pdfFile && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setPdfFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                className="w-full rounded-xl hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-colors"
              >
                Remove PDF
              </Button>
            )}
          </div>

          {/* Number of Questions */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold">Number of Questions</Label>
            <Select value={numQuestions} onValueChange={setNumQuestions} disabled={isLoading}>
              <SelectTrigger className="bg-white/80 border-2 border-gray-200 text-lg p-4 rounded-2xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3 Questions (Quick)</SelectItem>
                <SelectItem value="5">5 Questions (Standard)</SelectItem>
                <SelectItem value="10">10 Questions (Comprehensive)</SelectItem>
                <SelectItem value="15">15 Questions (Detailed)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleStartQuiz}
            disabled={isLoading || (!topic.trim() && !pdfFile)}
            className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 hover:from-blue-700 hover:via-purple-700 hover:to-blue-700 text-white py-6 text-xl font-bold transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-2xl rounded-2xl"
          >
            {isLoading ? (
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Generating Quiz with AI...</span>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Sparkles className="w-6 h-6" />
                <span>Generate Quiz</span>
                <span>🚀</span>
              </div>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuizSetup;
