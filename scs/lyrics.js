const { bmbtz } = require("../devbmb/bmbtz");
const axios = require('axios');
const ytSearch = require('yt-search');
const conf = require(__dirname + '/../settings');

// AUDIO COMMAND (play5)
bmbtz({
  nomCom: "play5",
  aliases: ["song2", "playdoc2", "audio2", "3mp3"],
  categorie: "Search",
  reaction: "🎧"
}, async (dest, zk, commandOptions) => {
  const { arg, ms, repondre } = commandOptions;
  if (!arg[0]) return repondre("Please provide a video name.");

  const query = arg.join(" ");

  try {
    const searchResults = await ytSearch(query);
    if (!searchResults || !searchResults.videos.length) {
      return repondre('No video found for the specified query.');
    }

    const video = searchResults.videos[0];
    const api = `https://api.delirius.store/download/ytmp3?url=${encodeURIComponent(video.url)}`;
    const { data } = await axios.get(api);

    if (!data?.result?.downloadUrl) {
      return repondre("Failed to retrieve download link.");
    }

    const downloadUrl = data.result.downloadUrl;

    await zk.sendMessage(dest, {
      audio: { url: downloadUrl },
      mimetype: 'audio/mpeg',
      contextInfo: {
        externalAdReply: {
          title: video.title,
          body: video.title,
          mediaType: 1,
          sourceUrl: conf.GURL,
          thumbnailUrl: video.thumbnail,
          renderLargerThumbnail: true,
          showAdAttribution: true,
        }
      }
    }, { quoted: ms });

  } catch (error) {
    console.error('Error:', error);
    return repondre(`❌ Download failed: ${error.message}`);
  }
});
