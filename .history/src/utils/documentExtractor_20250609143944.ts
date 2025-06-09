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

    // For PPTX files (newer format), try to extract from XML structure
    if (file.name.toLowerCase().endsWith('.pptx')) {
      const text = await extractTextFromPPTX(arrayBuffer);
      console.log('PPTX text extracted, length:', text.length);
      return text;
    } else {
      // For older PPT files, use improved binary extraction
      const text = await extractTextFromPPT(arrayBuffer);
      console.log('PPT text extracted, length:', text.length);
      return text;
    }
  } catch (error) {
    console.error('Error extracting text from PowerPoint:', error);
    throw new Error(`Failed to extract text from PowerPoint: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Helper function for basic binary text extraction
const extractTextFromBinaryFile = async (arrayBuffer: ArrayBuffer, fileName: string): Promise<string> => {
  // This is a very basic text extraction that looks for readable text in binary files
  // For production use, you'd want to use proper libraries for each file type
  const uint8Array = new Uint8Array(arrayBuffer);
  let text = '';
  
  // Simple text extraction - look for sequences of printable ASCII characters
  let currentWord = '';
  for (let i = 0; i < uint8Array.length; i++) {
    const char = uint8Array[i];
    if (char >= 32 && char <= 126) { // Printable ASCII
      currentWord += String.fromCharCode(char);
    } else {
      if (currentWord.length > 3) { // Only keep words longer than 3 characters
        text += currentWord + ' ';
      }
      currentWord = '';
    }
  }
  
  // Add the last word if it's long enough
  if (currentWord.length > 3) {
    text += currentWord;
  }
  
  return text.trim();
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
