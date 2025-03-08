# 🕳️ Rabbit Hole

A chat application that lets you explore alternate conversation paths, like diving down different rabbit holes. Create branches at any point in a conversation to explore "what if" scenarios, with an interactive visualization of your conversation multiverse.

## Features

- 🌳 Visual branch navigation using React Flow
- 💬 Organized chat conversations in branches
- 🤖 AI-powered branch title generation
- 🔄 Real-time updates
- 📱 Responsive design

## Prerequisites

- Node.js 16.8 or later
- OpenAI API key
- npm or yarn

## Setup

1. Clone the repository:
```bash
git clone [your-repo-url]
cd [your-repo-name]
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env.local` file in the root directory:
```env
OPENAI_API_KEY=your_api_key_here
```

4. Start the development server:
```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Usage

- Navigate through different conversation branches in the flow view
- Click on nodes to view conversation details
- Create new branches to explore alternative conversation paths
- Automatically generated titles help identify branch content

## Tech Stack

- Next.js 14
- React Flow
- OpenAI API
- Zustand for state management
- TypeScript

## Deployment

The easiest way to deploy is using the [Vercel Platform](https://vercel.com/new).

1. Push your code to a Git repository
2. Import your project to Vercel
3. Add your environment variables
4. Deploy!
