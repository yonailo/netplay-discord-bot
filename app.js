import 'dotenv/config';
import express from 'express';
import {
  InteractionType,
  InteractionResponseType,
  InteractionResponseFlags,
  MessageComponentTypes,
  ButtonStyleTypes,
} from 'discord-interactions';
import { VerifyDiscordRequest, getRandomEmoji, DiscordRequest } from './utils.js';
import { getShuffledOptions, getResult } from './game.js';

// Create an express app
const app = express();
// Get port, or default to 3000
const PORT = process.env.PORT || 3000;
// Parse request body and verifies incoming requests using discord-interactions package
app.use(express.json({ verify: VerifyDiscordRequest(process.env.PUBLIC_KEY) }));

// Store for in-progress games. In production, you'd want to use a DB
const activeGames = {};

/**
 * Interactions endpoint URL where Discord will send HTTP requests
 */
app.post('/interactions', async function (req, res) {
  // Interaction type and data
  const { type, id, data } = req.body;

  /**
   * Handle verification requests
   */
  if (type === InteractionType.PING) {
    return res.send({ type: InteractionResponseType.PONG });
  }

  /**
   * Handle slash command requests
   * See https://discord.com/developers/docs/interactions/application-commands#slash-commands
   */
  if (type === InteractionType.APPLICATION_COMMAND) {
    const { name } = data;

    // "test" command
    if (name === 'help') {
      // Send a message into the channel where command was triggered from
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          // Fetches a random emoji to send from a helper function
          content: `
This bot allows you to schedule netplay games, the following commands are available:
/help
/schedule <rom> <md5> <time>
/list-games
/list-players
/join <id>
/leave <id>
/remove-game <id>
/new-king <@userid>
/next-player
          `
        },
      });
    }

    // "schedule" command
    if (name === 'schedule' && id) {
      const userId = req.body.member.user.id;
      const rom = req.body.data.options[0].value;
      const md5 = req.body.data.options[1].value;
      const time = req.body.data.options[2].value;

      // Create active game using message ID as the game ID
      activeGames[id] = {
          id: userId,
          rom,
          md5,
          time,
          players: [userId],
          koh: userId
      };

      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
            content: `Scheduled netplay game. The GameID is "${id}", the KoH is <@${userId}>.`,
        },
      });
    }

    // "list-games" command
    if (name === 'list-games' && id) {

      let output = "The following games are scheduled:\n";
      let aux = '';
      for(let gameid in activeGames) {
        let game = activeGames[gameid];

        aux += `Game ${gameid} : ` + game.rom + " (" + game.md5 + ") at " + game.time + "\n";
      }

      if(! aux) {
        output = "There are no scheduled games yet";
      }
      else {
        output += aux;
      }

      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
            content: output,
        },
      });
    }

    // "list-players" command
    if (name === 'list-players' && id) {
      const gameid = req.body.data.options[0].value;

      let output = "The following players are in the queue:\n";

      let playerNames = activeGames[gameid].players.map((player) => `<@${player}>`);
      output += playerNames.join("\n");

      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
            content: output,
        },
      });
    }

    // "join" command
    if (name === 'join' && id) {
      const userId = req.body.member.user.id;
      const gameid = req.body.data.options[0].value;

      // Adds the user to the game queue
      let output = 'You have already joined this game.';
      if(! activeGames[gameid].players.includes(userId)) {
        activeGames[gameid].players.push(userId);
        let output = "You have joined the game. List of players:\n";
      }

      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
            content: output,
        },
      });
    }

    // "leave" command
    if (name === 'leave' && id) {
      const userId = req.body.member.user.id;
      const gameid = req.body.data.options[0].value;

      // Removes the user from the game queue
      activeGames[gameid].players = activeGames[gameid].players.filter((item) => item != userId);
      if(! activeGames[gameid].players.length) {
        delete activeGames[gameid];
      }

      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
            content: `You have leaved the game.`,
        },
      });
    }

    // "remove-game" command
    if (name === 'remove-game' && id) {
      const userId = req.body.member.user.id;
      // User's object choice
      const gameid = req.body.data.options[0].value;

      // Removes the game
      delete activeGames[gameid];

      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
            content: `You have removed the game.`,
        },
      });
    }

    // "new-king" command
    if (name === 'new-king' && id) {
      const userId = req.body.member.user.id;
      const gameid = req.body.data.options[0].value;
      const koh = req.body.data.options[1].value;

      // Declares the new-king
      activeGames[gameid].koh = koh;

      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
            content: `The new KoH is <@${koh}>.`,
        },
      });
    }

    // "next-player" command
    if (name === 'next-player' && id) {
      const userId = req.body.member.user.id;
      const gameid = req.body.data.options[0].value;

      // Gets the next player to notify him
      const nextPlayer = activeGames[gameid].players[0] || null;
      let output = "There are no more players to play against.";
      if(nextPlayer) {
        // Removes this player from the queue
        activeGames[gameid].players = activeGames[gameid].players.filter((item) => item != nextPlayer);
        // Notifies the next player
        output = `The next player to play is <@${nextPlayer}>.`;
      }
      else {
        delete activeGames[gameid];
      }

      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
            content: output
        },
      });
    }

  }


});

app.listen(PORT, () => {
  console.log('Listening on port', PORT);
});
