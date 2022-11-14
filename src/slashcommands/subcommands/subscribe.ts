import { IModify, IPersistence, IRead } from '@rocket.chat/apps-engine/definition/accessors';
import { IUser } from '@rocket.chat/apps-engine/definition/users';
import { OutlookCalendarApp } from '../../../OutlookCalendarApp';
import { createSectionBlock, IButton } from '../../lib/blocks';
import { sendDirectMessage } from '../../lib/message';

export async function subscribe(app: OutlookCalendarApp, read: IRead, modify: IModify, user: IUser, persistence: IPersistence): Promise<void> {
    const task = {
        id: 'eventsoftoday',
        interval: '24 hours',
        data: { user },
      };
      await modify.getScheduler().scheduleRecurring(task);
    // @TODO better copy
    const message = 'Successfully subscribe to event reminders, use cancel sub-command to cancel all reminders.';

    const block = await createSectionBlock(modify, message);

    await sendDirectMessage(read, modify, user, '', persistence, block);
}
