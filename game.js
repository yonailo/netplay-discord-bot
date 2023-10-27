import { capitalize } from './utils.js';



// this is our GameManager object
export const GameManager = (function () {
  let activeGames =  {};
  let id = 0;

  return {
    createGame: function(rom, md5, time, userId) {
      id += 1;

      activeGames[id] = {
        userId,
        rom,
        md5,
        time,
        players: [userId],
        koh: userId
      }

      return id;
    },

    removeGame: function(gameid, userId) {
      if(activeGames[gameid]) {
        let game = activeGames[gameid];

        if(game.userId == userId) {
          delete activeGames[gameid];
          return true;
        }
      }

      return false;
    },

    getGames: function() {
      let games = [];

      for(let gameid in activeGames) {
        let aux = activeGames[gameid];

        let game = {
          gameid: gameid,
          rom: aux.rom,
          md5: aux.md5,
          time: aux.time
        }

        games.push(game);
      }

      return games;
    },

    getPlayers: function(gameid) {
      if(! activeGames[gameid]) {
        return [];
      }

      let playerNames = activeGames[gameid].players.map((player) => `<@${player}>`);
      return playerNames;
    },

    addPlayer: function(gameid, userId) {
      if(activeGames[gameid]) {
        activeGames[gameid].players.push(userId);
      }
    },

    removePlayer: function(gameid, userId) {
      if(activeGames[gameid]) {
        activeGames[gameid].players = activeGames[gameid].players.filter((item) => item != userId);
        if(! activeGames[gameid].players.length) {
          delete activeGames[gameid];
        }
      }
    },

    setKOH: function(gameid, userId) {
      if(activeGames[gameid]) {
        activeGames[gameid].koh = koh;
      }
    },

    getNextPlayer: function(gameid) {
      if(! activeGames[gameid]) {
        return null;
      }

      const nextPlayer = activeGames[gameid].players[0] || null;
      if(nextPlayer) {
        // Removes this player from the queue
        activeGames[gameid].players = activeGames[gameid].players.filter((item) => item != nextPlayer);
      }

      if(! activeGames[gameid].players.length) {
        delete activeGames[gameid];
      }

      return nextPlayer;

    }
  }

})();

