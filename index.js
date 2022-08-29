const Discord = require('discord.js');
const fs      = require('fs');

require('dotenv').config();

let intents = Discord.Intents.FLAGS;
const client = new Discord.Client({
    intents: [
        intents.GUILDS,
        intents.GUILD_MEMBERS,
        intents.GUILD_MESSAGES,
    ]
});

// NOTE:
// Despite the convenience of globals, they are considered "bad practice."
// I am only using them with the following maps and functions to make this challenge easier. 
// It doesn't need to be harder than it needs to be. That being said, if you plan to actually
// use your handler for a bot and will work on it with others, it might be a good idea to use
// as little globals as possible. Globals will not hurt your challenge score in any way.
global.commands = new Map();
global.eventHandlers = new Map();
global.plugins = new Map();

// loadFile takes a file path input, loads it, and takes its exports to determine what type of plugin map it should be added to above
global.loadFile = file => {
    if (require.cache[require.resolve(file)]) {
        delete require.cache[require.resolve(file)];
    }

    let plugin = require(file);
    plugin.file = file; // File is used in the hotloader command - it makes it so we don't have to figure out where a plugin came from, we already know
    if (plugin.type === 'command') {
        commands.set(plugin.name, plugin);
    } else if (plugin.type === 'event') {
        eventHandlers.set(plugin.name, plugin);
    }
    plugins.set(file, plugin);

    return plugin;
}

// requireAll takes a folder path input, and recursively calls itself and loadFile to load any plugins in the folder and its subfolders 
global.requireAll = dir => {
    let plugins = [];
    fs.readdirSync(dir).forEach(file => {
        let path = dir + '/' + file;
        if (fs.statSync(path).isDirectory()) {
            plugins.push(...requireAll(path));
        } else {
            if (path.endsWith('.js')) {
                plugins.push(loadFile(path));
            }
        }
    });
    return plugins;
}

requireAll('./plugins');

for (let [_, ev] of eventHandlers) {
    client.on(ev.event, ev.callback);
}

client.login();