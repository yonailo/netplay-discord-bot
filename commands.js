import 'dotenv/config';
import { InstallGlobalCommands } from './utils.js';

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// command types:  @see: https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-types
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Command /np-help
const HELP_COMMAND = {
  name: 'np-help',
  description: 'Help command',
  type: 1, // CHAT-INPUT,
};

// Command /np-schedule
const SCHEDULE_COMMAND = {
  name: 'np-schedule',
  description: 'Schedules a netplay game',
  options: [
    {
      type: 3, // STRING,
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

// Command /np-list-players
const LIST_PLAYERS_COMMAND = {
  name: 'np-list-players',
  description: 'List games players',
  options: [
    {
      type: 3, // STRING,
      name: 'gameid',
      description: 'Game id',
      required: true
    },
  ],
  type: 1, // CHAT-INPUT,
};

// Command /np-join
const JOIN_COMMAND = {
  name: 'np-join',
  description: 'Joins a game',
  options: [
    {
      type: 3, // STRING,
      name: 'gameid',
      description: 'Game id',
      required: true
    },
  ],
  type: 1, // CHAT-INPUT
};

// Command /np-leave
const LEAVE_COMMAND = {
  name: 'np-leave',
  description: 'Leaves a game',
  options: [
    {
      type: 3, // STRING,
      name: 'gameid',
      description: 'Game id',
      required: true
    },
  ],
  type: 1, // CHAT-INPUT
};

// Command /np-remove-game
const REMOVE_COMMAND = {
  name: 'np-remove-game',
  description: 'Removes an scheduled game',
  options: [
    {
      type: 3, // STRING,
      name: 'gameid',
      description: 'Game id',
      required: true
    },
  ],
  type: 1, // CHAT-INPUT
};

// Command /np-new-king
const NEW_KING_COMMAND = {
  name: 'np-new-king',
  description: 'Declares the new KoH',
  options: [
    {
      type: 3, // STRING,
      name: 'gameid',
      description: 'Game id',
      required: true
    },
    {
      type: 6, // USER,
      name: 'koh',
      description: 'KoH userId',
      required: true
    },
  ],
  type: 1, // CHAT-INPUT
};

// Command /np-next-player
const NEXT_PLAYER_COMMAND = {
  name: 'np-next-player',
  description: 'Contact the new opponent',
  options: [
    {
      type: 3, // STRING,
      name: 'gameid',
      description: 'Game id',
      required: true
    }
  ],
  type: 1, // CHAT-INPUT
};

// Command /np-reminder
const REMINDER_COMMAND = {
  name: 'np-reminder',
  description: 'Reminder of currently scheduled games',
  type: 1, // CHAT-INPUT
};

const ALL_COMMANDS = [
  HELP_COMMAND,
  SCHEDULE_COMMAND,
  LIST_PLAYERS_COMMAND,
  JOIN_COMMAND,
  LEAVE_COMMAND,
  REMOVE_COMMAND,
  NEW_KING_COMMAND,
  NEXT_PLAYER_COMMAND,
  REMINDER_COMMAND
];

InstallGlobalCommands(process.env.APP_ID, ALL_COMMANDS);