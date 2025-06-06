# 🎵 DiscogTuneTracker

**Discover the most collected music across genres with an artistic, interactive experience.**

A beautiful music discovery web application that showcases popular albums using the Discogs database. Experience music through an artistic scattered album cover layout with smooth animations and detailed collection statistics.

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-Visit_App-blue?style=for-the-badge)](https://your-deployed-url.vercel.app)
[![GitHub](https://img.shields.io/badge/⭐_Star_on-GitHub-black?style=for-the-badge)](https://github.com/alinealinealine/discog-discover)

## ✨ Features

### 🎨 **Artistic Album Discovery**
- **Scattered Album Layout**: Interactive, artistically arranged album covers with random positioning and rotation
- **Smooth Animations**: Framer Motion powered hover effects and transitions
- **Progressive Image Loading**: Thumbnails load instantly, high-resolution images enhance progressively

### 🎯 **Smart Music Browsing**
- **25+ Music Genres**: Rock, Jazz, Electronic, House, Techno, Hip-Hop, and more
- **Intelligent Search**: Multi-tier fallback (style → genre → general search) for maximum results
- **Collection Data**: Real-time statistics showing how many people want/own each release

### 🔗 **Seamless Integration**
- **YouTube Links**: One-click search for tracks on YouTube
- **Discogs Integration**: Direct links to original release pages
- **Mobile Responsive**: Beautiful experience on all screen sizes

### ⚡ **Performance & Analytics**
- **Serverless Architecture**: Fast, scalable Vercel deployment
- **Built-in Analytics**: Track user engagement and popular genres
- **Optimized Loading**: Smart caching and progressive enhancement

## 🖼️ Screenshots

<img width="673" alt="image" src="https://github.com/user-attachments/assets/dfcd4c1c-2a61-46db-aaeb-984d2722f083" />


## 🛠️ Tech Stack

### **Frontend**
- **React 18** - Modern UI library with hooks
- **TypeScript** - Type safety and better developer experience  
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations and transitions
- **TanStack Query** - Powerful data fetching and caching

### **Backend & APIs**
- **Vercel Serverless Functions** - Scalable API endpoints
- **Discogs API** - Comprehensive music database
- **Node.js** - JavaScript runtime for serverless functions

### **Tools & Deployment**
- **Vite** - Fast build tool and development server
- **Vercel** - Deployment platform with edge functions
- **Vercel Analytics** - Built-in web analytics

## 🚀 Getting Started

### Prerequisites
- **Node.js 18+** - [Download here](https://nodejs.org/)
- **npm** or **yarn** package manager
- **Discogs API Token** - [Get your free token](https://www.discogs.com/settings/developers)

### 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/alinealinealine/discog-discover.git
   cd discog-discover
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   
   Create a `.env` file in the root directory:
   ```env
   # For development (frontend)
   VITE_DISCOGS_TOKEN=your_discogs_token_here
   
   # For production (serverless functions)
   DISCOGS_TOKEN=your_discogs_token_here
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```
   
   🎉 **Visit http://localhost:5000 to see your app!**

### 🏗️ Architecture Overview

```
├── 🖥️  client/              # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components (buttons, cards, etc.)
│   │   ├── pages/           # App pages (home, 404)
│   │   ├── lib/             # Utilities, API client, React Query setup
│   │   └── hooks/           # Custom React hooks
│
├── ⚡ api/                  # Vercel serverless functions
│   ├── releases/[style].ts  # Get releases by music genre/style
│   ├── release/[id].ts      # Get high-res images for specific release
│   ├── styles.ts            # Available music genres/styles
│   └── youtube-search.ts    # Generate YouTube search URLs
│
└── 🔧 shared/              # TypeScript schemas shared between client/server
```

## 🌐 Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Connect to Vercel**
   - Visit [vercel.com](https://vercel.com) and sign up
   - Import your GitHub repository
   - Vercel will auto-detect the configuration

3. **Add Environment Variables**
   - In Vercel dashboard → Settings → Environment Variables
   - Add: `DISCOGS_TOKEN` = `your_discogs_token_here`

4. **Deploy**
   - Vercel deploys automatically on every push to main
   - Your app will be live at `https://your-app-name.vercel.app`

### Build for Production (Local)

```bash
# Build the frontend
npm run build:client

# The built files will be in ./dist/
```

## 🎯 How It Works

### 🔍 **Music Discovery Flow**
1. **Choose Genre** → Select from 25+ music styles (Rock, Jazz, Electronic, etc.)
2. **Smart Search** → App searches Discogs using intelligent fallback:
   - First: Search by style (e.g., "House")
   - Fallback: Search by genre (e.g., "Electronic") 
   - Final: General search for maximum results
3. **Visual Display** → Albums appear in artistic scattered layout
4. **Interaction** → Hover/touch reveals details, collection stats, and links

### ⚡ **Performance Features**
- **Progressive Loading**: Thumbnails → High-resolution images
- **Smart Caching**: API responses cached for faster subsequent loads
- **Rate Limiting**: Intelligent API call management
- **Mobile Optimized**: Touch-friendly interactions and responsive design

## 🤝 Contributing

We love contributions! Here's how to get involved:

### 🐛 **Bug Reports**
- Use GitHub Issues with detailed reproduction steps
- Include browser/device information
- Screenshots are helpful!

### ✨ **Feature Requests**
- Describe the feature and its use case
- Check existing issues to avoid duplicates
- Consider implementation complexity

### 🔧 **Development**
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes with proper TypeScript types
4. Test thoroughly (API endpoints, mobile responsiveness)
5. Commit: `git commit -m 'Add amazing feature'`
6. Push: `git push origin feature/amazing-feature`
7. Open a Pull Request

### 📋 **Development Guidelines**
- **Code Style**: Follow existing TypeScript/React patterns
- **Testing**: Test API endpoints and UI interactions
- **Mobile First**: Ensure responsive design
- **Performance**: Monitor bundle size and API usage
- **Analytics**: Add tracking for new user interactions

## 📊 Analytics & Insights

The app includes **Vercel Analytics** to understand usage:
- **Popular Genres**: Which music styles users explore most
- **User Engagement**: Time spent, interactions per session
- **Geographic Data**: Where music discovery happens globally
- **Performance Metrics**: Loading times, API response rates

*Privacy-focused analytics with no personal data collection*

## 🐛 Troubleshooting

### Common Issues

**Q: "Failed to fetch music data" error**
- **A**: Check your `DISCOGS_TOKEN` environment variable
- Verify token is valid at [Discogs Developer Settings](https://www.discogs.com/settings/developers)

**Q: Images not loading or low quality**
- **A**: High-res images load progressively. Wait a moment for enhancement
- Some releases may only have low-resolution artwork available

**Q: Limited results for certain genres**
- **A**: The app tries multiple search strategies. Some niche genres may have fewer popular releases

**Q: Mobile experience issues**
- **A**: Ensure you're using touch gestures. Some features are optimized for hover on desktop

## 📄 License

**MIT License** - Feel free to use this project for learning, personal projects, or commercial applications.

See the [LICENSE](LICENSE) file for full details.

## 🙏 Acknowledgments

### **APIs & Services**
- **[Discogs](https://www.discogs.com/developers/)** - Incredible music database and API
- **[Vercel](https://vercel.com)** - Seamless deployment and serverless functions
- **[Vercel Analytics](https://vercel.com/analytics)** - Privacy-focused web analytics

### **Open Source Tools**
- **[React](https://reactjs.org/)** - The foundation of modern web apps
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety and developer experience
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Framer Motion](https://www.framer.com/motion/)** - Beautiful animations made simple
- **[TanStack Query](https://tanstack.com/query/)** - Powerful data fetching

### **Community**
- **Music Collectors** worldwide who contribute to Discogs database
- **Open Source Contributors** who make projects like this possible
- **Music Lovers** who will discover new favorites through this app

---

## 🌟 Show Your Support

**If you found this project helpful or interesting:**

⭐ **Star this repository** on GitHub  
🐦 **Share on social media** with `#DiscogTuneTracker`  
🎵 **Discover new music** and tell your friends  
🤝 **Contribute** with issues, PRs, or feedback  

---

**Built with ❤️ for music discovery and open source**

*Created by [@alinealinealine](https://github.com/alinealinealine) | Powered by [Discogs](https://discogs.com)* 
