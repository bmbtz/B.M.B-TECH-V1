const { zokou } = require(__dirname + "/../framework/zokou");

const gameData = {}; // Store the random number per user

zokou(
  {
    nomCom: "guess",
    categorie: "Fun",
    reaction: "🎮",
    fromMe: false,
  },
  async (dest, zk, commandeOptions) => {
    const { ms, repondre, prefixe, body } = commandeOptions;
    const sender = ms.key.participant || ms.key.remoteJid;

    if (body.trim().toLowerCase() === `${prefixe}guess`) {
      const randomNumber = Math.floor(Math.random() * 5) + 1;
      gameData[sender] = randomNumber;

      await repondre(
        `🎮 *GUESS THE NUMBER GAME*\n\nChoose the correct number between *1 and 5*\n🗣 Reply with your guess (e.g., 3)`
      );
      return;
    }

    if (gameData[sender]) {
      const guess = parseInt(body.trim());
      if (isNaN(guess)) {
        await repondre(`⚠️ Please send a number between 1 and 5 as your guess.`);
        return;
      }

      if (guess < 1 || guess > 5) {
        await repondre(`⚠️ Please choose a number between 1 and 5 only.`);
        return;
      }

      const answer = gameData[sender];

      if (guess === answer) {
        await repondre(`✅ Correct! You won 🎉\nThe number was ${answer}`);
      } else {
        await repondre(`❌ Wrong guess. Try again.\nThe correct number was: ${answer}`);
      }

      delete gameData[sender];
      return;
    }

    await repondre(`💡 Send *${prefixe}guess* to start the Guess The Number game.`);
  }
);
