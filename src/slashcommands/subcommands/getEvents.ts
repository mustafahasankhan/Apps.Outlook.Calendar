import { IModify, IPersistence, IRead, IHttp, HttpStatusCode} from '@rocket.chat/apps-engine/definition/accessors';
import { OutlookCalendarApp } from '../../../OutlookCalendarApp';
import { SlashCommandContext } from '@rocket.chat/apps-engine/definition/slashcommands';
import { storeInteractionRoomData } from '../../storage/roomInteraction';
import { MiscEnum } from '../../enums/Misc';
import { getAccessTokenForUser } from '../../storage/users';

export async function getEvents(app: OutlookCalendarApp, read: IRead, modify: IModify, context: SlashCommandContext, persistence: IPersistence, http: IHttp): Promise<void> {
    const triggerId = context.getTriggerId();
    if(triggerId){
        const user = context.getSender();
        const room = context.getRoom();
        await storeInteractionRoomData(persistence, user.id, room.id);
        const token = await getAccessTokenForUser(read, user);

        const headers = {
            Authorization: `Bearer ${token?.token}`,
        };
        var tomorrow = new Date();
        let today = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const response = await http.get(`https://graph.microsoft.com/v1.0/me/calendarview?StartDateTime=${today.toISOString()}&EndDateTime=${tomorrow.toISOString()}`,{ headers });
    if(response.statusCode==HttpStatusCode.OK) {
        console.log(JSON.parse(response.data));
        const builder = await modify.getCreator().startMessage().setRoom(room);
        const block = modify.getCreator().getBlockBuilder();
        response.data.value.forEach(async (event) => {
                    block.addSectionBlock({
                        text: block.newPlainTextObject(`${event.subject}`),
                    });
                    block.addContextBlock({ elements: [ block.newPlainTextObject(`Description: `+`${event.bodyPreview}`.slice(0, 80) + `...`)]});
                    block.addContextBlock({ elements: [ block.newPlainTextObject(`When: `+ new Date(`${event.start.DateTime}`).toLocaleDateString() + `at ` + new Date(`${event.start.DateTime}`).toLocaleTimeString())]});

                    if(event.onlineMeeting) {
                        block.addActionsBlock({
                            blockId: MiscEnum.EVENT_ACTIONS_BLOCK,
                            elements: [
                                block.newButtonElement({
                                    actionId: MiscEnum.VIEW_EVENT_ACTION_ID,
                                    text: block.newPlainTextObject(MiscEnum.VIEW_EVENT_BUTTON),
                                    value: `${event.webLink}`,
                                    url: `${event.webLink}`,
                                }),
                                block.newButtonElement({
                                    actionId: MiscEnum.JOIN_MEETING_ACTION_ID,
                                    text: block.newPlainTextObject(MiscEnum.JOIN_MEETING_BUTTON),
                                    value: `${event.onlineMeeting.joinUrl}`,
                                    url: `${event.onlineMeeting.joinUrl}`,
                                })
                            ],
                        });
                    }
                    else {

                        block.addActionsBlock({
                            blockId: MiscEnum.EVENT_ACTIONS_BLOCK,
                            elements: [
                                block.newButtonElement({
                                    actionId: MiscEnum.VIEW_EVENT_ACTION_ID,
                                    text: block.newPlainTextObject(MiscEnum.VIEW_EVENT_BUTTON),
                                    value: `${event.webLink}`,
                                    url: `${event.webLink}`,
                                })
                            ],
                        });
                    }

                    builder.setBlocks(block);


        });
        await modify
                .getNotifier()
                .notifyUser(user, builder.getMessage());;
    }
    else {
        const textSender = await modify
        .getCreator()
        .startMessage()
        .setText(`❗️ Unable to retrieve events! \n Error ${response.data.err}`);
        if (room) {
            textSender.setRoom(room);
        }
    }
}else{
        this.app.getLogger().error("Invalid Trigger ID");
    }
    }

