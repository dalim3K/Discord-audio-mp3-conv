require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const funnyMessages = [
  "🎧 Converting your audio... please don't panic.",
  "🧠 AI is thinking... very slowly.",
  "🔊 Turning your noise into something beautiful...",
  "⚙️ Processing sound waves... please wait.",
  "🚀 Sending your file to another dimension..."
];

function randomMsg() {
  return funnyMessages[Math.floor(Math.random() * funnyMessages.length)];
}

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  if (!message.content.startsWith("!convert")) return;

  const args = message.content.split(" ");
  const format = args[1];

  const attachment = message.attachments.first();
  if (!attachment) return message.reply("❌ Attach an audio file.");

  if (!format) return message.reply("❌ Usage: !convert mp3");

  const inputPath = path.join(__dirname, "input");
  const outputPath = path.join(__dirname, "output");

  if (!fs.existsSync(inputPath)) fs.mkdirSync(inputPath);
  if (!fs.existsSync(outputPath)) fs.mkdirSync(outputPath);

  const inputFile = path.join(inputPath, attachment.name);
  const outputFile = path.join(outputPath, `converted.${format}`);

  await message.reply(randomMsg());

  const response = await fetch(attachment.url);
  const buffer = await response.arrayBuffer();
  fs.writeFileSync(inputFile, Buffer.from(buffer));

  exec(`ffmpeg -i "${inputFile}" "${outputFile}"`, async (err) => {
    if (err) {
      return message.channel.send("❌ Conversion failed.");
    }

    await message.channel.send({
      content: "✅ Done! Here is your file:",
      files: [outputFile],
    });

    fs.unlinkSync(inputFile);
    fs.unlinkSync(outputFile);
  });
});

client.login(process.env.DISCORD_TOKEN);
