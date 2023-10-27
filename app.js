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
import { GameManager } from './game.js';

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

    // "np-help" command
    if (name === 'np-help') {
      // Send a message into the channel where command was triggered from
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          flags: InteractionResponseFlags.EPHEMERAL,
          content: `
This bot allows you to schedule netplay games, the following commands are available:
/np-help
/np-schedule <rom> <md5> <time>
/np-list-players <gameid>
/np-join <gameid>
/np-leave <gameid>
/np-remove-game <gameid>
/np-new-king <@userid>
/np-next-player <gameid>
/np-reminder
          `
        },
      });
    }

    // "np-schedule" command
    if (name === 'np-schedule' && id) {
      const userId = req.body.member.user.id;
      const rom = req.body.data.options[0].value;
      const md5 = req.body.data.options[1].value;
      const time = req.body.data.options[2].value;

      // Create active game using message ID as the game ID
      let gameid = GameManager.createGame(rom, md5, time, userId);

      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          flags: InteractionResponseFlags.EPHEMERAL,
          content: `Scheduled netplay game. The GameID is <${gameid}>, the KoH is <@${userId}>.`,
        },
      });
    }

    // "list-players" command
    if (name === 'np-list-players' && id) {
      const gameid = req.body.data.options[0].value;

      let output = "The following players are in the queue:\n";

      let playerNames = GameManager.getPlayers(gameid);
      if(playerNames.length) {
        playerNames = playerNames.map((p) => "\t\t" + p);
        output += playerNames.join("\n");
      }
      else {
        output = "There are no players yet.";
      }

      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          flags: InteractionResponseFlags.EPHEMERAL,
          content: output,
        },
      });
    }

    // "np-join" command
    if (name === 'np-join' && id) {
      const userId = req.body.member.user.id;
      const gameid = req.body.data.options[0].value;

      // Adds the user to the game queue
      let output = "You have joined the game. List of players:\n";
      let ok = GameManager.addPlayer(gameid, userId);
      if(ok) {
        let playerNames = GameManager.getPlayers(gameid);
        if(playerNames.length) {
            playerNames = playerNames.map((p) => "\t\t" + p);
            output += playerNames.join("\n");
        }
      }
      else {
        output = "You have already joined this game";
      }

      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          flags: InteractionResponseFlags.EPHEMERAL,
          content: output,
        },
      });
    }

    // "np-leave" command
    if (name === 'np-leave' && id) {
      const userId = req.body.member.user.id;
      const gameid = req.body.data.options[0].value;

      // Removes the user from the game queue
      GameManager.removePlayer(gameid, userId);

      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          flags: InteractionResponseFlags.EPHEMERAL,
          content: `You have leaved the game.`,
        },
      });
    }

    // "np-remove-game" command
    if (name === 'np-remove-game' && id) {
      const userId = req.body.member.user.id;
      const gameid = req.body.data.options[0].value;

      // Removes the game
      let output = '';
      let ok = GameManager.removeGame(gameid, userId);
      if(ok) {
        output = "You have removed the game.";
      }
      else {
        output = "You don't have the rights to delete this game";
      }
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          flags: InteractionResponseFlags.EPHEMERAL,
          content: output
        },
      });
    }

    // "np-new-king" command
    if (name === 'np-new-king' && id) {
      const userId = req.body.member.user.id;
      const gameid = req.body.data.options[0].value;
      const koh = req.body.data.options[1].value;

      // The current king declares the new-king
      GameManager.setKOH(gameid, userId, koh);

      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
            content: `The new KoH for Game <${gameid}> is <@${koh}>.`,
        },
      });
    }

    // "np-next-player" command
    if (name === 'np-next-player' && id) {
      const userId = req.body.member.user.id;
      const gameid = req.body.data.options[0].value;

      // Gets the next player to notify that it is his turn.
      // Only the current KOH can issue this command.
      let output = "";
      let nextPlayer = GameManager.getNextPlayer(gameid, userId);
      if(nextPlayer) {
        // Notifies the next player
        output = `The next player to play is <@${nextPlayer}>. Go ahead and good luck, maybe you will become the next King of the Hill !.`;
      }
      else if(nextPlayer === null) {
        // There is no gameid or you dont have permissions to issue this cmd.
        let koh = GameManager.getKOH(gameid);
        if(koh) {
          output = `Only the current KOH <@${koh}> can issue this command.`;
        }
        else {
          output = `The gameid <${gameid}> does not exist.`;
        }
      }
      else if(nextPlayer === 0) {
        // There are no more players in the queue.
        output = "There are no more players to play against.";
      }


      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
            content: output
        },
      });
    }

    // "np-reminder" command
    if (name === 'np-reminder' && id) {

      let output = "The following games are scheduled:\n\n";
      let aux = '';

      let games = GameManager.getGames();
      games.forEach((game) => {
        aux += `Game <${game.gameid}> : ` + game.rom + " (" + game.md5 + ") starts at " + game.time + "\n";
        let playerNames = GameManager.getPlayers(game.gameid);
        if(playerNames.length) {
          playerNames = playerNames.map((p) => "\t\t" + p);
          aux += playerNames.join("\n");
          aux += "\n\n";
        }
      });

      if(! aux) {
        output = "There are no scheduled games yet.";
      }
      else {
        aux += "Use /np-join <gameid> to join the game queue.";
        output += aux;
      }

      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
            content: output,
        },
      });
    }

  }


});

app.listen(PORT, () => {
  console.log('Listening on port', PORT);
});
