# Sea Cucumber

Sea Cucumber is an autonomous developer agent system designed to detect and prune dead API endpoints, also known as barnacles. The application combines telemetry logs, code repository statistics, runtime exceptions, and project management tickets into a single database mapping using the Coral SQL command-line interface. A developer agent powered by the NVIDIA NIM API reasons over this unified database to formulate step-by-step refactoring recipes.

---

## How It Works

The application operates as an automated three-tier data and reasoning pipeline:

1. **Multi-Source Data Collection**
   The scanner targets four separate telemetry domains to determine the lifecycle health of every API path:
   * **Version Control Activity**: Monitors when each route file was last modified in git.
   * **Runtime Exceptions**: Counts occurrences of errors flagged in production telemetry over the last 30 days.
   * **Network Logs**: Monitors aggregate request traffic volumes over the last 6 months.
   * **Jira Backlog Status**: Tracks whether a specific route has active developer tasks or unresolved tickets.

2. **Unified SQL Dredging with Coral**
   The application leverages Coral SQL to execute a schema join across all of these tabular CSV logs. The query computes logical status recommendations:
   * **Barnacle**: Paths modified more than six months ago with low traffic, zero exceptions, and no active Jira tasks. These are designated as safe for removal.
   * **Low Activity**: Sluggish endpoints with low request volumes, designated for deprecation warning headers.
   * **Active**: Endpoints with steady network traffic and active development, which must remain in production.

3. **Autonomous Reasoning via NVIDIA NIM**
   The joined telemetry data is passed to a reasoning agent powered by the NVIDIA NIM completions endpoint using the `qwen/qwen3-coder-480b-a35b-instruct` model. The agent analyzes the telemetry context, determines risk classifications, and outputs a concrete code-deletion and refactoring recipe.

4. **Actionable Mitigation**
   The user interface translates the agent recommendations into step-by-step refactoring checklists, provides clipboard-ready reports, and allows developers to file pre-filled deprecation issues directly to their GitHub repository with a single click.

---

## How to Recreate This

Follow these steps to set up, configure, and execute the Sea Cucumber platform locally or deploy it to a hosting provider.

### Prerequisites
* **Node.js**: Version 18.0.0 or higher.
* **NVIDIA Inference API Key**: An active key from the NVIDIA Build developer platform.
* **Coral CLI Utility**: The command-line utility for executing SQL queries on tabular files.

### 1. Install and Build the Application

Clone the repository and install the project dependencies:
```bash
cd sea-cucumber
npm install
```

Configure your environment variables by creating a `.env.local` file in the root directory:
```bash
NVIDIA_API_KEY=your_nvidia_api_key_here
```

Start the Next.js development server:
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:3000` to view the running dashboard.

### 2. Set Up the Simulation Repository

To test the scanner, you can deploy the pre-made test codebase:
1. Navigate to the `seacucumber-test-repo` directory.
2. Initialize git and commit the simulated legacy codebase:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of legacy search and payment service"
   ```
3. Create a public repository on your GitHub account named `seacucumber-test-repo`.
4. Link your local repo to GitHub and push:
   ```bash
   git remote add origin https://github.com/your-username/seacucumber-test-repo.git
   git branch -M main
   git push -u origin main
   ```
5. Enter your newly created GitHub repository URL into the scan input on the web dashboard to analyze the simulation.

### 3. Deploy to Vercel

The application is optimized to run as a serverless application on Vercel:
1. Push the main `sea-cucumber` directory to your GitHub account.
2. Log in to Vercel and import your `sea-cucumber` repository.
3. In the environment variables configuration, add your `NVIDIA_API_KEY` credential.
4. Click deploy.

The application utilizes an automated check. If the Coral SQL binary is unavailable in the serverless cloud environment, the backend automatically switches to pre-computed SQL joins. This preserves the operational visual workflow for external reviewers without requiring custom system permissions.

---

## Credits

* Powered by [Coral](https://withcoral.com)
* Created for the Coral hackathon hosted by [Wemakedevs](https://wemakedevs.org)
