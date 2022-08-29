exports.type = 'event';
exports.name = "Command Handler";
exports.event = "messageCreate";

exports.callback = message => {
    let prefix = '~';
    if (!message.content.startsWith(prefix)) return;

    let args = message.content.slice(prefix.length).trim().split(/ +/g);
    let cmd = args.shift().toLowerCase();

    let ran = false;
    for (let [name, command] of commands) {
        // The "allowed" property gives points for "expandability." "can" is true if
        // there is no defined "allowed" property, or if "allowed" is an empty array.
        // Otherwise, it's only true if the command caller is on the allowed array.
        let can = command.allowed?.length ? command.allowed.includes(message.author.id) : true; 
        if (can) {
            for (let call of command.calls) {
                if (cmd === call) {
                    ran = true;
                    try {
                        command.callback(message, args);
                    } catch (err) {
                        console.error(err);
                        message.reply(`An error occured while executing the command \`${name}\`. Please check console for details.`).catch(console.error);
                    } finally {
                        break;
                    }
                }
            }
        }
    }

    if (!ran) {
        message.reply(`Unknown command.`).catch(console.error);
        return;
    }
}