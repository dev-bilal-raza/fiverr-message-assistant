# Fiverr AI Message Assistant 🤖💬

## Overview

Fiverr AI Message Assistant is a powerful Chrome extension that leverages AI to help you craft more effective, professional, and contextually appropriate messages on Fiverr. Whether you're negotiating prices, clarifying project details, or requesting revisions, this tool provides intelligent suggestions to enhance your communication.

## 🌟 Features

- **AI-Powered Message Generation**: Create professional messages with AI assistance
- **Context-Aware Suggestions**: Analyzes your current conversation context
- **Multiple Communication Scenarios**:
  - Professional Inquiries
  - Project Clarification
  - Price Negotiation
  - Deadline Extension
  - Revision Requests

## 🛠 Tech Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- OpenAI API
- Chrome Extension API

## 🚀 Installation

### Prerequisites

- Node.js (v16+)
- npm or yarn
- OpenAI API Key

### Steps

1. Clone the repository
```bash
git clone https://github.com/your-username/fiverr-message-assistant.git
cd fiverr-message-assistant
```

2. Install dependencies
```bash
npm install
```

3. Build the project
```bash
npm run build
```

4. Load in Chrome
- Open Chrome and go to `chrome://extensions/`
- Enable "Developer mode"
- Click "Load unpacked"
- Select the `dist` folder

## 🔧 Configuration

1. Open the Chrome extension
2. Enter your OpenAI API Key in the popup
3. Start using the AI Message Assistant on Fiverr

## 🌈 Usage

1. Navigate to a Fiverr message page
2. Click the Fiverr AI Message Assistant icon
3. Select a communication scenario
4. Get AI-powered message suggestions
5. Copy and customize the suggested message

## 📦 Project Structure

```
fiverr-message-assistant/
│
├── src/
│   ├── assets/           # Static assets
│   ├── components/       # Reusable React components
│   ├── constants/        # Constant values and configurations
│   ├── lib/              # Utility functions
│   ├── pages/            # Page components
│   │   ├── Popup.tsx     # Extension popup page
│   │   └── ContentPage.tsx  # Injected content script
│   └── manifest.json     # Chrome extension manifest
│
├── public/               # Public assets
├── dist/                 # Build output
└── README.md             # Project documentation
```

## 🔒 Security

- API keys are stored securely in Chrome's local storage
- Masked display of API key
- No storage of message history

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## ⚠️ Disclaimer

- Requires an active OpenAI API Key
- Message suggestions are AI-generated and should be reviewed
- Compliance with Fiverr's terms of service is the user's responsibility

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## 🌍 Connect

- Project Link: [https://github.com/your-username/fiverr-message-assistant](https://github.com/your-username/fiverr-message-assistant)
- LinkedIn: [Your LinkedIn Profile]
- Twitter: [@YourTwitterHandle]

---

**Happy Communicating! 🚀**