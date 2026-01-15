# nSuns Tracker Web

A comprehensive web application for tracking nSuns 5/3/1 workouts, body metrics, and analyzing the correlation between body weight and strength performance.

## Features

- **nSuns 5/3/1 Workout Tracking**: Track your nSuns program with automated weight calculations and progression
- **Body Metrics Tracking**: Log weight, body fat percentage, muscle mass, and body measurements
- **Real-Time Analytics**: View how your body weight affects your max PRs with visual charts
- **Strength-to-Weight Ratio Analysis**: Track your relative strength over time
- **Personal Records**: Automatic PR tracking with estimated 1RM calculations
- **Nutrition Tracking**: Log meals, calories, and macros (coming soon)
- **Progress Photos**: Upload and compare progress photos over time (coming soon)
- **User Authentication**: Secure login and data persistence

## Tech Stack

- **Framework**: Next.js 15 with TypeScript
- **Styling**: Tailwind CSS
- **Database**: SQLite with Prisma ORM
- **Authentication**: NextAuth.js
- **Charts**: Recharts
- **Date Handling**: date-fns

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd nSunsWeb
```

2. Install dependencies
```bash
npm install
```

3. Set up the database
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Seed database with exercises
npm run db:seed
```

4. Start the development server
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### First Time Setup

1. Create an account at `/auth/signup`
2. Sign in with your credentials
3. Start by logging your current body metrics
4. Begin tracking your nSuns workouts

### Dashboard Features

- **Overview**: Quick stats, insights, and recent workouts
- **Workouts**: Log new workouts and view workout history
- **Body Metrics**: Track weight, body fat %, and measurements
- **Analytics**: View detailed charts showing:
  - Body weight vs Max PR correlation
  - Strength-to-weight ratio trends
  - Personal records timeline
- **Nutrition**: Track daily nutrition (coming soon)

### Key Analytics

The **Body Weight vs Max PR Correlation** chart shows:
- How your body weight changes over time (blue area)
- How your estimated max lifts change (green line)
- Real-time correlation between the two metrics

This helps you:
- Optimize bulk/cut cycles
- Understand if weight gain is productive (muscle) or not
- Track relative strength improvements
- Make data-driven training decisions

## Database Schema

The application uses the following main models:
- **User**: User accounts and preferences
- **Exercise**: Exercise library
- **Workout**: Workout sessions
- **Set**: Individual sets with weight and reps
- **PersonalRecord**: PR tracking with estimated 1RM
- **BodyMetric**: Body measurements and composition
- **ProgressPhoto**: Progress photo timeline
- **NutritionLog**: Meal and macro tracking

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:migrate` - Run Prisma migrations
- `npm run db:seed` - Seed database with exercises
- `npm run db:studio` - Open Prisma Studio

## Project Structure

```
nSunsWeb/
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Database seed script
├── src/
│   ├── app/
│   │   ├── api/           # API routes
│   │   ├── auth/          # Authentication pages
│   │   ├── dashboard/     # Main dashboard
│   │   └── metrics/       # Body metrics pages
│   ├── components/        # React components
│   ├── lib/
│   │   ├── auth.ts        # NextAuth configuration
│   │   ├── prisma.ts      # Prisma client
│   │   ├── nsuns-calculator.ts  # nSuns program logic
│   │   └── analytics.ts   # Analytics utilities
│   └── types/             # TypeScript types
└── public/                # Static assets
```

## nSuns Program

The application implements the nSuns 5/3/1 LP (Linear Progression) program:

- **4-Day Program**: Bench, Squat, OHP, Deadlift
- **Automated Calculations**: Training max calculations and weight progressions
- **AMRAP Tracking**: Automatic progression recommendations based on AMRAP sets
- **Secondary Lifts**: Paired secondary movements for balanced training

## Analytics Formulas

- **Estimated 1RM**: Epley formula `weight × (1 + reps/30)`
- **Wilks Score**: Normalized strength score accounting for body weight
- **Strength-to-Weight Ratio**: `Estimated Max / Body Weight`
- **Trend Analysis**: Linear regression on recent data points

## Contributing

This is a personal project, but feel free to fork and modify for your own use.

## License

MIT

## Roadmap

- [ ] Complete workout logging interface
- [ ] Add nutrition tracking features
- [ ] Implement progress photo upload
- [ ] Add workout program customization
- [ ] Mobile app version
- [ ] Social features and workout sharing
- [ ] Advanced analytics and AI insights
