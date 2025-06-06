# DiscogTuneTracker

A modern web application that helps you discover the most collected music across different genres using the Discogs API. Built with React, TypeScript, and Tailwind CSS.

## Features

- Browse most collected music by genre
- High-resolution album cover display
- Interactive album grid with hover effects
- Direct links to YouTube and Discogs
- Real-time collection statistics
- Responsive design for all devices

## Tech Stack

- React 18
- TypeScript
- Tailwind CSS
- Vite
- React Query
- Framer Motion
- Discogs API

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn
- Discogs API token

### Installation

1. Clone the repository:
```bash
git clone https://github.com/alinealinealine/discog-discover.git
cd discog-discover
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
VITE_DISCOGS_TOKEN=your_discogs_token_here
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## Deployment

The application can be deployed to any static hosting service like Vercel, Netlify, or GitHub Pages.

### Build for Production

```bash
npm run build
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Discogs API](https://www.discogs.com/developers/) for providing the music database
- [React](https://reactjs.org/) for the frontend framework
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Framer Motion](https://www.framer.com/motion/) for animations 