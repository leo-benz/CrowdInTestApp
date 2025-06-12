# Getting Started with Crowdin Apps

Join the growing localization management platform! Build apps for all the teams already using Crowdin or Crowdin Enterprise to customize and extend localization experience. By creating Crowdin apps, developers can integrate existing services with Crowdin, add new features, upload and manage content.

[**`Home`**](https://crowdin.com) | [**`Quick Start`**](https://developer.crowdin.com/crowdin-apps-quick-start) | [**`Developer Portal`**](https://developer.crowdin.com/)

## About This Project

This is a comprehensive Crowdin Application built with Next.js and TypeScript, featuring:

- **Project Menu Module** - Custom tab in Crowdin projects
- **Complete Tutorial** - Step-by-step documentation

## Running Locally

Make sure you have [Node.js 18+](http://nodejs.org/) installed.

```sh
$ git clone https://github.com/crowdin/apps-quick-start-vercel.git # or clone your own fork
$ cd apps-quick-start-vercel
$ npm install
```

Create your environment file:

```sh
$ cp .env.example .env.local
```

Update `.env.local` with your Crowdin OAuth app credentials:

```env
NEXT_PUBLIC_BASE_URL=http://localhost:3000
CROWDIN_CLIENT_ID=<your-client-id>
CROWDIN_CLIENT_SECRET=<your-client-secret>
AUTH_URL=https://accounts.crowdin.com/oauth/token
NEXT_PUBLIC_CROWDIN_IFRAME_SRC=https://cdn.crowdin.com/apps/dist/iframe.js
```

Start the development server:

```sh
$ npm run dev
```

Your app should now be running on [localhost:3000](http://localhost:3000/).

## Deploying to Vercel

Make sure you have [Vercel CLI](https://vercel.com/cli) installed.

```sh
$ vercel
$ vercel --prod
```

Or deploy directly from GitHub by connecting your repository to Vercel:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fcrowdin%2Fapps-quick-start-vercel)

### Environment Variables for Production

Add the following environment variables in your Vercel dashboard:

- `CROWDIN_CLIENT_ID` - Your Crowdin OAuth app Client ID
- `CROWDIN_CLIENT_SECRET` - Your Crowdin OAuth app Client Secret
- `NEXT_PUBLIC_BASE_URL` - Your production domain (e.g., `https://your-app.vercel.app`)
- `AUTH_URL` - `https://accounts.crowdin.com/oauth/token`
- `NEXT_PUBLIC_CROWDIN_IFRAME_SRC` - `https://cdn.crowdin.com/apps/dist/iframe.js`

## Installing the App in Crowdin

Once deployed, install your app in Crowdin using the [manual installation](https://developer.crowdin.com/crowdin-apps-installation/) method:

1. Go to your Crowdin account settings
2. Navigate to **Applications**
3. Click **Install from URL**
4. Enter your manifest URL: `https://your-app.vercel.app/manifest.json`

## Tutorial

For a complete step-by-step tutorial, see [`docs/crowdin-app-quick-start-vercel-nextjs.md`](docs/crowdin-app-quick-start-vercel-nextjs.md). The tutorial covers:

1. **Basic Setup** - Project structure and environment configuration

## Tech Stack

- **Framework**: [Next.js 14+](https://nextjs.org/) with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Deployment**: [Vercel](https://vercel.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)

## Documentation

For more information about developing Crowdin Apps, see these resources:

- [Crowdin Developer Portal](https://developer.crowdin.com/)
- [Quick Start Guide](https://developer.crowdin.com/crowdin-apps-quick-start)
- [Crowdin Apps API Reference](https://developer.crowdin.com/api/v2/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Deploying Next.js Apps on Vercel](https://vercel.com/docs/frameworks/nextjs)

## License

This project is licensed under the MIT License.
