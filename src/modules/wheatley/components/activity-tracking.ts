import * as Discord from "discord.js";
import { strict as assert } from "assert";
import { colors, HOUR, MINUTE } from "../../../common.js";
import { unwrap } from "../../../utils/misc.js";
import { M } from "../../../utils/debugging-and-logging.js";
import { BotComponent } from "../../../bot-component.js";
import * as mongo from "mongodb";
import { channel } from "diagnostics_channel";

// type user_status = "idle" | "dnd" | "online" | "offline";

type user_event_type =
    | "join"
    | "leave"
    // | "presence_update"
    | "change_name"
    | "change_avatar"
    | "join_voice"
    | "move_voice"
    | "leave_voice"
    | "start_streaming"
    | "stop_streaming"
    // | "boost_server"
    | "interaction_create";

type channel_activity_type =
    | "message_create"
    | "message_update"
    | "message_delete"
    | "reaction_add"
    | "reaction_remove"
    | "poll_vote_add"
    | "poll_vote_remove"
    | "thread_create"
    | "thread_update"
    | "thread_delete"
    | "typing_start";

type channel_activity = {
    user: string;
};

type channel_activity_entry = {
    timestamp: number;
    channel: string;
};

export default class ActivityTracking extends BotComponent {
    private database = this.wheatley.database.create_proxy<{
        channel_activity: channel_activity_entry;
    }>();

    override async on_ready() {
        await this.database.ensure_collections({
            channel_activity: { timeseries: { timeField: "timestamp" } },
        });
    }
}
