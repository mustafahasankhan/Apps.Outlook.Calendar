import { IModify, IPersistence, IRead, IHttp, HttpStatusCode} from '@rocket.chat/apps-engine/definition/accessors';
import { getAccessTokenForUser } from '../storage/users';
import { IUser } from '@rocket.chat/apps-engine/definition/users';
import { createSectionBlock } from './blocks';
import { sendDirectMessage } from './message';

export async function dailyEventFetcher({
    user,
    read,
    modify,
    http,
    persis,
}: {
    user: IUser;
    read: IRead;
    modify: IModify;
    http: IHttp;
    persis: IPersistence;
}) {
        const token = await getAccessTokenForUser(read, user);

        const headers = {
            Authorization: `Bearer ${token?.token}`,
        };
        let tomorrow = new Date();
        let today = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const response = await http.get(`https://graph.microsoft.com/v1.0/me/calendarview?StartDateTime=${today.toISOString()}&EndDateTime=${tomorrow.toISOString()}`,{ headers });
    if(response.statusCode==HttpStatusCode.OK) {
        response.data.value.forEach(async (event) => {
            let current = new Date().getTime();
            let eventTime = new Date(event.start.dateTime).getTime();
            let difference = Math.abs(eventTime-current);
            let when = difference - 600;
            const eventReminderTask = {
                id: 'event-reminder',
                when: `${when} seconds`,
                data: {
                    user: user,
                    subject: event.subject,
                    when: event.start.dateTime,
                    online: event.onlineMeeting?event.onlineMeeting.joinUrl:0,
                    link: event.webLink,
                },
            };

        });

    }
    else {

        const message = 'Unable to retrieve daily events!';

        const block = await createSectionBlock(modify, message);

        await sendDirectMessage(read, modify, user, '', persis, block);
    }
}

