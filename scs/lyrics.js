const { bmbtz } = require("../devbmb/bmbtz");
const fs = require("fs-extra");
const ffmpeg = require("fluent-ffmpeg");
const { Catbox } = require('node-catbox');

const catbox = new Catbox();

// Quoted contact
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

// Upload to Catbox
async function uploadToCatbox(Path) {
    if (!fs.existsSync(Path)) throw new Error("File does not exist");
    const response = await catbox.uploadFile({ path: Path });
    if (!response) throw new Error("Error retrieving the file link");
    return response;
}

// Convert audio to MP3
async function convertToMp3(inputPath, outputPath) {
    return new Promise((resolve, reject) => {
        ffmpeg(inputPath)
            .toFormat("mp3")
            .on("error", reject)
            .on("end", () => resolve(outputPath))
            .save(outputPath);
    });
}

// URL command
bmbtz({ nomCom: "url1", categorie: "General", reaction: "💗" }, async (origineMessage, zk, { msgRepondu, repondre, auteurMessage }) => {
    if (!msgRepondu) return repondre('Please reply to an image, video, or audio file.');

    let mediaPath, mediaTypeName;

    try {
        if (msgRepondu.message.videoMessage) {
            mediaPath = await zk.downloadAndSaveMediaMessage(msgRepondu);
            mediaTypeName = 'Video';
        } else if (msgRepondu.message.imageMessage) {
            mediaPath = await zk.downloadAndSaveMediaMessage(msgRepondu);
            mediaTypeName = 'Image';
        } else if (msgRepondu.message.audioMessage) {
            mediaPath = await zk.downloadAndSaveMediaMessage(msgRepondu);
            const outputPath = `${mediaPath}.mp3`;
            await convertToMp3(mediaPath, outputPath);
            fs.unlinkSync(mediaPath);
            mediaPath = outputPath;
            mediaTypeName = 'Audio';
        } else {
            return repondre('Unsupported media type. Reply with an image, video, or audio file.');
        }

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

    } catch (err) {
        console.error('Error creating URL:', err);
        repondre('Oops, an error occurred.');
    }
});
