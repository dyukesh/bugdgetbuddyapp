# Budget Buddy

A modern web application for personal finance management, built with Next.js, Supabase, and Stripe integration.

## Features

- User authentication and authorization
- Expense tracking and categorization
- Income management
- Financial reports and analytics
- Multi-currency support
- Privacy policy compliance

## Tech Stack

- Next.js 15.2.2
- TypeScript
- Supabase (Authentication & Database)
- Stripe (Payment Processing)
- Tailwind CSS (Styling)

## Getting Started

1. Clone the repository

```bash
git clone <your-repo-url>
cd budget-buddy
```

2. Install dependencies

```bash
npm install
```

3. Set up environment variables

- Copy `.env.example` to `.env.local`
- Fill in your API keys and configuration values

4. Run the development server

```bash
npm run dev
```

The application will be available at `http://localhost:30001`

## Environment Variables

Required environment variables are documented in `.env.example`. You'll need to set up:

- Supabase project credentials
- Stripe API keys (for payment processing)
- Google Cloud API key (for additional features)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
