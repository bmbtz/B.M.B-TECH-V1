const { bmbtz } = require("../devbmb/bmbtz");
const axios = require("axios");

bmbtz({
  nomCom: "iyrics",
  reaction: '🎵',
  categorie: "Music",
  aliases: ["lyric", "mistari"]
}, async (dest, zk, commandeOptions) => {
  const { repondre, arg, ms } = commandeOptions;
  const songName = arg.join(" ").trim();

  if (!songName) {
    return repondre("Please provide a song name. Example: *.lyrics Shape of You*");
  }

  const apis = [
    `https://iamtkm.vercel.app/search/lyrics?q=${encodeURIComponent(songName)}`,
    `https://www.dark-yasiya-api.site/other/lyrics?text=${encodeURIComponent(songName)}`,
    `https://api.davidcyriltech.my.id/lyrics?title=${encodeURIComponent(songName)}`
  ];

  let lyricsData;
  for (const api of apis) {
    try {
      const response = await axios.get(api);
      if (response.data?.result?.lyrics) {
        lyricsData = response.data;
        break;
      }
    } catch (error) {
      console.error(`API ${api} failed:`, error.message);
    }
  }

  if (!lyricsData?.result) {
    return repondre("❌ Couldn't find lyrics for *" + songName + "*");
  }

  const { title, artist, thumb, lyrics } = lyricsData.result;
  const imageUrl = thumb || "https://files.catbox.moe/rpea5k.jpg";

  try {
    const imageResponse = await axios.get(imageUrl, { responseType: "arraybuffer" });
    const imgBuffer = Buffer.from(imageResponse.data);

    await zk.sendMessage(dest, {
      image: imgBuffer,
      caption: `🎶 *${title}* - ${artist}\n\n${lyrics.substring(0, 3500)}\n\n*Powered by B.M.B-TECH*`,
      contextInfo: {
        externalAdReply: {
          title: "B.M.B-TECH Lyrics Finder",
          body: "Get any song lyrics instantly",
          thumbnail: imgBuffer,
          mediaType: 1,
          mediaUrl: "",
          sourceUrl: ""
        }
      }
    }, { quoted: ms });

  } catch (error) {
    console.error("Error sending lyrics:", error);
    repondre(`🎶 *${title}* - ${artist}\n\n${lyrics.substring(0, 2000)}...\n\n*[Truncated - image failed to load]*`);
  }
});
