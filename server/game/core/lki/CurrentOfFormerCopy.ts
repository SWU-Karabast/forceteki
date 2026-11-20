import { Contract } from '../utils/Contract';
import type { CardRef } from './CardRef';
import type { ICurrentCardProperties, ICurrentRefProperties } from './CardPropertiesInterfaces';
import { CurrentFromCard } from './CurrentFromCard';
import { refuseMembersMissingFrom } from './ViewHelpers';

function noAnswerForFormerCopy(ref: CardRef, member: string): string {
    return `${ref} names a copy of the card that no longer exists: it has since re-entered play or moved into a ` +
      `hidden zone, which makes it a new copy (SWU 8.5.4). That copy is nowhere, so '${member}' has no answer ` +
      'for it now. Check isSameCopy() first, read getLastKnownProperties() for what the copy was, or read the ' +
      'card through its current reference.';
}

/**
 * The current view through a reference to a copy of a card that no longer exists: the card has since
 * re-entered play or moved into a hidden zone, which made it a new copy (SWU 8.5.4).
 *
 * That copy is nowhere, so it is not in play, attached or a resource, and it has nothing else to answer
 * about now: what it was is on the last-known view, and what the card is now is read through the card's
 * current reference. Its interface, {@link ICurrentRefProperties}, holds only those three questions and
 * {@link isSameCopy}; every other member fails, for code that gets past the types.
 */
export class CurrentOfFormerCopy implements ICurrentRefProperties {
    public constructor(public readonly ref: CardRef) {}

    public isSameCopy(): this is ICurrentCardProperties {
        return false;
    }

    public asSameCopy(): ICurrentCardProperties {
        return Contract.fail(noAnswerForFormerCopy(this.ref, 'asSameCopy'));
    }

    public isInPlay(): boolean {
        return false;
    }

    public isAttached(): boolean {
        return false;
    }

    public isResource(): boolean {
        return false;
    }
}

refuseMembersMissingFrom(CurrentOfFormerCopy, CurrentFromCard, noAnswerForFormerCopy);
