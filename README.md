# Web App Project Creator CLI

A powerful CLI tool for creating modern web applications with best practices baked in. This tool helps you quickly scaffold web projects with your preferred framework, styling solutions, and state management libraries.

## Features

- 🚀 Multiple Framework Support
  - React.js (with Vite)
  - Next.js
  - Angular
  - Vue.js (with Vite)

- 🎨 Template Options
  - JavaScript/TypeScript support
  - SWC compilation
  - PWA capabilities
  - Various framework-specific templates

- 📦 Package Manager Flexibility
  - npm
  - yarn
  - pnpm

- 🛠️ Additional Features
  - Styling Libraries Integration
  - State Management Setup
  - Testing Framework Configuration
  - Git Repository Initialization
  - ESLint & Prettier Setup

## Installation

```bash
npm install -g @kingjethro/web
```

## Usage

Create a new web application:

```bash
web create my-app
```

Options:
- `-p, --package-manager <manager>` - Specify package manager (npm, yarn, pnpm)
- `-t, --template <template>` - Choose template (javascript, typescript)
- `--skip-git` - Skip Git initialization
- `-v, --verbose` - Enable verbose logging

## Configuration

The CLI tool saves your preferences in a `.webrc` file in your home directory. This includes:
- Default package manager
- Default framework
- Git initialization preference

## Plugins

### Styling Libraries
- Tailwind CSS
- styled-components
- Sass
- Material-UI
- Chakra UI

### State Management
- Redux Toolkit
- MobX
- Zustand
- Recoil
- Context API

## Development Server

After project creation, the development server starts automatically. Access your application at:
- Local: http://localhost:5173 (default)
- Network: Available on your local network

## Troubleshooting

1. **Installation Issues**
   - Ensure you have Node.js installed
   - Try with administrator privileges

2. **Package Manager Errors**
   - Verify the selected package manager is installed
   - Check network connectivity

3. **Git Integration Issues**
   - Ensure Git is installed
   - Check Git configuration

## License

MIT

## Author

King Jethro
