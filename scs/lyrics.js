const { Sticker, createSticker, StickerTypes } = require('wa-sticker-formatter');
const { bmbtz } = require("../devbmb/bmbtz");
const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const fs = require("fs-extra");
const ffmpeg = require("fluent-ffmpeg");
const { Catbox } = require('node-catbox');

const catbox = new Catbox();

// Quoted contact message
const quotedContact = {
  key: {
    fromMe: false,
    participant: `0@s.whatsapp.net`,
    remoteJid: "status@broadcast"
  },
  message: {
    contactMessage: {
      displayName: "B.M.B TECH VERIFIED ✅",
      vcard: "BEGIN:VCARD\nVERSION:3.0\nFN:B.M.B TECH VERIFIED ✅\nORG:BMB-TECH BOT;\nTEL;type=CELL;type=VOICE;waid=255767862457:+255767862457\nEND:VCARD"
    }
  }
};

// Upload function
async function uploadToCatbox(Path) {
    if (!fs.existsSync(Path)) throw new Error("File does not exist");
    try {
        const response = await catbox.uploadFile({ path: Path });
        if (response) return response;
        else throw new Error("Error retrieving the file link");
    } catch (err) {
        throw new Error(String(err));
    }
}

// Convert audio to MP3
async function convertToMp3(inputPath, outputPath) {
    return new Promise((resolve, reject) => {
        ffmpeg(inputPath)
            .toFormat("mp3")
            .on("error", (err) => reject(err))
            .on("end", () => resolve(outputPath))
            .save(outputPath);
    });
}

// URL command
bmbtz({ nomCom: "url1", categorie: "General", reaction: "💗" }, async (origineMessage, zk, commandeOptions) => {
    const { msgRepondu, repondre, ms, auteurMessage } = commandeOptions;

    if (!msgRepondu) {
        repondre('Please reply to an image, video, or audio file.');
        return;
    }

    let mediaPath, mediaType, mediaTypeName;

    if (msgRepondu.videoMessage) {
        const videoSize = msgRepondu.videoMessage.fileLength;
        if (videoSize > 50 * 1024 * 1024) {
            repondre('The video is too long. Please send a smaller video.');
            return;
        }
        mediaPath = await zk.downloadAndSaveMediaMessage(msgRepondu.videoMessage);
        mediaType = 'video';
        mediaTypeName = 'Video';
    } else if (msgRepondu.imageMessage) {
        mediaPath = await zk.downloadAndSaveMediaMessage(msgRepondu.imageMessage);
        mediaType = 'image';
        mediaTypeName = 'Image';
    } else if (msgRepondu.audioMessage) {
        mediaPath = await zk.downloadAndSaveMediaMessage(msgRepondu.audioMessage);
        mediaType = 'audio';
        mediaTypeName = 'Audio';
        const outputPath = `${mediaPath}.mp3`;
        try {
            await convertToMp3(mediaPath, outputPath);
            fs.unlinkSync(mediaPath);
            mediaPath = outputPath;
        } catch (error) {
            console.error("Error converting audio to MP3:", error);
            repondre('Failed to process the audio file.');
            return;
        }
    } else {
        repondre('Unsupported media type. Reply with an image, video, or audio file.');
        return;
    }

    try {
        const catboxUrl = await uploadToCatbox(mediaPath);
        fs.unlinkSync(mediaPath);

        const urlMessageBox = `🟩──[ 💀B.M.B-TECH URL ]──🟩
📁 TYPE   : ${mediaTypeName}
🌍 LINK   : ${catboxUrl}
👤 USER   : ${auteurMessage.split('@')[0] || "Anonymous"}
⏱️ TIME   : ${new Date().toLocaleString('en-GB')}
✅ STATUS : SUCCESS`;

        await zk.sendMessage(origineMessage, {
            text: urlMessageBox,
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: "120363382023564830@newsletter",
                    newsletterName: "𝙱.𝙼.𝙱-𝚇𝙼𝙳",
                    serverMessageId: 1
                }
            }
        }, { quoted: quotedContact });

    } catch (error) {
        console.error('Error while creating your URL:', error);
        repondre('Oops, an error occurred.');
    }
});
