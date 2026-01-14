// Load environment variables from .env file
require('dotenv').config();

// Import everything we need from discord.js
const {
    Client,
    GatewayIntentBits,
    REST,
    Routes,
    SlashCommandBuilder,
    PermissionFlagsBits,
    EmbedBuilder
} = require('discord.js');

// Import Google Gemini SDK
const { GoogleGenerativeAI } = require('@google/generative-ai');

/* ------------------- GEMINI AI SETUP ------------------- */

// Create Gemini AI instance using secret key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);

// Choose the Gemini model we want to talk to
const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash"
});

/* ------------------- DISCORD CLIENT SETUP ------------------- */

// Create Discord client with required permissions
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,           // Required for slash commands
        GatewayIntentBits.GuildMessages,    // Read messages
        GatewayIntentBits.MessageContent,   // Access message text
        GatewayIntentBits.GuildMembers      // Moderate users
    ]
});

/* ------------------- SLASH COMMANDS ------------------- */

const commands = [

    // Ask Gemini AI anything
    new SlashCommandBuilder()
        .setName('ask')
        .setDescription('Ask Gemini AI a question')
        .addStringOption(option =>
            option
                .setName('question')
                .setDescription('Your question')
                .setRequired(true)
        ),

    // Analyze a user's recent messages
    new SlashCommandBuilder()
        .setName('analyze')
        .setDescription('Analyze a user’s recent chat behavior')
        .addUserOption(option =>
            option
                .setName('target')
                .setDescription('User to analyze')
                .setRequired(true)
        ),

    // Kick command (mods only)
    new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Kick a user from the server')
        .addUserOption(option =>
            option
                .setName('target')
                .setDescription('User to kick')
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

    // Ban command (admins only)
    new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Ban a user from the server')
        .addUserOption(option =>
            option
                .setName('target')
                .setDescription('User to ban')
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

    // Fun commands
    new SlashCommandBuilder()
        .setName('roll')
        .setDescription('Roll a dice (1–100)'),

    new SlashCommandBuilder()
        .setName('coinflip')
        .setDescription('Flip a coin'),

    // User info command
    new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('View user details')
        .addUserOption(option =>
            option
                .setName('target')
                .setDescription('User to view')
                .setRequired(false)
        )
];

/* ------------------- COMMAND REGISTRATION ------------------- */

// REST client to push slash commands to Discord
const rest = new REST({ version: '10' })
    .setToken(process.env.DISCORD_TOKEN);

// When bot goes online
client.once('ready', async () => {
    console.log(`🤖 Logged in as ${client.user.tag}`);

    try {
        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands }
        );
        console.log('✅ Slash commands registered');
    } catch (err) {
        console.error('❌ Failed to register commands:', err);
    }
});

/* ------------------- COMMAND HANDLER ------------------- */

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    /* ---------- /ask ---------- */
    if (interaction.commandName === 'ask') {
        await interaction.deferReply();

        try {
            const question = interaction.options.getString('question');
            const result = await model.generateContent(question);
            const answer = result.response.text();

            await interaction.editReply(
                answer.length > 1900 ? answer.slice(0, 1900) + '...' : answer
            );
        } catch {
            await interaction.editReply('❌ AI failed to respond.');
        }
    }

    /* ---------- /analyze ---------- */
    else if (interaction.commandName === 'analyze') {
        await interaction.deferReply();

        try {
            const user = interaction.options.getUser('target');
            const messages = await interaction.channel.messages.fetch({ limit: 50 });

            const userMessages = messages
                .filter(msg => msg.author.id === user.id)
                .map(msg => msg.content)
                .join('\n');

            if (!userMessages)
                return interaction.editReply('No recent messages found.');

            const analysisPrompt = `
Analyze the following Discord messages and describe the user's personality in 2 sentences:
${userMessages}
            `;

            const result = await model.generateContent(analysisPrompt);

            await interaction.editReply(
                `🧠 **Analysis of ${user.username}:**\n${result.response.text()}`
            );
        } catch {
            await interaction.editReply('❌ Analysis failed.');
        }
    }

    /* ---------- /kick ---------- */
    else if (interaction.commandName === 'kick') {
        const member = interaction.options.getMember('target');

        if (!member.kickable)
            return interaction.reply({ content: 'I can’t kick this user.', ephemeral: true });

        await member.kick();
        await interaction.reply(`👢 **${member.user.tag}** has been kicked.`);
    }

    /* ---------- /ban ---------- */
    else if (interaction.commandName === 'ban') {
        const member = interaction.options.getMember('target');

        if (!member.bannable)
            return interaction.reply({ content: 'I can’t ban this user.', ephemeral: true });

        await member.ban();
        await interaction.reply(`🔨 **${member.user.tag}** has been banned.`);
    }

    /* ---------- /roll ---------- */
    else if (interaction.commandName === 'roll') {
        const roll = Math.floor(Math.random() * 100) + 1;
        await interaction.reply(`🎲 You rolled **${roll}**`);
    }

    /* ---------- /coinflip ---------- */
    else if (interaction.commandName === 'coinflip') {
        const result = Math.random() < 0.5 ? 'Heads' : 'Tails';
        await interaction.reply(`🪙 It’s **${result}**`);
    }

    /* ---------- /userinfo ---------- */
    else if (interaction.commandName === 'userinfo') {
        const user = interaction.options.getUser('target') || interaction.user;
        const member = await interaction.guild.members.fetch(user.id);

        const embed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle(user.tag)
            .setThumbnail(user.displayAvatarURL())
            .addFields(
                { name: 'Discord Account Created', value: user.createdAt.toDateString() },
                { name: 'Joined This Server', value: member.joinedAt.toDateString() }
            );

        await interaction.reply({ embeds: [embed] });
    }
});

/* ------------------- LOGIN ------------------- */

client.login(process.env.DISCORD_TOKEN);
