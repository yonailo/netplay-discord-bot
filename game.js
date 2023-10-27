
// this is our GameManager object
export const GameManager = (function () {
  let activeGames =  {};
  let id = 0;
  let yonailoID = '514066518687088641';

  return {
    createGame: function(rom, md5, time, userId) {
      id += 1;

      activeGames[id] = {
        userId,
        rom,
        md5,
        time,
        players: [],
        koh: userId
      }

      return id;
    },

    removeGame: function(gameid, userId) {
      if(activeGames[gameid]) {
        let game = activeGames[gameid];

        // Only the userId that has scheduled the game can delete it
        if(game.userId == userId) {
          delete activeGames[gameid];
          return true;
        }

        // YonailoID can delete too
        if(userId == yonailoID) {
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
          time: aux.time,
          koh: aux.koh
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
        if(! activeGames[gameid].players.includes(userId)) {
          activeGames[gameid].players.push(userId);
          return true;
        }
      }

      return false;
    },

    removePlayer: function(gameid, userId) {
      if(activeGames[gameid]) {
        activeGames[gameid].players = activeGames[gameid].players.filter((item) => item != userId);
      }
    },

    getKOH: function(gameid) {
      if(activeGames[gameid]) {
        return activeGames[gameid].koh;
      }
      else {
        return null;
      }
    },

    setKOH: function(gameid, userId, new_koh) {
      if(activeGames[gameid]) {
        // Only the current KOH can elect a new KOH
        if(activeGames[gameid].koh == userId) {
          activeGames[gameid].koh = new_koh;
        }

        // YonailoID can elect too
        if(userId == yonailoID) {
          activeGames[gameid].koh = new_koh;
        }
      }
    },

    getNextPlayer: function(gameid, userId) {
      if(! activeGames[gameid]) {
        return null;
      }

      // Only the current KOH can issue this command (or yonailoID)
      if((activeGames[gameid].koh == userId) || (userId == yonailoID)) {
        const nextPlayer = activeGames[gameid].players[0] || 0;
        if(nextPlayer) {
          // Removes this player from the queue
          activeGames[gameid].players = activeGames[gameid].players.filter((item) => item != nextPlayer);
        }

        return nextPlayer;
      }
      else {
        return null;
      }
    }
  }

})();

