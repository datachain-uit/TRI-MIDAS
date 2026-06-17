# Usage

### 1. Prerequisites

- Node.js: Version 18.x or higher (LTS recommended).

- Package Manager: npm (comes with Node.js).

If you don't have Node.js installed on your machine, follow these steps:

- Download Node.js: Visit the official [Node.js website](https://nodejs.org/) and download the **LTS (Long Term Support)** version. This version includes **npm** (Node Package Manager) by default.
- Verify Installation: Open your terminal/command prompt and run these commands to ensure everything is set up correctly:
  ```bash
  node -v
  npm -v
  ```

### 2. Installing

Clone the repository and navigate to the frontend directory. Since this project uses specific UI components, you must use the --legacy-peer-deps flag to avoid version conflicts between peer dependencies.

```bash
cd frontend
npm install --legacy-peer-deps
```

### 3. Environment Configuration

The dashboard fetches real-time data from Azure Cosmos DB. You need to manually create a .env.local file in the frontend/ root directory.

File: .env.local

```bash
COSMOS_ENDPOINT="azure_cosmos_endpoint_url"
COSMOS_KEY="azure_cosmos_primary_key"
COSMOS_DATABASE="mooccubex"
```

### 4. Running the Development Server

Once the environment is configured, start the server:


```bash
npm run dev
```

The application will be available at http://localhost:3000.