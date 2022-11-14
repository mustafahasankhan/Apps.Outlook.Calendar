import {
    IHttp,
    IModify,
    IPersistence,
    IRead,
} from '@rocket.chat/apps-engine/definition/accessors';
import { IRoom } from '@rocket.chat/apps-engine/definition/rooms';
import {
    ISlashCommand,
    SlashCommandContext,
} from '@rocket.chat/apps-engine/definition/slashcommands';
import { IUser } from '@rocket.chat/apps-engine/definition/users';
import { OutlookCalendarApp } from '../../OutlookCalendarApp';
import { Subcommands } from '../enums/Subcommands';
import { sendNotification } from '../lib/message';
import { authorize } from './subcommands/authorize';
import {getEvents} from './subcommands/getEvents';
import { cancelReminders } from './subcommands/cancelReminders';
import { subscribe } from './subcommands/subscribe';

export class OutlookCalendar implements ISlashCommand {
    public command = 'outlook-calendar-app';
    public i18nParamsExample = 'slashcommand_params';
    public i18nDescription = 'slashcommand_description';
    public providesPreview = false;

    constructor(private readonly app: OutlookCalendarApp) {}

    public async executor(context: SlashCommandContext, read: IRead, modify: IModify, http: IHttp, persistence: IPersistence): Promise<void> {
        const command = this.getCommandFromContextArguments(context);
        if (!command) {
            return await this.displayAppHelpMessage(read, modify, context.getSender(), context.getRoom());
        }

        switch (command) {
            case Subcommands.Help:
                await this.displayAppHelpMessage(read, modify, context.getSender(), context.getRoom());
                break;
            case Subcommands.Auth:
                await authorize(this.app, read, modify, context.getSender(), persistence);
                break;
            case Subcommands.Subscribe:
                await subscribe(this.app, read, modify, context.getSender(), persistence);
                break;
            case Subcommands.GetEvents:
                await getEvents(this.app, read, modify, context, persistence, http);
                break;
            case Subcommands.Cancel:
                await cancelReminders(this.app, read, modify, context.getSender(), persistence);
                break;
            default:
                await this.displayAppHelpMessage(read, modify, context.getSender(), context.getRoom());
                break;
        }
    }

    private getCommandFromContextArguments(context: SlashCommandContext): string {
        const [command] = context.getArguments();
        return command;
    }

    private async displayAppHelpMessage(read: IRead, modify: IModify, user: IUser, room: IRoom): Promise<void> {
        const text = `Outlook Calendar App provides you the following slash commands, /outlook-calendar-app:

    1) *help:* shows this list.
    2) *auth:* starts the process to authorize your Outlook Account.
    3) *get-events*: lets you retreive your events of the day from Outlook Calendar.
    4) *subscribe*: lets you get you reminders of all events before 10 minutes they start.
    4) *cancel*: lets you cancel your reminders.    `;

        return sendNotification(read, modify, user, room, text);
    }
}
