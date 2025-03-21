import * as Discord from "discord.js";

import { BotComponent } from "../bot-component.js";
import { CommandSetBuilder } from "../command-abstractions/command-set-builder.js";
import { Wheatley } from "../wheatley.js";
import { EarlyReplyMode, TextBasedCommandBuilder } from "../command-abstractions/text-based-command-builder.js";
import { TextBasedCommand } from "../command-abstractions/text-based-command.js";
import { Github } from "../infra/github.js";

import { M } from "../utils/debugging-and-logging.js";

export default class Contributors extends BotComponent {
    github: Github | null;

    static override get is_freestanding() {
        return true;
    }

    constructor(wheatley: Wheatley) {
        super(wheatley);
    }

    override async setup(commands: CommandSetBuilder) {
        if (this.wheatley.parameters.github) {
            this.github = new Github(
                this.wheatley.parameters.github!.client_id,
                this.wheatley.parameters.github!.client_secret,
            );

            commands.add(
                new TextBasedCommandBuilder("associate-github", EarlyReplyMode.none)
                    .set_description("Start GitHub account association")
                    // .set_permissions(BigInt(0))
                    // .set_contexts(Discord.InteractionContextType.BotDM)
                    .set_handler(this.associate.bind(this)),
            );

            commands.add(
                new TextBasedCommandBuilder("unassociate-github", EarlyReplyMode.none)
                    .set_description("Delete GitHub account association")
                    // .set_permissions(BigInt(0))
                    // .set_contexts(Discord.InteractionContextType.BotDM)
                    .set_handler(this.unassociate.bind(this)),
            );
        }
    }

    async associate(command: TextBasedCommand) {
        // M.log("contributors.associate");
        await this.github!.associate(async function (verification_uri: string, user_code: string) {
            await command.reply({
                embeds: [
                    new Discord.EmbedBuilder()
                        .setTitle("Associate GitHub Account")
                        .setDescription(
                            `Please proceed to ${verification_uri} with code **${user_code}** and authorize TCCPP to read your email addresses.\n\n` +
                            "Note: We use your email addresses to identify your contributions in repository commit logs. " +
                            "We **do not** store your email addresses, but will periodically read them to update your contributor status.",
                        ),
                ],
                components: [
                    new Discord.ActionRowBuilder<Discord.MessageActionRowComponentBuilder>().addComponents(
                        new Discord.ButtonBuilder()
                            .setCustomId(`associate-github(${command.user.id})`)
                            .setLabel("Done")
                            .setStyle(Discord.ButtonStyle.Success),
                    ),
                ],
                ephemeral_if_possible: true,
            });
            return true;
        });
    }

    // override async on_interaction_create(interaction: Discord.Interaction): Promise<void> {
    //     // M.log("BLAAAAAAAAAAAAAAAAAAAAAAA: ", interaction.id);
    // }

    async unassociate(command: TextBasedCommand) {}
}
