# Crowdin Apps Quick Start: Next.js

Welcome! This repository contains the source code for the sample application built in the **Crowdin [Quick Start](https://developer.crowdin.com/crowdin-apps-quick-start)** tutorial.

This project is an advanced sample application that demonstrates core concepts for building a production-ready Crowdin App.

[**`Home`**](https://crowdin.com) | [**`Quick Start`**](https://developer.crowdin.com/crowdin-apps-quick-start) | [**`Developer Portal`**](https://developer.crowdin.com/)

## About This Repository

This repository contains a sample application built with **Next.js** and **TypeScript**. It's designed to demonstrate key features and best practices for building a production-ready Crowdin App, featuring:

- **Dynamic App Manifest**: Generating `manifest.json` based on environment variables.
- **Project Menu Module**: Rendering a custom tab within a Crowdin project.
- **Event Handling**: Securely processing `installed` and `uninstall` lifecycle events.
- **JWT Middleware**: Verifying signed requests from Crowdin to protect API endpoints.
- **Database Integration**: Using Prisma to persist organization credentials.
- **Custom File Format**: Processing unique file types and generating live previews.
- **Blob Storage**: Handling large data payloads efficiently with Vercel Blob.

## Running Locally

Make sure you have [Node.js (v18 or later)](https://nodejs.org/) installed.

1. **Clone the repository:**

```sh
git clone https://github.com/crowdin/apps-quick-start-nextjs.git
cd apps-quick-start-nextjs
```
*To follow the tutorial from its starting point, check out the `v1.0-basic` tag:*
```sh
git checkout v1.0-basic
```

2. **Install dependencies:**

Choose your preferred package manager:
```sh
# Using npm
npm install

# Or using pnpm
pnpm install
```

3. **Configure your environment:**

Copy the example environment file. This file is ignored by Git, so it's safe for your credentials.
```sh
cp .env.example .env.local
```
Next, open `.env.local` in your editor and add the required values from your Crowdin OAuth application.

4. **Run the development server:**

```sh
# Using npm
npm run dev

# Or using pnpm
pnpm dev
```

Your application will be available at `http://localhost:3000`.

## Deploying to Vercel

The easiest way to deploy your app is directly to the Vercel platform.

Click the button below to clone this repository to your own GitHub account and deploy it to Vercel in one step:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fcrowdin%2Fapps-quick-start-nextjs)

### Configuring Environment Variables

After the deployment process begins, Vercel will guide you to configure your project. You will need to add your environment variables.

1. In the Vercel "Configure Project" view, expand the "Environment Variables" section.
2. Copy the variables from your local `.env.local` file (or the `.env.example` template) and paste them into the Vercel dashboard.
3. Ensure you update `NEXT_PUBLIC_BASE_URL` with your new production URL from Vercel (e.g., `https://your-app-name.vercel.app`).

This step is crucial for your deployed app to connect to Crowdin, your database, and other services.

## Installing the App in Crowdin

Once deployed, install your app in Crowdin using the [manual installation](https://developer.crowdin.com/crowdin-apps-installation/) method:

1. In Crowdin, go to your **Account Settings > Apps**.
2. Click **Install Private App**.
3. Enter your manifest URL: `https://your-app-name.vercel.app/manifest.json`

After installation, your app will be available in the project locations defined in your manifest.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Database**: PostgreSQL
- **Deployment**: [Vercel](https://vercel.com/)
- **Storage**: [Vercel Blob](https://vercel.com/storage/blob)

## Resources

For more information on the technologies and APIs used in this project, see the following resources:

- [Crowdin Developer Portal](https://developer.crowdin.com/)
- [Crowdin API Reference](https://developer.crowdin.com/api/v2/)
- [Crowdin Apps SDK](https://crowdin.github.io/app-project-module/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel Documentation](https://vercel.com/docs)

## License

This project is licensed under the MIT License.
