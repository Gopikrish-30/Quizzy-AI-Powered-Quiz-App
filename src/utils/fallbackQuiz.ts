
import { Quiz, Question } from '../types/quiz';

// Enhanced sample quiz data for fallback (if API fails)
const sampleQuizData: { [key: string]: Question[] } = {
  'machine learning': [
    {
      id: 1,
      question: "Which of the following is NOT a type of machine learning?",
      options: ["Supervised Learning", "Unsupervised Learning", "Reinforcement Learning", "Deterministic Learning"],
      correctAnswer: 3,
      explanation: "Deterministic Learning is not a recognized type of machine learning."
    },
    {
      id: 2,
      question: "What is overfitting in machine learning?",
      options: ["When a model performs well on training data but poorly on test data", "When a model is too simple", "When training takes too long", "When data is insufficient"],
      correctAnswer: 0,
      explanation: "Overfitting occurs when a model learns the training data too well, including noise, making it perform poorly on new data."
    }
  ],
  'social': [
    {
      id: 1,
      question: "What is the primary function of social institutions?",
      options: ["To create conflict", "To organize and regulate human behavior", "To limit individual freedom", "To generate profit"],
      correctAnswer: 1,
      explanation: "Social institutions serve to organize and regulate human behavior within society."
    },
    {
      id: 2,
      question: "Which of the following is considered a primary social group?",
      options: ["A school class", "A family", "A political party", "A corporation"],
      correctAnswer: 1,
      explanation: "Family is considered a primary social group due to its intimate, personal relationships."
    },
    {
      id: 3,
      question: "What does socialization refer to?",
      options: ["Making friends", "The process of learning social norms and values", "Attending social events", "Using social media"],
      correctAnswer: 1,
      explanation: "Socialization is the lifelong process through which individuals learn the norms, values, and behaviors of their society."
    },
    {
      id: 4,
      question: "Which sociologist is known for the concept of 'social solidarity'?",
      options: ["Max Weber", "Karl Marx", "Emile Durkheim", "Auguste Comte"],
      correctAnswer: 2,
      explanation: "Emile Durkheim developed the concept of social solidarity to explain how societies maintain cohesion."
    },
    {
      id: 5,
      question: "What is social stratification?",
      options: ["The study of social media", "The ranking of people in social hierarchies", "Social networking", "Community organization"],
      correctAnswer: 1,
      explanation: "Social stratification refers to the way society is organized into hierarchical layers or strata based on factors like wealth, power, and prestige."
    }
  ],
  'history': [
    {
      id: 1,
      question: "Which event is considered the beginning of World War I?",
      options: ["The assassination of Archduke Franz Ferdinand", "The invasion of Poland", "The bombing of Pearl Harbor", "The Russian Revolution"],
      correctAnswer: 0,
      explanation: "The assassination of Archduke Franz Ferdinand of Austria-Hungary in 1914 triggered the events that led to World War I."
    }
  ],
  'science': [
    {
      id: 1,
      question: "What is the basic unit of life?",
      options: ["Atom", "Cell", "Molecule", "Tissue"],
      correctAnswer: 1,
      explanation: "The cell is considered the basic unit of life as it is the smallest unit that exhibits all characteristics of living things."
    }
  ]
};

export const generateFallbackQuiz = async (topic: string, numQuestions: number): Promise<Quiz> => {
  console.log(`Generating fallback quiz for topic: ${topic}`);
  
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const topicKey = topic.toLowerCase();
  let questions: Question[] = [];
  
  // Find matching questions from sample data
  for (const [key, value] of Object.entries(sampleQuizData)) {
    if (topicKey.includes(key) || key.includes(topicKey)) {
      questions = [...value];
      console.log(`Found ${questions.length} questions for topic: ${key}`);
      break;
    }
  }
  
  // If no specific match, generate topic-specific questions
  if (questions.length === 0) {
    console.log(`No specific questions found, generating general questions for: ${topic}`);
    questions = generateTopicSpecificQuestions(topic);
  }
  
  // Slice to requested number of questions
  questions = questions.slice(0, numQuestions);
  
  // Re-number questions to ensure proper IDs
  questions = questions.map((q, index) => ({
    ...q,
    id: index + 1
  }));
  
  return {
    id: Date.now().toString(),
    title: `${topic} Quiz`,
    topic,
    questions,
    totalQuestions: questions.length
  };
};

