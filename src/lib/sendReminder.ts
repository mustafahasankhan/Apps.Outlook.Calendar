import { IModify, IPersistence, IRead, IHttp, HttpStatusCode} from '@rocket.chat/apps-engine/definition/accessors';
import { MiscEnum } from '../enums/Misc';
import { IUser } from '@rocket.chat/apps-engine/definition/users';
import { sendDirectMessage } from './message';

export async function sendReminder({
    user,
    subject,
    when,
    online,
    link,
    read,
    modify,
    http,
    persis,
}: {
    user: IUser;
    subject: any,
    when: any,
    online: any,
    link: any,
    read: IRead;
    modify: IModify;
    http: IHttp;
    persis: IPersistence;
}) {
    const block = modify.getCreator().getBlockBuilder();
    block.addSectionBlock({
        text: block.newPlainTextObject(`${subject}`),
    });
    block.addContextBlock({ elements: [ block.newPlainTextObject(`When: `+ new Date(`${when.DateTime}`).toLocaleDateString() + `at ` + new Date(`${when.DateTime}`).toLocaleTimeString())]});

    if(online) {
        block.addActionsBlock({
            blockId: MiscEnum.EVENT_ACTIONS_BLOCK,
            elements: [
                block.newButtonElement({
                    actionId: MiscEnum.VIEW_EVENT_ACTION_ID,
                    text: block.newPlainTextObject(MiscEnum.VIEW_EVENT_BUTTON),
                    value: `${link}`,
                    url: `${link}`,
                }),
                block.newButtonElement({
                    actionId: MiscEnum.JOIN_MEETING_ACTION_ID,
                    text: block.newPlainTextObject(MiscEnum.JOIN_MEETING_BUTTON),
                    value: `${online}`,
                    url: `${online}`,
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
                    value: `${link}`,
                    url: `${link}`,
                })
            ],
        });
    }

    await sendDirectMessage(read, modify, user, '', persis, block);
}

