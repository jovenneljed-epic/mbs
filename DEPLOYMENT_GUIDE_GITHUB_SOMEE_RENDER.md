# Complete Deployment Guide: GitHub, Somee Database & Render Cloud

This guide walks you through the step-by-step process of:
1. Initializing and pushing your project to **GitHub**.
2. Setting up a free Microsoft SQL Server database on **Somee.com** using the generated `somee_mssql_database_setup.sql` script.
3. Deploying the ASP.NET Core API (`School.Api`) and Vite React Frontend (`School.Web`) to **Render.com**.

---

## Part 1: Push Project to GitHub

### Step 1.1: Initialize Git and Commit
Open PowerShell in this project folder (`SchoolManagementSystem_Rebuilt_FIXED`) and run:

```powershell
# 1. Initialize git repository with main branch
git init -b main

# 2. Check that the .gitignore is active
git status

# 3. Stage all files (bin, obj, node_modules are safely excluded)
git add .

# 4. Commit all project files
git commit -m "feat: complete school management system with student dashboard, curriculum, and multi-payment modules"
```

### Step 1.2: Create Repository on GitHub
1. Open your browser and go to [https://github.com/new](https://github.com/new).
2. Name your repository (e.g., `school-management-system` or `epic-sms`).
3. Choose **Public** or **Private**.
4. **Do NOT** check "Add a README", ".gitignore", or "license" (we already have them).
5. Click **Create repository**.

### Step 1.3: Push to GitHub
Copy the commands shown by GitHub, or run:

```powershell
# Link to your new repository (replace with your GitHub username & repo name)
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPOSITORY_NAME.git

# Push code to GitHub
git push -u origin main
```

---

## Part 2: Setup Free MS SQL Database on Somee.com

Somee provides free MS SQL Server hosting ideal for ASP.NET applications.

### Step 2.1: Register on Somee
1. Go to [https://somee.com](https://somee.com).
2. Register an account and verify your email.

### Step 2.2: Create Database
1. Go to the **User area** -> click **MS SQL** in the left sidebar menu.
2. Click **Create database**.
3. Choose the free package (Free MS SQL database).
4. Enter your desired database name (e.g., `SchoolManagementDB`).
5. Choose MS SQL Server version (e.g., SQL Server 2022 or 2019).
6. Click **Create database**.

### Step 2.3: Run the Migration Schema Script
1. Under your database in Somee, click **Manage database**.
2. Click on **Run T-SQL script** (or open SQL Server Management Studio / Azure Data Studio and connect to the Somee server).
3. Open the file **`somee_mssql_database_setup.sql`** located in the root of your project folder.
4. Copy all contents and paste it into the **Run T-SQL script** box on Somee.
5. Click **Run**.
   *This automatically creates all tables, foreign keys, identity columns, and indexes!*

### Step 2.4: Copy Your Somee Connection String
In Somee, look at your database connection properties:
- **Server name**: e.g., `SchoolManagementDB.mssql.somee.com`
- **Database name**: e.g., `SchoolManagementDB`
- **User ID**: e.g., `yourusername_admin`
- **Password**: `your_password`

Your connection string format will be:
```text
Server=YOUR_SERVER.mssql.somee.com;Database=YOUR_DB_NAME;User Id=YOUR_USER_ID;Password=YOUR_PASSWORD;TrustServerCertificate=True;
```

---

## Part 3: Deploy to Render.com

Render will host both your **ASP.NET Core API** and your **React Frontend**.

### Step 3.1: Deploy ASP.NET Core API (`School.Api`)

1. Go to [https://dashboard.render.com](https://dashboard.render.com) and log in (sign in with your GitHub account).
2. Click **New +** -> select **Web Service**.
3. Select your GitHub repository (`school-management-system`).
4. Configure the Web Service:
   - **Name**: `school-management-api` (or your preferred name)
   - **Region**: Singapore / Oregon / Frankfurt (pick closest to your users)
   - **Root Directory**: `.` (leave as project root, or leave blank)
   - **Language / Environment**: **Docker**
   - **Dockerfile Path**: `./Dockerfile` (Render will detect the root Dockerfile)
   - **Plan**: Free
5. Scroll down to **Environment Variables** and click **Add Environment Variable**:
   - **Key**: `ConnectionStrings__EPICChurchDB`
   - **Value**: *(Paste your complete Somee connection string from Part 2)*
   - **Key**: `ASPNETCORE_ENVIRONMENT`
   - **Value**: `Production`
6. Click **Deploy Web Service**.
7. Wait 2–3 minutes for Docker to build and start. Render will provide your public API URL:
   `https://school-management-api-xxxx.onrender.com`
   *(You can test it by visiting `https://school-management-api-xxxx.onrender.com/swagger/index.html`)*

---

### Step 3.2: Deploy React Frontend (`School.Web`)

1. In Render Dashboard, click **New +** -> select **Static Site**.
2. Select the same GitHub repository.
3. Configure the Static Site:
   - **Name**: `school-management-web`
   - **Root Directory**: `School.Web`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. Add Environment Variable:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://school-management-api-xxxx.onrender.com/api` *(use your API URL from Step 3.1)*
5. Click **Deploy Static Site**.
6. Render will build and deploy your React app to a fast global CDN with free SSL:
   `https://school-management-web-xxxx.onrender.com`

---

## Verification Checklist

- [x] Root `.gitignore` configured to prevent committing `.vs/`, `bin/`, `obj/`, and `node_modules/`.
- [x] Multi-stage `Dockerfile` targeting .NET 10 configured for Render Docker deployment.
- [x] Schema script `somee_mssql_database_setup.sql` ready to run in Somee.
- [x] `School.Web` frontend configured to dynamically read `VITE_API_URL`.
