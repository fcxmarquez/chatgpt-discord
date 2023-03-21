// Create a Discord Bot using OpenAI API that interacts on the Discord Server
require("dotenv").config();
const { Configuration, OpenAIApi } = require("openai");
const { Client, IntentsBitField } = require("discord.js");

// Preprare to connect to the Discord API
const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});

// Prepare connection to OpenAI API
const configuration = new Configuration({
  organization: process.env.OPENAI_ORG,
  apiKey: process.env.OPENAI_KEY,
});
const openai = new OpenAIApi(configuration);

// Check for when a message on discord is sent
client.on("messageCreate", async (message) => {
  try {
    // Don't respond to yourself or other bots
    if (message.author.bot) return;

    let conversationLog = [
      {
        role: "system",
        content: "You are ChatGPT, a large language model trained by OpenAI.",
      },
    ];

    console.log(conversationLog);

    await message.channel.sendTyping();

    let prevMessages = await message.channel.messages.fetch({ limit: 15 });
    prevMessages.reverse();

    prevMessages.forEach((msg) => {
      if (message.content.startsWith("!")) return;
      if (msg.author.id !== client.user.id && message.author.bot) return;
      if (msg.author.id !== message.author.id) return;

      conversationLog.push({
        role: "user",
        content: msg.content,
      });
    });

    const gptResponse = await openai.createChatCompletion({
      model: "gpt-3.5-turbo", /* gpt-4 */
      messages: conversationLog,
      max_tokens: 2048,
      temperature: 0.7,
    });

    message.reply(gptResponse.data.choices[0].message);
    return;
  } catch (error) {
    console.log(error);
  }
});

// Log the bot into Discord
client.login(process.env.DISCORD_TOKEN);
console.log("Bot is running...");
