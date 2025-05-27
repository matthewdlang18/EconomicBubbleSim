# Economic Bubble Simulation - Educational Tool

An interactive educational web application that simulates the 2008 housing crisis, allowing students to experience economic concepts through role-playing as homebuyers, investors, and regulators.

## Features

- **Role-Based Learning**: Play as homebuyer, investor, or regulator
- **3D Market Visualization**: Real-time 3D representation of market dynamics
- **Historical Simulation**: Based on 2005-2009 housing crisis timeline
- **Interactive Controls**: Policy adjustments and market interventions
- **Real-time Collaboration**: WebSocket-based multiplayer sessions
- **Educational Dashboard**: Economic charts and market analysis

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Radix UI
- **3D Graphics**: React Three Fiber (Three.js)
- **Backend**: Express.js, TypeScript, WebSocket
- **Database**: PostgreSQL (production) / SQLite (development)
- **ORM**: Drizzle ORM
- **Build Tool**: Vite

## Local Development Setup

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/matthewdlang18/EconomicBubbleSim.git
   cd EconomicBubbleSim
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   The default `.env` uses SQLite for local development.

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Access the application**
   Open http://localhost:3000 in your browser

## Production Deployment

### Option 1: Deploy to Vercel

1. **Connect to Vercel**
   - Push your code to GitHub
   - Connect your repository to Vercel
   - Vercel will automatically detect the Vite configuration

2. **Set Environment Variables**
   In Vercel dashboard, add:
   ```
   DATABASE_URL=postgresql://user:pass@host:port/database
   NODE_ENV=production
   SESSION_SECRET=your-secure-random-secret
   ```

3. **Set up PostgreSQL Database**
   - Use Vercel Postgres, Neon, or any PostgreSQL provider
   - Run migrations: `npm run db:push`

### Option 2: Deploy to Railway

1. **Connect to Railway**
   ```bash
   npx @railway/cli login
   railway link
   ```

2. **Add PostgreSQL**
   ```bash
   railway add postgresql
   ```

3. **Deploy**
   ```bash
   railway up
   ```

### Option 3: Deploy to Render

1. **Create Web Service** on Render dashboard
2. **Connect your repository**
3. **Set build command**: `npm run build`
4. **Set start command**: `npm start`
5. **Add environment variables** in Render dashboard
6. **Add PostgreSQL database** from Render's Add-ons

### Option 4: Deploy to DigitalOcean App Platform

1. **Create new App** in DigitalOcean
2. **Connect GitHub repository**
3. **Configure build settings**:
   - Build Command: `npm run build`
   - Run Command: `npm start`
4. **Add PostgreSQL database** component
5. **Set environment variables**

## Environment Variables

### Required
- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Secret key for session encryption

### Optional
- `NODE_ENV`: "development" or "production"
- `PORT`: Port number (default: 3000)

## Database Setup

### PostgreSQL (Production)
```bash
# Push schema to database
npm run db:push
```

### SQLite (Development)
The SQLite database is automatically created when you start the app.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run check` - Run TypeScript type checking
- `npm run db:push` - Push database schema

## Educational Use

This simulation is designed for:
- **Economics courses**: Understanding market dynamics and bubbles
- **Finance education**: Learning about regulatory policy impacts
- **Business schools**: Case study of the 2008 financial crisis
- **Policy studies**: Exploring regulatory interventions

### Learning Objectives

Students will learn about:
- Causes and effects of economic bubbles
- Role of regulatory policy in market stability
- Impact of investor behavior on housing markets
- Relationship between monetary policy and market dynamics
- Real-world application of economic theories

## Architecture

```
├── client/          # React frontend
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── hooks/       # React hooks
│   │   ├── lib/         # Utility libraries
│   │   └── pages/       # Page components
├── server/          # Express backend
│   ├── routes.ts        # API routes
│   ├── websocket.ts     # WebSocket server
│   ├── economicEngine.ts # Simulation logic
│   └── db.ts           # Database connection
├── shared/          # Shared types/schemas
└── dist/           # Production build
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `npm run check`
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For educational institutions interested in using this tool, please contact [your-email] for setup assistance and customization options.
