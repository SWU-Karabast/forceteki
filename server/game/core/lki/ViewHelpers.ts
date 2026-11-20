import { Contract } from '../utils/Contract';
import type { CardType } from '../Constants';
import type { CardRef } from './CardRef';
import type {
    ICurrentBaseProperties,
    ICurrentUnitInPlayProperties,
    ICurrentUpgradeInPlayProperties,
    ILastKnownBaseProperties,
    ILastKnownUnitInPlayProperties,
    ILastKnownUpgradeInPlayProperties
} from './CardPropertiesInterfaces';

/** The failure message for a view that is not the kind of card it was narrowed to. */
export function notOfKind(ref: CardRef, kind: string, actualType: CardType): () => string {
    return () => `Expected ${ref} to be ${kind}, but it is a ${actualType}`;
}

type MemberKind = 'getter' | 'method';
type ViewClass = abstract new (...args: never[]) => object;

type AnyCurrentView = ICurrentUnitInPlayProperties & ICurrentUpgradeInPlayProperties & ICurrentBaseProperties;
type AnyLastKnownView = ILastKnownUnitInPlayProperties & ILastKnownUpgradeInPlayProperties & ILastKnownBaseProperties;

/** The members only the current view has: where the card is now, and the questions about now. */
export type PresenceMember = Exclude<keyof AnyCurrentView, keyof AnyLastKnownView>;

/**
 * Every presence member, with how to refuse it. Typed by the interfaces, so a member added to the
 * current view and not to the last-known view fails to compile here until it is listed.
 */
export const presenceMembers: Readonly<Record<PresenceMember, MemberKind>> = Object.freeze({
    zoneName: 'getter',
    zone: 'getter',
    activeAttack: 'getter',
    isInPlay: 'method',
    isAttached: 'method',
    isResource: 'method',
    isAttacking: 'method',
    isDefending: 'method',
    isSameCopy: 'method',
    asSameCopy: 'method'
});

function defineRefusal(prototype: object, member: string, kind: MemberKind, failure: (ref: CardRef, member: string) => string): void {
    if (kind === 'getter') {
        Object.defineProperty(prototype, member, {
            configurable: true,
            get(this: { readonly ref: CardRef }) {
                return Contract.fail(failure(this.ref, member));
            }
        });
    } else {
        Object.defineProperty(prototype, member, {
            configurable: true,
            writable: true,
            value(this: { readonly ref: CardRef }) {
                return Contract.fail(failure(this.ref, member));
            }
        });
    }
}

function presenceNotOnLastKnownView(ref: CardRef, member: string): string {
    return `'${member}' is about ${ref} now, which the last-known view does not answer. ` +
      'Read it from getCurrentProperties() instead (D-37).';
}

/**
 * Makes the presence members fail on a last-known view class, with a message that points to the current
 * view. The last-known interfaces leave these members out, so only code that gets past the types can
 * reach them; without this, a property would quietly read `undefined`.
 */
export function refusePresence(viewClass: ViewClass): void {
    for (const [member, kind] of Object.entries(presenceMembers) as [PresenceMember, MemberKind][]) {
        defineRefusal(viewClass.prototype, member, kind, presenceNotOnLastKnownView);
    }
}

/** Every member on a class's prototype chain, below `Object`, with whether it is a getter or a method. */
function membersOf(viewClass: ViewClass): Map<string, MemberKind> {
    const members = new Map<string, MemberKind>();
    for (let prototype = viewClass.prototype; prototype && prototype !== Object.prototype; prototype = Object.getPrototypeOf(prototype)) {
        for (const name of Object.getOwnPropertyNames(prototype)) {
            if (name !== 'constructor' && !members.has(name)) {
                members.set(name, Object.getOwnPropertyDescriptor(prototype, name).get ? 'getter' : 'method');
            }
        }
    }
    return members;
}

/**
 * Makes every member that `fullView` has and `partialView` lacks fail on `partialView`, with the given
 * message. Taken from the classes themselves, so a member added to the full view is refused without a
 * list to update. For views whose interface holds only part of another's, for code that gets past the
 * types.
 */
export function refuseMembersMissingFrom(partialView: ViewClass, fullView: ViewClass, failure: (ref: CardRef, member: string) => string): void {
    const own = membersOf(partialView);
    for (const [member, kind] of membersOf(fullView)) {
        if (!own.has(member)) {
            defineRefusal(partialView.prototype, member, kind, failure);
        }
    }
}
