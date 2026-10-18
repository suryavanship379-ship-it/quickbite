# Assignment 2: DevOps CI/CD Pipeline with GitHub Actions

**Application Name:** QuickBite Food Delivery Service  
**Course:** DevOps Lab / Continuous Integration & Continuous Delivery  

---

## 1. Aim
To set up an automated DevOps CI/CD pipeline using **GitHub Actions** that automatically installs dependencies, executes automated tests, and performs a simulated deployment of the QuickBite application on every code push.

## 2. Objective
Understand Continuous Integration (CI) and Continuous Delivery/Deployment (CD), and automate the entire build-test-deploy workflow to support faster, reproducible, and reliable software releases.

---

## 3. Theoretical Background

### 3.1 Continuous Integration (CI)
Continuous Integration is the software engineering practice where developers frequently integrate code into a shared version-control repository (such as GitHub). Each push automatically triggers:
- Dependency installation
- Code compilation/linting
- Execution of automated test suites

Early feedback detects integration bugs, regression defects, and syntax errors immediately, dramatically reducing developer debugging time.

### 3.2 Continuous Delivery / Deployment (CD)
Continuous Delivery automatically validates software artifacts and stages them for release. Continuous Deployment takes this one step further by automatically executing deployment steps to target staging or production servers without manual human gates once all automated checks and tests succeed.

### 3.3 GitHub Actions Architecture
GitHub Actions is a cloud-native automation and orchestration platform tightly integrated with GitHub repositories:
- **Workflow:** An automated configurable process declared in YAML files under `.github/workflows/`.
- **Events (Triggers):** Specific activities that initiate a workflow run (e.g., `push` to `main`, `pull_request`).
- **Jobs:** A collection of sequential steps that execute on the same runner environment. Jobs run concurrently by default unless sequenced with the `needs` dependency keyword.
- **Steps:** Individual tasks executing either shell commands (`run: ...`) or packaged community actions (`uses: ...`).
- **Runners:** Virtual machines (e.g., `ubuntu-latest`) hosted in the cloud that execute the job instructions.

### 3.4 Automated Deployment Verification (Simulated Staging)
Automated deployment verifies that post-testing deployment scripts run smoothly in the target environment. In enterprise CI/CD environments, deployment scripts deploy the tested code to staging servers or cloud runtimes upon passing tests, ensuring seamless continuous delivery.

---

## 4. CI/CD Pipeline Architecture & Flow

The pipeline executes a 2-stage directed acyclic graph (DAG):

```
       [ Developer pushes code to 'main' ]
                       │
                       ▼
           =========================
           Stage 1: build-and-test
           =========================
           • Checkout code (actions/checkout@v4)
           • Setup Node.js 20 (actions/setup-node@v4)
           • npm install
           • npm test (validates /health endpoint)
                       │
                 (Passes ✔)
                       │
                       ▼
           =========================
           Stage 2: deploy (simulated)
           =========================
           • Condition: branch == 'main'
           • Dependent on build-and-test completion (needs: build-and-test)
           • Executes deployment script / command:
             echo "Deploying QuickBite to staging server..."
             echo "QuickBite deployment successful (simulated)."
```

---

## 5. Application Code & Configuration Files

### 5.1 Application Entrypoint: `app.js`
The server exposes a welcome root route and a standard JSON healthcheck endpoint:

```javascript
const express = require('express'); 
const app = express(); 
  
app.get('/', (req, res) => res.send('Welcome to QuickBite!')); 
app.get('/health', (req, res) => res.json({ status: 'ok' })); 
  
module.exports = app; 
  
if (require.main === module) { 
  app.listen(3000, () => console.log('QuickBite running on port 3000')); 
}
```

- **Exporting `app`:** Separates Express application configuration from port binding, enabling integration test runners to spin up ephemeral listener instances without port conflicts.
- **`require.main === module`:** Only binds to port `3000` when directly executed (`node app.js`), allowing unit and integration test harnesses to manage server lifecycles independently.

### 5.2 Automated Healthcheck Test: `test.js`
Uses Node.js's built-in native test runner (`node:test`) and assertion module (`node:assert`) without external testing frameworks:

