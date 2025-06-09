
import { Quiz } from '../types/quiz';
import { extractTextFromPDF } from './pdfExtractor';
import { generateQuizWithGemini, generateQuizFromPDFWithGemini } from './geminiApi';
import { generateFallbackQuiz, generateQuestionsFromText } from './fallbackQuiz';

export const generateQuizFromTopic = async (topic: string, numQuestions: number): Promise<Quiz> => {
  try {
    console.log(`Generating quiz for topic: ${topic} with ${numQuestions} questions`);
    
    // Try to generate with Gemini API first
    const quiz = await generateQuizWithGemini(topic, numQuestions);
    return quiz;
  } catch (error) {
    console.error('Error with Gemini API, falling back to sample data:', error);
    
    // Fallback to sample data if API fails
    return generateFallbackQuiz(topic, numQuestions);
  }
};

export const generateQuizFromPDF = async (file: File, numQuestions: number): Promise<Quiz> => {
  try {
    // Extract text from PDF
    const text = await extractTextFromPDF(file);
    console.log('Extracted PDF text length:', text.length);
    
    // Try to generate with Gemini API first
    const quiz = await generateQuizFromPDFWithGemini(text, numQuestions, file.name);
    return quiz;
  } catch (error) {
    console.error('Error processing PDF with Gemini API, falling back:', error);
    
    // Fallback to simple PDF processing
    const text = await extractTextFromPDF(file);
    const questions = generateQuestionsFromText(text, numQuestions);
    
    return {
      id: Date.now().toString(),
      title: `Quiz from ${file.name}`,
      topic: file.name.replace('.pdf', ''),
      questions,
      totalQuestions: questions.length
    };
  }
};
