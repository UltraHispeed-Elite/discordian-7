const { Client, GatewayIntentBits } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, entersState, StreamType, AudioPlayerStatus, VoiceConnectionStatus } = require('@discordjs/voice');
const fs = require('fs');
const path = require('path');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages
    ]
});

// Configuration
const TOKEN = 'MTMwNzg5MjczNzE2ODc2OTA5NA.Gtl2qv.cwIYqVCroge30gth2z9l5cx-cZuvyWFVGu6W9o';
const CHANNEL_ID = '1295100356644180028'; // Replace with your voice channel ID
const FILE_PATH = path.join(__dirname, 'Vine Boom.mp3'); // Replace with your MP3 file path

let voiceConnection = null;
let audioPlayer = null;

// Create audio player
function createPlayer() {
    const player = createAudioPlayer();
    
    player.on('error', error => {
        console.error('Audio Player Error:', error);
    });

    player.on(AudioPlayerStatus.Idle, () => {
        console.log("hello?")
        playAudio(); // Restart playback when current track ends
    });

    return player;
}

// Play audio function
function playAudio() {
    try {
        const resource = createAudioResource(fs.createReadStream(FILE_PATH), {
            inputType: StreamType.Arbitrary,
            inlineVolume: true
        });
        
        if (audioPlayer) {
            audioPlayer.play(resource);
        }
    } catch (error) {
        console.error('Playback Error:', error);
    }
}

// Connect to voice channel
async function connectToChannel() {
    if (voiceConnection) return;

    const channel = await client.channels.fetch(CHANNEL_ID);
    if (!channel) throw new Error('Channel not found!');

    // Modified voice connection configuration
    voiceConnection = joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator,
        selfDeaf: false // Add this line
    });

    // Handle disconnects
    voiceConnection.on('disconnect', async () => {
        console.log('Disconnected! Attempting to reconnect...');
        voiceConnection = null;
        setTimeout(() => connectToChannel(), 5000);
    });

    try {
        await entersState(voiceConnection, VoiceConnectionStatus.Ready, 30_000);
        audioPlayer = createPlayer();
        voiceConnection.subscribe(audioPlayer);
        console.log("here we go")
        playAudio();
    } catch (error) {
        console.error('Connection Error:', error);
    }
}

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    connectToChannel();
});

// Start the bot
client.login(TOKEN);

// Keep the process alive
process.on('unhandledRejection', error => console.error('Unhandled promise rejection:', error));
setInterval(() => {}, 1 << 30);