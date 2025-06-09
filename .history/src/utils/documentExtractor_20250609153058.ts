import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';
import JSZip from 'jszip';

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

    // For PPTX files, use JSZip to parse the ZIP structure
    if (file.name.toLowerCase().endsWith('.pptx')) {
      return await extractTextFromPPTXWithJSZip(file);
    } else {
      // For older PPT files, use binary extraction
      const arrayBuffer = await file.arrayBuffer();
      return await extractTextFromPPT(arrayBuffer);
    }
  } catch (error) {
    console.error('Error extracting text from PowerPoint:', error);
    throw new Error(`Failed to extract text from PowerPoint: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Extract text from PPTX using JSZip (browser-compatible)
const extractTextFromPPTXWithJSZip = async (file: File): Promise<string> => {
  try {
    console.log('Using JSZip for PPTX extraction');

    // Read the PPTX file as a ZIP archive
    const arrayBuffer = await file.arrayBuffer();
    const zip = await JSZip.loadAsync(arrayBuffer);

    console.log('PPTX ZIP loaded, files:', Object.keys(zip.files));

    const extractedTexts: string[] = [];

    // Look for slide files in the ZIP structure
    const slideFiles = Object.keys(zip.files).filter(filename =>
      filename.startsWith('ppt/slides/slide') && filename.endsWith('.xml')
    );

    console.log('Found slide files:', slideFiles);

    // Extract text from each slide
    for (const slideFile of slideFiles) {
      try {
        const slideContent = await zip.files[slideFile].async('text');
        const slideText = extractTextFromSlideXML(slideContent);
        if (slideText.trim()) {
          extractedTexts.push(slideText);
          console.log(`Extracted from ${slideFile}: ${slideText.substring(0, 100)}...`);
        }
      } catch (error) {
        console.warn(`Error extracting from ${slideFile}:`, error);
      }
    }

    // Also check for notes and other text content
    const notesFiles = Object.keys(zip.files).filter(filename =>
      filename.startsWith('ppt/notesSlides/') && filename.endsWith('.xml')
    );

    for (const notesFile of notesFiles) {
      try {
        const notesContent = await zip.files[notesFile].async('text');
        const notesText = extractTextFromSlideXML(notesContent);
        if (notesText.trim()) {
          extractedTexts.push(notesText);
          console.log(`Extracted notes from ${notesFile}: ${notesText.substring(0, 100)}...`);
        }
      } catch (error) {
        console.warn(`Error extracting notes from ${notesFile}:`, error);
      }
    }

    const finalText = extractedTexts.join(' ').trim();
    console.log('Total extracted text length:', finalText.length);
    console.log('Sample of extracted text:', finalText.substring(0, 300));

    if (finalText.length < 50) {
      throw new Error('PowerPoint file contains insufficient text content. The slides may contain primarily images, charts, or visual elements with minimal extractable text. Try using slides with more text content or convert the presentation to PDF format.');
    }

    return finalText;
  } catch (error) {
    console.error('Error with JSZip PPTX extraction:', error);
    throw error;
  }
};

// Extract text from PowerPoint slide XML content
const extractTextFromSlideXML = (xmlContent: string): string => {
  try {
    const textParts: string[] = [];

    // PowerPoint XML uses various tags for text content
    // Look for text in <a:t> tags (text runs)
    const textRunMatches = xmlContent.match(/<a:t[^>]*>([^<]+)<\/a:t>/g) || [];
    textRunMatches.forEach(match => {
      const text = match.replace(/<[^>]+>/g, '').trim();
      if (text && text.length > 0) {
        textParts.push(text);
      }
    });

    // Look for text in <a:p> tags (paragraphs)
    const paragraphMatches = xmlContent.match(/<a:p[^>]*>([^<]*?)<\/a:p>/g) || [];
    paragraphMatches.forEach(match => {
      // Extract text from within the paragraph, looking for nested <a:t> tags
      const innerTextMatches = match.match(/<a:t[^>]*>([^<]+)<\/a:t>/g) || [];
      innerTextMatches.forEach(innerMatch => {
        const text = innerMatch.replace(/<[^>]+>/g, '').trim();
        if (text && text.length > 0) {
          textParts.push(text);
        }
      });
    });

    // Look for text in title and content placeholders
    const titleMatches = xmlContent.match(/<p:ph[^>]*type="title"[^>]*>.*?<a:t[^>]*>([^<]+)<\/a:t>.*?<\/p:ph>/gs) || [];
    titleMatches.forEach(match => {
      const textMatches = match.match(/<a:t[^>]*>([^<]+)<\/a:t>/g) || [];
      textMatches.forEach(textMatch => {
        const text = textMatch.replace(/<[^>]+>/g, '').trim();
        if (text && text.length > 0) {
          textParts.push(text);
        }
      });
    });

    // Look for text in content placeholders
    const contentMatches = xmlContent.match(/<p:ph[^>]*type="body"[^>]*>.*?<a:t[^>]*>([^<]+)<\/a:t>.*?<\/p:ph>/gs) || [];
    contentMatches.forEach(match => {
      const textMatches = match.match(/<a:t[^>]*>([^<]+)<\/a:t>/g) || [];
      textMatches.forEach(textMatch => {
        const text = textMatch.replace(/<[^>]+>/g, '').trim();
        if (text && text.length > 0) {
          textParts.push(text);
        }
      });
    });

    // Remove duplicates and join
    const uniqueTexts = [...new Set(textParts)];
    return uniqueTexts.join(' ').trim();

  } catch (error) {
    console.error('Error extracting text from slide XML:', error);
    return '';
  }
};

// Extract text from the JSON structure returned by pptx2json
const extractTextFromPPTXJson = (json: any): string => {
  const textParts: string[] = [];

  try {
    // Navigate through the JSON structure to find text content
    if (json && json.slides && Array.isArray(json.slides)) {
      json.slides.forEach((slide: any, slideIndex: number) => {
        console.log(`Processing slide ${slideIndex + 1}`);

        // Extract text from slide elements
        if (slide.elements && Array.isArray(slide.elements)) {
          slide.elements.forEach((element: any) => {
            const elementText = extractTextFromElement(element);
            if (elementText) {
              textParts.push(elementText);
            }
          });
        }

        // Also check for text in other possible locations
        if (slide.content) {
          const contentText = extractTextFromContent(slide.content);
          if (contentText) {
            textParts.push(contentText);
          }
        }
      });
    }

    // Join all text parts
    const result = textParts.join(' ').trim();
    console.log('Total text parts found:', textParts.length);

    return result;
  } catch (error) {
    console.error('Error extracting text from JSON:', error);
    return textParts.join(' ').trim();
  }
};

// Extract text from individual elements
const extractTextFromElement = (element: any): string => {
  const textParts: string[] = [];

  try {
    // Check for direct text content
    if (element.text && typeof element.text === 'string') {
      textParts.push(element.text);
    }

    // Check for text in various possible properties
    if (element.content && typeof element.content === 'string') {
      textParts.push(element.content);
    }

    if (element.value && typeof element.value === 'string') {
      textParts.push(element.value);
    }

    // Recursively check nested elements
    if (element.children && Array.isArray(element.children)) {
      element.children.forEach((child: any) => {
        const childText = extractTextFromElement(child);
        if (childText) {
          textParts.push(childText);
        }
      });
    }

    // Check for text runs or paragraphs
    if (element.runs && Array.isArray(element.runs)) {
      element.runs.forEach((run: any) => {
        if (run.text && typeof run.text === 'string') {
          textParts.push(run.text);
        }
      });
    }

    if (element.paragraphs && Array.isArray(element.paragraphs)) {
      element.paragraphs.forEach((para: any) => {
        const paraText = extractTextFromElement(para);
        if (paraText) {
          textParts.push(paraText);
        }
      });
    }
  } catch (error) {
    console.error('Error extracting text from element:', error);
  }

  return textParts.join(' ').trim();
};

// Extract text from content objects
const extractTextFromContent = (content: any): string => {
  if (typeof content === 'string') {
    return content;
  }

  if (typeof content === 'object' && content !== null) {
    return extractTextFromElement(content);
  }

  return '';
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
    const extractedWords: string[] = [];

    // Look for text patterns in PPT binary format
    let currentWord = '';
    let wordStartIndex = 0;

    for (let i = 0; i < uint8Array.length; i++) {
      const char = uint8Array[i];

      // Check for printable ASCII characters
      if (char >= 32 && char <= 126 && char !== 127) {
        if (currentWord === '') {
          wordStartIndex = i;
        }
        currentWord += String.fromCharCode(char);
      } else {
        // End of word - check if it's valid
        if (currentWord.length >= 3) {
          // Additional validation for meaningful content
          if (isValidPPTWord(currentWord, uint8Array, wordStartIndex)) {
            extractedWords.push(currentWord);
          }
        }
        currentWord = '';
      }
    }

    // Add the last word if valid
    if (currentWord.length >= 3 && isValidPPTWord(currentWord, uint8Array, wordStartIndex)) {
      extractedWords.push(currentWord);
    }

    // Filter and clean the extracted words
    const cleanedWords = extractedWords
      .filter(word =>
        word.length > 2 &&
        !word.match(/^[\d\-_\.]+$/) &&
        !word.toLowerCase().includes('microsoft') &&
        !word.toLowerCase().includes('powerpoint') &&
        !word.toLowerCase().includes('slide') &&
        !word.toLowerCase().includes('ppt') &&
        word.match(/[a-zA-Z]/) // Must contain at least one letter
      )
      .slice(0, 1000); // Limit to prevent too much noise

    // Remove duplicates while preserving order
    const uniqueWords = [...new Set(cleanedWords)];

    return uniqueWords.join(' ').trim();
  } catch (error) {
    console.error('Error extracting PPT text:', error);
    return '';
  }
};

// Helper function to validate PPT words
const isValidPPTWord = (word: string, uint8Array: Uint8Array, startIndex: number): boolean => {
  // Basic validation
  if (word.length < 3 || word.length > 50) return false;
  if (!word.match(/[a-zA-Z]/)) return false;
  if (word.match(/^[\d\-_\.]+$/)) return false;

  // Check context - look for patterns that suggest this is actual content
  const contextBefore = startIndex > 10 ? uint8Array.slice(startIndex - 10, startIndex) : new Uint8Array();
  const contextAfter = uint8Array.slice(startIndex + word.length, startIndex + word.length + 10);

  // If surrounded by too many null bytes, it might be metadata
  const nullBytesBefore = Array.from(contextBefore).filter(b => b === 0).length;
  const nullBytesAfter = Array.from(contextAfter).filter(b => b === 0).length;

  if (nullBytesBefore > 8 || nullBytesAfter > 8) return false;

  // Exclude common metadata words
  const metadataWords = ['microsoft', 'powerpoint', 'slide', 'ppt', 'office', 'version', 'created'];
  if (metadataWords.some(meta => word.toLowerCase().includes(meta))) return false;

  return true;
};

// Alternative aggressive text extraction for PowerPoint files
const extractTextAlternative = async (arrayBuffer: ArrayBuffer): Promise<string> => {
  try {
    const uint8Array = new Uint8Array(arrayBuffer);
    const extractedText: string[] = [];

    // More aggressive approach - extract any sequence of readable characters
    let currentText = '';
    let consecutiveReadableChars = 0;

    for (let i = 0; i < uint8Array.length; i++) {
      const char = uint8Array[i];

      // Include more character ranges (letters, numbers, common punctuation)
      if ((char >= 32 && char <= 126) || char === 9 || char === 10 || char === 13) {
        currentText += String.fromCharCode(char);
        if (char >= 65 && char <= 122) { // Letters
          consecutiveReadableChars++;
        }
      } else {
        // End of text sequence
        if (currentText.length >= 5 && consecutiveReadableChars >= 3) {
          // Clean and validate the text
          const cleanText = currentText
            .replace(/[\x00-\x1F\x7F-\x9F]/g, ' ') // Remove control characters
            .replace(/\s+/g, ' ') // Normalize whitespace
            .trim();

          if (cleanText.length >= 5 &&
              cleanText.match(/[a-zA-Z]/) &&
              !cleanText.toLowerCase().includes('microsoft') &&
              !cleanText.toLowerCase().includes('powerpoint') &&
              !cleanText.toLowerCase().includes('slide')) {
            extractedText.push(cleanText);
          }
        }
        currentText = '';
        consecutiveReadableChars = 0;
      }
    }

    // Join all extracted text pieces
    const result = extractedText.join(' ').trim();

    // Remove duplicates and clean up
    const words = result.split(/\s+/).filter(word =>
      word.length > 2 &&
      word.match(/[a-zA-Z]/)
    );

    const uniqueWords = [...new Set(words)];
    return uniqueWords.join(' ').trim();

  } catch (error) {
    console.error('Error in alternative text extraction:', error);
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
