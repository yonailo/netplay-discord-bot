import 'dotenv/config';
import { InstallGlobalCommands } from './utils.js';


// Command /help
const HELP_COMMAND = {
  name: 'help',
  description: 'Help command',
  type: 1, // CHAT-INPUT, @see: https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-types
};

// Command /schedule
const SCHEDULE_COMMAND = {
  name: 'schedule',
  description: 'Schedules a netplay game',
  options: [
    {
      type: 3, // STRING, @see: https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-type
      name: 'rom',
      description: 'ROM name',
      required: true
    },
    {
      type: 3, // STRING
      name: 'md5',
      description: 'MD5',
      required: true
    },
    {
      type: 3, // STRING
      name: 'time',
      description: 'Time',
      required: true
    },
  ],
  type: 1, // CHAT-INPUT
};

// Command /list-games
const LIST_GAMES_COMMAND = {
  name: 'list-games',
  description: 'List scheduled games',
  type: 1, // CHAT-INPUT, @see: https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-types
};

// Command /list-players
const LIST_PLAYERS_COMMAND = {
  name: 'list-players',
  description: 'List games players',
  options: [
    {
      type: 3, // STRING, @see: https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-type
      name: 'id',
      description: 'Game id',
      required: true
    },
  ],
  type: 1, // CHAT-INPUT, @see: https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-types
};

// Command /join
const JOIN_COMMAND = {
  name: 'join',
  description: 'Joins a game',
  options: [
    {
      type: 3, // STRING, @see: https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-type
      name: 'id',
      description: 'Game id',
      required: true
    },
  ],
  type: 1, // CHAT-INPUT
};

// Command /leave
const LEAVE_COMMAND = {
  name: 'leave',
  description: 'Leaves a game',
  options: [
    {
      type: 3, // STRING, @see: https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-type
      name: 'id',
      description: 'Game id',
      required: true
    },
  ],
  type: 1, // CHAT-INPUT
};

// Command /remove-game
const REMOVE_COMMAND = {
  name: 'remove-game',
  description: 'Removes an scheduled game',
  options: [
    {
      type: 3, // STRING, @see: https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-type
      name: 'id',
      description: 'Game id',
      required: true
    },
  ],
  type: 1, // CHAT-INPUT
};

// Command /new-king
const NEW_KING_COMMAND = {
  name: 'new-king',
  description: 'Declares the new KoH',
  options: [
    {
      type: 3, // STRING, @see: https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-type
      name: 'id',
      description: 'Game id',
      required: true
    },
    {
      type: 6, // USER, @see: https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-type
      name: 'koh',
      description: 'KoH userId',
      required: true
    },
  ],
  type: 1, // CHAT-INPUT
};

// Command /next-player
const NEXT_PLAYER_COMMAND = {
  name: 'next-player',
  description: 'Contact the new opponent',
  options: [
    {
      type: 3, // STRING, @see: https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-type
      name: 'id',
      description: 'Game id',
      required: true
    }
  ],
  type: 1, // CHAT-INPUT
};

const ALL_COMMANDS = [
  HELP_COMMAND,
  SCHEDULE_COMMAND,
  LIST_GAMES_COMMAND,
  LIST_PLAYERS_COMMAND,
  JOIN_COMMAND,
  LEAVE_COMMAND,
  REMOVE_COMMAND,
  NEW_KING_COMMAND,
  NEXT_PLAYER_COMMAND
];

InstallGlobalCommands(process.env.APP_ID, ALL_COMMANDS);