```javascript
const test = require('node:test'); 
const assert = require('node:assert'); 
const app = require('./app'); 
  
test('GET /health returns status ok', async () => { 
  const server = app.listen(0); 
  const { port } = server.address(); 
  const res = await fetch(`http://localhost:${port}/health`); 
  const body = await res.json(); 
  server.close(); 
  assert.strictEqual(res.status, 200); 
  assert.strictEqual(body.status, 'ok'); 
});
```

- **`app.listen(0)`:** Dynamically requests an arbitrary open TCP port from the operating system kernel, preventing `EADDRINUSE` failures during parallel runs.
- **Native `fetch`:** Performs HTTP GET against the running instance, verifying both status `200` and `{ status: 'ok' }`.
- **`server.close()`:** Safely shuts down the server socket upon completion to avoid hanging connections.

### 5.3 Project Manifest: `package.json`
```json
{ 
  "name": "quickbite", 
  "version": "1.0.0", 
  "main": "app.js", 
  "scripts": { 
    "start": "node app.js", 
    "test": "node --test" 
  }, 
  "dependencies": { 
    "express": "^4.19.2" 
  } 
}
```

### 5.4 GitHub Actions Workflow: `.github/workflows/ci-cd.yml`
```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install dependencies
        run: npm install

      - name: Run tests
        run: npm test

  deploy:
    needs: build-and-test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Deploy (simulated)
        run: |
          echo "Deploying QuickBite to staging server..."
          echo "Application: QuickBite Food Delivery Service"
          echo "Status: Build & Tests Passed Successfully"
          echo "Simulation: Server deployment completed successfully."
          echo "QuickBite deployment successful (simulated)."
```

---

## 6. Steps Performed for Setup & Verification

1. **Created Repository Structure:** Assembled the Node.js application root files (`app.js`, `test.js`, `package.json`, `package-lock.json`).
2. **Configured GitHub Actions Directory:** Initialized `.github/workflows/` and authored `ci-cd.yml` defining the ordered pipeline jobs: `build-and-test` followed by `deploy`.
3. **Executed Local Unit & Integration Verification:** Ran `npm test` locally to verify that Express boots, responds to HTTP requests, and returns status 200 with `{ status: 'ok' }`.
4. **Code Push Trigger:** Pushed the codebase to the `main` branch, triggering GitHub Actions.
5. **Actions Verification:** Monitored the GitHub Actions tab to confirm both sequential jobs (`build-and-test` and `deploy`) completed with green checkmarks.
6. **Deployment Log Verification:** Inspected the `deploy` step output in GitHub Actions to confirm the simulated deployment script completed without errors.

---

## 7. Result
A full DevOps Continuous Integration and Continuous Delivery (CI/CD) pipeline was implemented using **GitHub Actions**. On every push to the `main` branch, the pipeline automatically:
1. Checked out the codebase and configured Node.js 20.
2. Installed dependencies and executed automated tests.
3. Upon test success, triggered the automated simulated deployment step to stage the application.

All stages completed without manual intervention, achieving automated, repeatable software delivery.

---

## 8. Viva Questions & Detailed Answers

### Q1: What is CI/CD?
**Answer:** Continuous Integration (CI) is the practice of automatically building and testing code changes whenever developers commit them to a shared repository, catching bugs early. Continuous Delivery/Deployment (CD) automatically validates builds and delivers or deploys them to target hosting environments without manual human gates.

### Q2: What is GitHub Actions?
**Answer:** GitHub Actions is GitHub's native automation and orchestration platform that allows developers to automate software workflows (such as CI/CD, linting, and releases) directly within their GitHub repository, triggered by events like pushes or pull requests.

### Q3: What are the main components of a GitHub Actions workflow?
**Answer:** 
1. **Events (Triggers):** Specific occurrences (e.g., `push`, `pull_request`) that initiate execution.
2. **Jobs:** Units of work that execute on separate runners; jobs can run in parallel or sequentially.
3. **Steps:** Individual tasks within a job that run commands or reuse community actions.
4. **Runners:** Virtualized compute instances (Linux, Windows, or macOS) that host and execute jobs.

### Q4: What is the purpose of the simulated deployment step?
**Answer:** The simulated deployment step models the delivery phase of a CI/CD pipeline where passing code is automatically pushed to staging or production. In a production pipeline, this step would execute deployment scripts (e.g., SSH to server, cloud deployment CLI, or container orchestrator update). Simulating it verifies pipeline dependency flow and execution without requiring external cloud accounts or credentials.

### Q5: What does the `needs` keyword do in a GitHub Actions workflow?
**Answer:** The `needs` keyword establishes sequential dependency between jobs. By default, GitHub Actions runs independent jobs in parallel. Adding `needs: build-and-test` to the `deploy` job guarantees that `deploy` will only execute if `build-and-test` finishes successfully. If tests fail, the downstream deployment job is automatically skipped.
