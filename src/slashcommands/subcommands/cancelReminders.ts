import { IModify, IPersistence, IRead } from '@rocket.chat/apps-engine/definition/accessors';
import { IUser } from '@rocket.chat/apps-engine/definition/users';
import { OutlookCalendarApp } from '../../../OutlookCalendarApp';
import { createSectionBlock, IButton } from '../../lib/blocks';
import { sendDirectMessage } from '../../lib/message';

export async function cancelReminders(app: OutlookCalendarApp, read: IRead, modify: IModify, user: IUser, persistence: IPersistence): Promise<void> {
    await modify.getScheduler().cancelAllJobs();
    // @TODO better copy
    const message = 'Successfully unsubscribed to all event reminders, use subscribe sub-command to get notifications again.';

    const block = await createSectionBlock(modify, message);

    await sendDirectMessage(read, modify, user, '', persistence, block);
}
