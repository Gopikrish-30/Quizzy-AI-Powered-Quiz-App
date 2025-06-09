
import { Quiz } from '../types/quiz';
import { extractTextFromPDF } from './pdfExtractor';
import { extractTextFromDocument } from './documentExtractor';
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
    console.log('Starting PDF quiz generation for:', file.name);

    // Extract text from PDF
    const text = await extractTextFromPDF(file);
    console.log('Extracted PDF text length:', text.length);

    if (text.length < 50) {
      throw new Error('PDF contains insufficient text content for quiz generation');
    }

    // Try to generate with Gemini API first
    const quiz = await generateQuizFromPDFWithGemini(text, numQuestions, file.name);
    console.log('Successfully generated quiz with Gemini API');
    return quiz;
  } catch (error) {
    console.error('Error processing PDF with Gemini API, attempting fallback:', error);

    try {
      // Fallback to simple PDF processing
      const text = await extractTextFromPDF(file);
      console.log('Fallback: Re-extracted text length:', text.length);

      if (text.length < 50) {
        throw new Error('PDF contains insufficient text content for quiz generation');
      }

      const questions = generateQuestionsFromText(text, numQuestions);
      console.log('Fallback: Generated questions:', questions.length);

      if (questions.length === 0) {
        throw new Error('Unable to generate questions from PDF content');
      }

      return {
        id: Date.now().toString(),
        title: `Quiz from ${file.name}`,
        topic: file.name.replace('.pdf', ''),
        questions,
        totalQuestions: questions.length
      };
    } catch (fallbackError) {
      console.error('Fallback also failed:', fallbackError);
      throw new Error(`Failed to generate quiz from PDF: ${fallbackError instanceof Error ? fallbackError.message : 'Unknown error'}`);
    }
  }
};

export const generateQuizFromDocument = async (file: File, numQuestions: number): Promise<Quiz> => {
  try {
    console.log('Starting document quiz generation for:', file.name);

    // Extract text from any supported document type
    const text = await extractTextFromDocument(file);
    console.log('Extracted document text length:', text.length);

    if (text.length < 50) {
      throw new Error('Document contains insufficient text content for quiz generation');
    }

    // Try to generate with Gemini API first
    const quiz = await generateQuizFromPDFWithGemini(text, numQuestions, file.name);
    console.log('Successfully generated quiz with Gemini API');
    return quiz;
  } catch (error) {
    console.error('Error processing document with Gemini API, attempting fallback:', error);

    try {
      // Fallback to simple document processing
      const text = await extractTextFromDocument(file);
      console.log('Fallback: Re-extracted text length:', text.length);

      if (text.length < 50) {
        throw new Error('Document contains insufficient text content for quiz generation');
      }

      const questions = generateQuestionsFromText(text, numQuestions);
      console.log('Fallback: Generated questions:', questions.length);

      if (questions.length === 0) {
        throw new Error('Unable to generate questions from document content');
      }

      return {
        id: Date.now().toString(),
        title: `Quiz from ${file.name}`,
        topic: file.name.replace(/\.(pdf|docx?|pptx?)$/i, ''),
        questions,
        totalQuestions: questions.length
      };
    } catch (fallbackError) {
      console.error('Fallback also failed:', fallbackError);
      throw new Error(`Failed to generate quiz from document: ${fallbackError instanceof Error ? fallbackError.message : 'Unknown error'}`);
    }
  }
};
