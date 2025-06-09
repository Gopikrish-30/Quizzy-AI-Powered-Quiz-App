
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload } from 'lucide-react';
import { generateQuizFromTopic, generateQuizFromDocument } from '../utils/quizGenerator';
import { getSupportedFileTypes, getFileTypeFromMimeType, getFileTypeFromExtension } from '../utils/documentExtractor';
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
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const supportedTypes = getSupportedFileTypes();
      const fileType = getFileTypeFromMimeType(file.type) || getFileTypeFromExtension(file.name);

      if (supportedTypes.includes(file.type) || fileType) {
        setDocumentFile(file);
        setTopic(''); // Clear topic when document is uploaded
        toast({
          title: "Document uploaded successfully",
          description: `Ready to generate quiz from "${file.name}"`,
        });
      } else {
        toast({
          title: "Invalid file format",
          description: "Please upload PDF, Word (.doc/.docx), or PowerPoint (.ppt/.pptx) files.",
          variant: "destructive",
        });
      }
    }
  };

  const handleStartQuiz = async () => {
    if (!topic.trim() && !documentFile) {
      toast({
        title: "Missing input",
        description: "Please enter a topic or upload a document file.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      let quiz: Quiz;

      if (documentFile) {
        quiz = await generateQuizFromDocument(documentFile, parseInt(numQuestions));
      } else {
        quiz = await generateQuizFromTopic(topic, parseInt(numQuestions));
      }
      
      onQuizGenerated(quiz);
      toast({
        title: "Quiz generated successfully",
        description: `Created ${quiz.questions.length} questions.`,
      });
    } catch (error) {
      console.error('Error generating quiz:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast({
        title: "Generation failed",
        description: `Failed to generate quiz: ${errorMessage}`,
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
            Generate quizzes from any topic or Pdf/PT/DOCS document
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
              disabled={!!documentFile || isLoading}
              className="border border-gray-300 focus:border-black focus:ring-1 focus:ring-black"
            />
            <p className="text-sm text-gray-500">
              Try topics like "Artificial Intelligence", "World War II", or "Climate Change"
            </p>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-3 py-1 text-gray-500 font-medium">
                or upload document
              </span>
            </div>
          </div>

          {/* Document Upload Section */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-black">
              Upload Document
            </Label>
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer ${
                documentFile
                  ? 'border-gray-400 bg-gray-50'
                  : 'border-gray-300 bg-gray-50'
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className={`w-8 h-8 mx-auto mb-3 ${documentFile ? 'text-black' : 'text-gray-400'}`} />
              <p className={`text-sm font-medium mb-1 ${documentFile ? 'text-black' : 'text-gray-600'}`}>
                {documentFile ? `${documentFile.name}` : 'Click to upload document or drag and drop'}
              </p>
              <p className="text-xs text-gray-500">
                {documentFile ? 'Quiz will be generated from this document' : 'Supports PDF, Word (.doc/.docx), PowerPoint (.ppt/.pptx)'}
              </p>
              {!documentFile && (
                <p className="text-xs text-gray-400 mt-1">
                  Note: For PowerPoint files, text in images may not be extracted. Consider using PDF or Word formats for better results.
                </p>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.ppt,.pptx"
                onChange={handleFileUpload}
                className="hidden"
                disabled={isLoading}
              />
            </div>

            {documentFile && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setDocumentFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                className="w-full text-gray-600 border-gray-300 hover:bg-gray-50"
              >
                Remove Document
              </Button>
            )}
          </div>

          {/* Number of Questions */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-black">Number of Questions</Label>
            <Select value={numQuestions} onValueChange={setNumQuestions} disabled={isLoading}>
              <SelectTrigger className="border border-gray-300 focus:border-black focus:ring-1 focus:ring-black">
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
            disabled={isLoading || (!topic.trim() && !documentFile)}
            className="w-full bg-black hover:bg-gray-800 text-white py-3 font-medium transition-colors"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Generating Quiz...</span>
              </div>
            ) : (
              <span>Generate Quiz</span>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuizSetup;
