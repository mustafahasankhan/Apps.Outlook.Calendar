import {
    IAppAccessors,
    IAppInstallationContext,
    IConfigurationExtend,
    IHttp,
    ILogger,
    IModify,
    IPersistence,
    IRead,
} from '@rocket.chat/apps-engine/definition/accessors';
import { App } from '@rocket.chat/apps-engine/definition/App';
import { IAppInfo } from '@rocket.chat/apps-engine/definition/metadata';
import { IUser } from '@rocket.chat/apps-engine/definition/users';
import { isUserHighHierarchy, sendDirectMessage } from './src/lib/message';
import { IAuthData, IOAuth2Client, IOAuth2ClientOptions } from '@rocket.chat/apps-engine/definition/oauth2/IOAuth2';
import { createOAuth2Client } from '@rocket.chat/apps-engine/definition/oauth2/OAuth2';
import { createSectionBlock } from './src/lib/blocks';
import { OutlookCalendar as OutlookCalendarCommand } from './src/slashcommands/outlookCalendar';
import { dailyEventFetcher } from './src/lib/dailyEventFetcher';
import { sendReminder } from './src/lib/sendReminder';

import { StartupType } from '@rocket.chat/apps-engine/definition/scheduler';

export class OutlookCalendarApp extends App {
    public botUsername: string;
    public botUser: IUser;

    constructor(info: IAppInfo, logger: ILogger, accessors: IAppAccessors) {
        super(info, logger, accessors);
    }

    private oauth2ClientInstance: IOAuth2Client;
    private oauth2Config: IOAuth2ClientOptions = {
        alias: 'outlook-calendar-app',
       accessTokenUri: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
       authUri: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
       refreshTokenUri: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
       revokeTokenUri: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
       authorizationCallback: this.autorizationCallback.bind(this),
       defaultScopes: ["Calendars.ReadWrite","offline_access","User.Read","profile","openid","email"],

       };

       private async autorizationCallback(
        token: IAuthData,
        user: IUser,
        read: IRead,
        modify: IModify,
        http: IHttp,
        persistence: IPersistence,
    ) {

        const text =
        `The authentication process has succeeded! :tada:\n` +
        `You may now retrieve your events using the ` +
        `\`/outlook-calendar-app get-events\` slash command and ` +
        `you may subscribe to notifications for daily events using the.\n` +
        `\`/outlook-calendar-app subscribe\` slash command.`;


        const blocks = await createSectionBlock(modify, text);

        await sendDirectMessage(read, modify, user, text, persistence, blocks);
    }

    public async onEnable(): Promise<boolean> {
        this.botUsername = 'outlook-calendar.bot';
        this.botUser = (await this.getAccessors()
            .reader.getUserReader()
            .getByUsername(this.botUsername)) as IUser;
        return true;
    }

    public async onInstall(
        context: IAppInstallationContext,
        read: IRead,
        http: IHttp,
        persistence: IPersistence,
        modify: IModify,
    ): Promise<void> {
        const user = context.user;

        const quickReminder = 'Quick reminder: Let your workspace users know about the Outlook Calendar App,\
                            so everyone will be able to manage their events/meetings as well.\n';

        const text =
            `Welcome to the Outlook Calendar Rocket.Chat App!\n` +
            `To start view your events, meetings, etc. ` +
            `You first need to complete the app's setup and then authorize your Outlook account.\n` +
            `To do so, type  \`/outlook-calendar-app auth\`\n` +
            `${isUserHighHierarchy(user) ? quickReminder : ''}`;

        await sendDirectMessage(read, modify, user, text, persistence);
    }
    public getOauth2ClientInstance(): IOAuth2Client {
        if (!this.oauth2ClientInstance) {
            this.oauth2ClientInstance = createOAuth2Client(this, this.oauth2Config);
        }
        return this.oauth2ClientInstance;

    }
    protected async extendConfiguration(
        configuration: IConfigurationExtend,
    ): Promise<void> {
        const user = (await this.getAccessors()
            .reader.getUserReader()
            .getAppUser()) as IUser;

        await Promise.all([
            this.getOauth2ClientInstance().setup(configuration),
            configuration.slashCommands.provideSlashCommand(new OutlookCalendarCommand(this)),
            configuration.scheduler.registerProcessors([
                {
                    id: 'eventsoftoday',
                    startupSetting: {
                        type: StartupType.RECURRING,
                        interval: '24 hours',
                      },
                    processor: async (jobContext, read, modify, http, persis) => {
                        let user = jobContext.user as IUser;
                        try {
                            await dailyEventFetcher({
                                user,
                                read,
                                modify,
                                http,
                                persis,
                            });
                        } catch (e) {
                            await sendDirectMessage(
                                read,
                                modify,
                                user,
                                e.message,
                                persis
                            );
                        }
                    },
                },
                {
                    id: 'event-reminder',
                    processor: async (jobContext, read, modify, http, persis) => {
                        let user = jobContext.user as IUser;
                        let subject = jobContext.subject as any;
                        let when = jobContext.when as any;
                        let online = jobContext.online as any;
                        let link = jobContext.link as any;
                        try {
                            await sendReminder({
                                user,
                                subject,
                                when,
                                online,
                                link,
                                read,
                                modify,
                                http,
                                persis,
                            });
                        } catch (e) {
                            await sendDirectMessage(
                                read,
                                modify,
                                user,
                                e.message,
                                persis
                            );
                        }
                    },
                },
            ]),
        ]);

    }
}