const generateTopicSpecificQuestions = (topic: string): Question[] => {
  const topicLower = topic.toLowerCase();
  
  // Generate questions based on common educational topics
  if (topicLower.includes('math') || topicLower.includes('mathematics')) {
    return [
      {
        id: 1,
        question: "What is the result of 15 + 27?",
        options: ["42", "41", "43", "40"],
        correctAnswer: 0,
        explanation: "15 + 27 = 42"
      },
      {
        id: 2,
        question: "What is the square root of 64?",
        options: ["6", "7", "8", "9"],
        correctAnswer: 2,
        explanation: "8 × 8 = 64, so the square root of 64 is 8."
      }
    ];
  }
  
  if (topicLower.includes('english') || topicLower.includes('literature')) {
    return [
      {
        id: 1,
        question: "What is a metaphor?",
        options: ["A direct comparison using 'like' or 'as'", "A figure of speech that directly compares two things", "A type of poem", "A grammatical error"],
        correctAnswer: 1,
        explanation: "A metaphor is a figure of speech that directly compares two different things without using 'like' or 'as'."
      }
    ];
  }
  
  if (topicLower.includes('computer') || topicLower.includes('programming') || topicLower.includes('coding')) {
    return [
      {
        id: 1,
        question: "What does HTML stand for?",
        options: ["High Technology Modern Language", "HyperText Markup Language", "Home Tool Management Language", "Hyperlink and Text Markup Language"],
        correctAnswer: 1,
        explanation: "HTML stands for HyperText Markup Language, used for creating web pages."
      }
    ];
  }
  
  // Default questions for any topic
  return [
    {
      id: 1,
      question: `What is the most important aspect to understand about ${topic}?`,
      options: [
        "Its fundamental principles",
        "Its historical background",
        "Its practical applications",
        "Its future potential"
      ],
      correctAnswer: 0,
      explanation: `Understanding the fundamental principles of ${topic} provides a solid foundation for deeper learning.`
    },
    {
      id: 2,
      question: `Which approach is most effective when studying ${topic}?`,
      options: [
        "Memorization without understanding",
        "Combining theory with practical examples",
        "Avoiding complex concepts",
        "Learning only the basics"
      ],
      correctAnswer: 1,
      explanation: "Combining theoretical knowledge with practical examples leads to better understanding and retention."
    },
    {
      id: 3,
      question: `What is a common misconception about ${topic}?`,
      options: [
        "It's too difficult to learn",
        "It has no real-world applications",
        "It's only for experts",
        "All of the above"
      ],
      correctAnswer: 3,
      explanation: `Many subjects, including ${topic}, are accessible to learners at all levels with proper guidance and practice.`
    }
  ];
};

export const generateQuestionsFromText = (text: string, numQuestions: number): Question[] => {
  // This is a simplified approach for fallback
  const sentences = text.split('.').filter(s => s.trim().length > 20);
  const questions: Question[] = [];
  
  for (let i = 0; i < Math.min(numQuestions, sentences.length); i++) {
    const sentence = sentences[i].trim();
    if (sentence.length > 10) {
      questions.push({
        id: i + 1,
        question: `Based on the document, which statement is most accurate about: "${sentence.substring(0, 50)}..."?`,
        options: [
          "This information is correct as stated",
          "This information needs additional context",
          "This information is incomplete",
          "This information requires verification"
        ],
        correctAnswer: 0,
        explanation: "Based on the context from the uploaded document."
      });
    }
  }
  
  return questions;
};
