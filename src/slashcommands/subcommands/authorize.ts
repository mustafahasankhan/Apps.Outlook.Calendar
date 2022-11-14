import { IModify, IPersistence, IRead } from '@rocket.chat/apps-engine/definition/accessors';
import { IUser } from '@rocket.chat/apps-engine/definition/users';
import { OutlookCalendarApp } from '../../../OutlookCalendarApp';
import { createSectionBlock, IButton } from '../../lib/blocks';
import { sendDirectMessage } from '../../lib/message';

export async function authorize(app: OutlookCalendarApp, read: IRead, modify: IModify, user: IUser, persistence: IPersistence): Promise<void> {
    const url = await app.getOauth2ClientInstance().getUserAuthorizationUrl(user);

    const button: IButton = {
        text: 'Authorize',
        url: url.toString(),
    };

    // @TODO better copy
    const message = 'Please click the button below to authorize access to your Outlook account 👇';

    const block = await createSectionBlock(modify, message, button);

    await sendDirectMessage(read, modify, user, '', persistence, block);
}
