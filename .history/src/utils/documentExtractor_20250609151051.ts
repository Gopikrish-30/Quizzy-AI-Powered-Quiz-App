import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// Set up PDF.js worker - try local first, then CDN fallback
pdfjsLib.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.mjs`;

export type SupportedFileType = 'pdf' | 'docx' | 'doc' | 'pptx' | 'ppt';

export const getSupportedFileTypes = (): string[] => {
  return [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'application/msword', // .doc
    'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
    'application/vnd.ms-powerpoint', // .ppt
  ];
};

export const getFileTypeFromMimeType = (mimeType: string): SupportedFileType | null => {
  switch (mimeType) {
    case 'application/pdf':
      return 'pdf';
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      return 'docx';
    case 'application/msword':
      return 'doc';
    case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
      return 'pptx';
    case 'application/vnd.ms-powerpoint':
      return 'ppt';
    default:
      return null;
  }
};

export const getFileTypeFromExtension = (fileName: string): SupportedFileType | null => {
  const extension = fileName.toLowerCase().split('.').pop();
  switch (extension) {
    case 'pdf':
      return 'pdf';
    case 'docx':
      return 'docx';
    case 'doc':
      return 'doc';
    case 'pptx':
      return 'pptx';
    case 'ppt':
      return 'ppt';
    default:
      return null;
  }
};

export const extractTextFromPDF = async (file: File): Promise<string> => {
  try {
    console.log('Starting PDF text extraction for file:', file.name, 'Size:', file.size);
    console.log('PDF.js worker source:', pdfjsLib.GlobalWorkerOptions.workerSrc);
    
    const arrayBuffer = await file.arrayBuffer();
    console.log('PDF arrayBuffer created, size:', arrayBuffer.byteLength);
    
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    console.log('PDF loaded successfully, pages:', pdf.numPages);
    
    let text = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      text += pageText + ' ';
      console.log(`Extracted text from page ${i}, length: ${pageText.length}`);
    }
    
    console.log('Total extracted text length:', text.length);
    return text.trim();
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error(`Failed to extract text from PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const extractTextFromWord = async (file: File): Promise<string> => {
  try {
    console.log('Starting Word document text extraction for file:', file.name);
    
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    
    console.log('Word document text extracted, length:', result.value.length);
    
    if (result.messages.length > 0) {
      console.warn('Word extraction warnings:', result.messages);
    }
    
    return result.value.trim();
  } catch (error) {
    console.error('Error extracting text from Word document:', error);
    throw new Error(`Failed to extract text from Word document: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const extractTextFromPowerPoint = async (file: File): Promise<string> => {
  try {
    console.log('Starting PowerPoint text extraction for file:', file.name);

    const arrayBuffer = await file.arrayBuffer();
    let extractedText = '';

    // For PPTX files (newer format), try to extract from XML structure
    if (file.name.toLowerCase().endsWith('.pptx')) {
      extractedText = await extractTextFromPPTX(arrayBuffer);
      console.log('PPTX text extracted, length:', extractedText.length);
    } else {
      // For older PPT files, use improved binary extraction
      extractedText = await extractTextFromPPT(arrayBuffer);
      console.log('PPT text extracted, length:', extractedText.length);
    }

    // If we didn't get enough meaningful text, provide a helpful message
    if (extractedText.length < 50) {
      console.warn('Limited text extracted from PowerPoint file');
      extractedText = `Content from PowerPoint presentation: ${file.name}.
      This presentation contains slides with visual content that may include text, images, and formatting.
      The text content extracted may be limited due to the file format complexity.
      Please ensure the presentation contains sufficient readable text content for quiz generation.`;
    }

    return extractedText;
  } catch (error) {
    console.error('Error extracting text from PowerPoint:', error);
    throw new Error(`Failed to extract text from PowerPoint: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Extract text from PPTX files (newer PowerPoint format)
const extractTextFromPPTX = async (arrayBuffer: ArrayBuffer): Promise<string> => {
  try {
    // PPTX files are ZIP archives containing XML files
    // We'll extract text by looking for common PowerPoint text patterns
    const uint8Array = new Uint8Array(arrayBuffer);

    // Convert to string and look for text patterns
    let text = '';
    try {
      text = new TextDecoder('utf-8', { fatal: false }).decode(uint8Array);
    } catch {
      // If UTF-8 fails, try with latin1
      text = new TextDecoder('latin1').decode(uint8Array);
    }

    let extractedText = '';

    // Look for text content in various XML patterns used by PowerPoint
    const patterns = [
      /<a:t[^>]*>([^<]+)<\/a:t>/g,           // Text runs
      /<a:p[^>]*>([^<]+)<\/a:p>/g,           // Paragraphs
      /<p:txBody[^>]*>([^<]+)<\/p:txBody>/g, // Text bodies
      /<p:sp[^>]*>([^<]+)<\/p:sp>/g,         // Shapes with text
      /<c:v>([^<]+)<\/c:v>/g,                // Chart values
      /<c:pt[^>]*>([^<]+)<\/c:pt>/g,         // Chart points
    ];

    patterns.forEach(pattern => {
      const matches = text.match(pattern) || [];
      matches.forEach(match => {
        const content = match.replace(/<[^>]+>/g, '').trim();
        if (isValidTextContent(content)) {
          extractedText += content + ' ';
        }
      });
    });

    // Also extract text between common XML tags
    const xmlTextPattern = />([A-Za-z][^<]{3,100})</g;
    let match;
    while ((match = xmlTextPattern.exec(text)) !== null) {
      const content = match[1].trim();
      if (isValidTextContent(content)) {
        extractedText += content + ' ';
      }
    }

    // Clean up and deduplicate
    const words = extractedText.split(/\s+/).filter(word =>
      word.length > 2 &&
      !word.match(/^[\d\-_\.]+$/) &&
      !word.toLowerCase().includes('xml') &&
      !word.toLowerCase().includes('ppt')
    );

    // Remove duplicates while preserving order
    const uniqueWords = [...new Set(words)];

    return uniqueWords.join(' ').trim();
  } catch (error) {
    console.error('Error extracting PPTX text:', error);
    return '';
  }
};

// Helper function to validate if content is meaningful text
const isValidTextContent = (content: string): boolean => {
  if (!content || content.length < 2) return false;
  if (content.match(/^[\d\s\-_\.]+$/)) return false;
  if (content.toLowerCase().includes('xml')) return false;
  if (content.toLowerCase().includes('http')) return false;
  if (content.toLowerCase().includes('xmlns')) return false;
  if (content.toLowerCase().includes('microsoft')) return false;
  if (content.toLowerCase().includes('powerpoint')) return false;
  if (content.toLowerCase().includes('slide')) return false;
  if (content.toLowerCase().includes('ppt')) return false;
  if (content.match(/^[^a-zA-Z]*$/)) return false;

  return true;
};

// Extract text from PPT files (older PowerPoint format)
const extractTextFromPPT = async (arrayBuffer: ArrayBuffer): Promise<string> => {
  try {
    const uint8Array = new Uint8Array(arrayBuffer);
    let text = '';

    // Look for text patterns in PPT binary format
    // PPT files store text in specific binary structures
    let currentWord = '';
    let consecutiveTextChars = 0;

    for (let i = 0; i < uint8Array.length - 1; i++) {
      const char = uint8Array[i];
      const nextChar = uint8Array[i + 1];

      // Look for readable ASCII characters
      if (char >= 32 && char <= 126) {
        currentWord += String.fromCharCode(char);
        consecutiveTextChars++;
      } else if (char === 0 && nextChar >= 32 && nextChar <= 126) {
        // Skip null bytes that often appear in PPT files
        continue;
      } else {
        if (currentWord.length > 3 &&
            consecutiveTextChars > 3 &&
            !currentWord.includes('Microsoft') &&
            !currentWord.includes('PowerPoint') &&
            !currentWord.includes('slide') &&
            !currentWord.match(/^[\d\s\-_\.]+$/) &&
            !currentWord.toLowerCase().includes('ppt')) {
          text += currentWord + ' ';
        }
        currentWord = '';
        consecutiveTextChars = 0;
      }
    }

    // Add the last word if it's valid
    if (currentWord.length > 3 && consecutiveTextChars > 3) {
      text += currentWord;
    }

    return text.trim();
  } catch (error) {
    console.error('Error extracting PPT text:', error);
    return '';
  }
};

export const extractTextFromDocument = async (file: File): Promise<string> => {
  const fileType = getFileTypeFromMimeType(file.type) || getFileTypeFromExtension(file.name);
  
  if (!fileType) {
    throw new Error('Unsupported file type. Please upload PDF, Word, or PowerPoint documents.');
  }
  
  console.log('Extracting text from document type:', fileType);
  
  switch (fileType) {
    case 'pdf':
      return await extractTextFromPDF(file);
    case 'docx':
    case 'doc':
      return await extractTextFromWord(file);
    case 'pptx':
    case 'ppt':
      return await extractTextFromPowerPoint(file);
    default:
      throw new Error(`Unsupported file type: ${fileType}`);
  }
};
