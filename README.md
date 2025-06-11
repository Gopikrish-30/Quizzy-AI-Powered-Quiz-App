# 🧠 Quizzy - AI-Powered Quiz Generation App

Try it : https://quizzy-app-gopi30.vercel.app/

## ✨ Features

- 🤖 **AI-Powered Quiz Generation** - Creates intelligent questions from any topic using Google Gemini AI
- 📄 **Document Upload Support** - Extract content from PDF, Word (.docx/.doc), and PowerPoint (.pptx/.ppt) files
- 🎯 **Multiple Question Types** - Multiple choice questions with explanations
- ⏱️ **Real-time Timer** - Track quiz completion time
- 📊 **Detailed Results** - Comprehensive scoring and performance analysis
- 🎨 **Professional UI** - Clean, modern interface with responsive design
- 🔒 **Secure API Integration** - Environment-based API key management
- 📱 **Mobile Friendly** - Works perfectly on desktop and mobile devices

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **npm** or **yarn** package manager
- **Google Gemini API Key** - [Get your free API key](https://makersuite.google.com/app/apikey)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Gopikrish-30/Quizzy-AI-Powered-Quiz-App.git
   cd Quizzy-AI-Powered-Quiz-App
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   # Copy the example environment file
   cp .env.example .env.local
   ```

4. **Add your API key**

   Open `.env.local` and add your Gemini API key:
   ```env
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   ```

5. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. **Open your browser**

   Navigate to `http://localhost:8080` (or the port shown in your terminal)

## 🔑 Getting Your Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key
5. Add it to your `.env.local` file

**Note**: Keep your API key secure and never commit it to version control!

## 🛠️ Development Setup

### Project Structure
```
quizzy-app/
├── src/
│   ├── components/          # React components
│   │   ├── QuizSetup.tsx   # Quiz configuration
│   │   ├── QuizInterface.tsx # Quiz taking interface
│   │   └── QuizResults.tsx  # Results display
│   ├── utils/              # Utility functions
│   │   ├── geminiApi.ts    # AI API integration
│   │   ├── documentExtractor.ts # File processing
│   │   └── quizGenerator.ts # Quiz logic
│   ├── types/              # TypeScript types
│   └── pages/              # Page components
├── public/                 # Static assets
├── .env.example           # Environment variables template
└── vercel.json           # Deployment configuration
```


**Made with ❤️ by [Gopikrish-30](https://github.com/Gopikrish-30)**

⭐ Star this repository if you found it helpful!

</div>
