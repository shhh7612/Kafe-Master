import { ApplicationCommandOptionType } from 'discord.js';
import { Command } from '../../structures/command.js';
import { channelConfigData } from 'src/types/index.js';
import Config from '../../structures/database/config.js';

export default new Command({
	name: 'channel',
	description: 'Add, Remove, Update or View channel configs',
	options: [
		{
			name: 'add',
			description: 'Add a channel config',
			type: ApplicationCommandOptionType.Subcommand,
			options: [
				{
					name: 'channel',
					description: 'The channel you want to add',
					type: ApplicationCommandOptionType.Channel,
					required: true,
				},
				{
					name: 'emojis',
					description: 'Emojis to react to attachments/allowedurls',
					type: ApplicationCommandOptionType.String,
				},
				{
					name: 'allowedurls',
					description: 'The Urls that get reacted to if there are emojis',
					type: ApplicationCommandOptionType.String,
				},
				{
					name: 'attachmentonlymode',
					description: 'Make the channel only allow (image/video) attachments/allowedurls',
					type: ApplicationCommandOptionType.Boolean,
				},
				{
					name: 'maxmessages',
					description: 'Maximum number of non-attachment messages',
					type: ApplicationCommandOptionType.Number,
				},
				{
					name: 'messages',
					description: 'Messages to send when max messages is reached, messages must be in JSON Array format',
					type: ApplicationCommandOptionType.String,
				},
				{
					name: 'delete_at_max',
					description: 'Delete messages when max messages is reached',
					type: ApplicationCommandOptionType.Boolean,
				},
				{
					name: 'bypassusers_image',
					description: 'User that can bypass attachment only mode',
					type: ApplicationCommandOptionType.String,
				},
				{
					name: 'bypassusers_maxmessages',
					description: 'User that can bypass the maximum number of non-attachment messages',
					type: ApplicationCommandOptionType.String,
				},
			],
		},
		{
			name: 'update',
			description: 'Update a channel config',
			type: ApplicationCommandOptionType.Subcommand,
			options: [
				{
					name: 'channel',
					description: 'The channel you want to add',
					type: ApplicationCommandOptionType.Channel,
					required: true,
				},
				{
					name: 'emojis',
					description: 'Emojis to react to attachments/allowedurls',
					type: ApplicationCommandOptionType.String,
				},
				{
					name: 'allowedurls',
					description: 'The Urls that get reacted to if there are emojis',
					type: ApplicationCommandOptionType.String,
				},
				{
					name: 'attachmentonlymode',
					description: 'Make the channel only allow (image/video) attachments/allowedurls',
					type: ApplicationCommandOptionType.Boolean,
				},
				{
					name: 'maxmessages',
					description: 'Maximum number of non-attachment messages',
					type: ApplicationCommandOptionType.Number,
				},
				{
					name: 'messages',
					description: 'Messages to send when max messages is reached, messages must be in JSON Array format',
					type: ApplicationCommandOptionType.String,
				},
				{
					name: 'delete_at_max',
					description: 'Delete messages when max messages is reached',
					type: ApplicationCommandOptionType.Boolean,
				},
				{
					name: 'bypassusers_image',
					description: 'User that can bypass attachment only mode',
					type: ApplicationCommandOptionType.String,
				},
				{
					name: 'bypassusers_maxmessages',
					description: 'User that can bypass the maximum number of non-attachment messages',
					type: ApplicationCommandOptionType.String,
				},
			],
		},
		{
			name: 'remove',
			description: 'Remove a channel config',
			type: ApplicationCommandOptionType.Subcommand,
			options: [
				{
					name: 'channel',
					description: 'The channel you want to remove',
					type: ApplicationCommandOptionType.Channel,
					required: true,
				},
			],
		},
		{
			name: 'view',
			description: 'View a list of all channels that have configs',
			type: ApplicationCommandOptionType.Subcommand,
			options: [
				{
					name: 'channel',
					description: 'The channel you want to view the config of',
					type: ApplicationCommandOptionType.Channel,
				},
			],
		},
	],
	aliases: [],
	category: 'config',
	permissions: ['Administrator'],
	disabled: true,
	async slashCommand(interaction, options) {
		const subOptions = options[0];
		const subSubOptions = subOptions.options as typeof options;

		let channel = subSubOptions.find((a) => a.name === 'channel')?.value;
		let emojis = `${subSubOptions.find((a) => a.name === 'emojis')?.value || ['']}`.split(' ');
		let allowedURLs = `${subSubOptions.find((a) => a.name === 'allowedurls')?.value || ['']}`.split(' ');
		let attachmentOnlyMode = subSubOptions.find((a) => a.name === 'attachmentonlymode')?.value || false;
		let maxMessages = subSubOptions.find((a) => a.name === 'maxmessages')?.value || 0;
		let messages = `${subSubOptions.find((a) => a.name === 'messages')?.value || ['']}`.split(';');
		let deleteAtMax = subSubOptions.find((a) => a.name === 'delete_at_max')?.value || false;
		let bypassUsersImage = `${subSubOptions.find((a) => a.name === 'bypassusers_image')?.value || ['']}`.split(' ');
		let bypassUsersMaxMessages = `${subSubOptions.find((a) => a.name === 'bypassusers_maxmessages')?.value || ['']}`.split(' ');
        let data = JSON.stringify({ emojis, allowedURLs, attachmentOnlyMode, maxMessages, messages, deleteAtMax, bypassUsersImage, bypassUsersMaxMessages });

		if (subOptions.name === 'add') {
            let config = (await Config.findOne({ where: { type: `channel_${channel}` } })) as Config;
            if (config?.data) return interaction.editReply(`Config for \`${channel}\` already has a config, please use the \`channel update\` or \`channel remove\` command.`)
			new Config({ type: `channel_${channel}`, data }).save();
			interaction.editReply(
				`Added settings for this channel\n**Channel:** <#${channel}>\n**Attachment Emojis:** ${emojis}\n**Allowed URLs:** ${allowedURLs}\n**Attachment only mode:** ${attachmentOnlyMode}\n**Max Non-Attachment Messages:** ${maxMessages}\n**Attachment bypass:** ${bypassUsersImage}\n**Max Messages bypass:** ${bypassUsersMaxMessages}`
			);
		} else if (subOptions.name === 'update') {
			let config = (await Config.findOne({ where: { type: `channel_${channel}` } })) as Config;
			if (!config?.data) return interaction.editReply('That channel does not have an existing config, use the add subcommand to create a new one instead.');
			let ocd: channelConfigData = JSON.parse(config.data);
			config.data = data;
			config.save();
			interaction.editReply(
				`Updated settings for this channel\n**Channel:** <#${channel}>\n**Attachment Emojis:** ${emojis} => ${ocd.emojis}\n**Allowed URLs:** ${allowedURLs} => ${ocd.allowedURLs}\n**Attachment only mode:** ${attachmentOnlyMode} => ${ocd.attachmentOnlyMode}\n**Max Non-Attachment Messages:** ${maxMessages} => ${ocd.maxMessages}\n**Attachment bypass:** ${bypassUsersImage} => ${ocd.bypassUsersImage}\n**Max Messages bypass:** ${bypassUsersMaxMessages} => ${ocd.bypassUsersMaxMessages}`
			);
		} else if (subOptions.name === 'remove') {
			(await Config.findOne({ where: { type: `channel_${channel}` } }))?.destroy();
			interaction.editReply(`Channel config \`${channel}\` has been removed.`);
		} else if (subOptions.name === 'view') {
			if (!channel) {
				let configs = await Config.findAll();
				let channels: Array<string> = [];
				for (const config of configs) {
					if (config.type.includes('channel')) channels.push(`${config.type.replace('channel_', '<#')}>`);
				}
				if (!channels[0]) interaction.editReply('No Channel configs exist.');
				else interaction.editReply(`Here are all the channels that have configs ${channels.join(' ')}`);
			} else {
				let channelConfig = (await Config.findOne({ where: { type: `channel_${channel}` } })) as Config;
				if (!channelConfig?.type) return interaction.editReply('The specified channel does not have a config.');
				const channelConfigData: channelConfigData = JSON.parse(channelConfig?.data);
				interaction.editReply(
					JSON.stringify(channelConfigData, null, 1)
						.replaceAll('\\"', "'")
						.replace(/\{|\}|\"/g, '')
				);
			}
		}
	},
});
