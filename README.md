# Artifax_bot
A smart Discord bot It chats, moderates, analyzes user personalities, and handles server utility—all in one lightweight package.
# Artifax (Discord + Gemini AI Bot)

Welcome to Artifax. This is a custom Discord bot built to integrate the capabilities of Google's Gemini AI directly into a Discord server.

It functions as both a conversational assistant and a server utility tool. Whether you need to ask complex questions, manage users, or analyze chat history for personality insights, this bot handles it efficiently.

## Features

### AI Capabilities (Powered by Gemini 1.5)
* **/ask [question]**: Interact directly with Gemini AI within Discord. Useful for coding assistance, general knowledge, or creative writing.
* **/analyze [user]**: The bot retrieves the last 50 messages from a specific user and generates a personality summary based on their chat history.

### Moderation Tools
* **/kick [user]**: Remove a user from the server.
* **/ban [user]**: Permanently ban a user from the server.
* *(Note: These commands require the user to have appropriate Kick/Ban permissions).*

### Fun & Utilities
* **/roll**: Generates a random number between 1 and 100.
* **/coinflip**: Randomly selects between Heads or Tails.
* **/userinfo [user]**: Displays account creation dates and server join dates.

---

## How to Run This Bot

If you wish to clone this project and run your own version, follow the steps below.

### 1. Prerequisites
Ensure you have Node.js installed on your system.

### 2. Installation
Clone the repository and install the required dependencies:

```bash
You must create a secure environment file to store your API keys.

Create a file named .env in the root directory.

Add your keys using the following format:

Code snippet

DISCORD_TOKEN=your_discord_bot_token_here
CLIENT_ID=your_discord_application_id_here
GEMINI_KEY=your_google_gemini_api_key_here

4. Start the Bot
Run the following command in your terminal:

Bash

node index.js
Built With
Discord.js - The official library for interacting with the Discord API.

Google Generative AI - The API driving the chat and analysis features.

Node.js - The JavaScript runtime environment.

Disclaimer
This bot reads message history only when the /analyze command is explicitly executed. It does not store user data. Please ensure "Message Content Intent" is enabled in the Discord Developer Portal for the AI analysis features to function correctly.
git clone [https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git](https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git)
cd YOUR_REPO_NAME
npm install
