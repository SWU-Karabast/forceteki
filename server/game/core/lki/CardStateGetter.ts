import type { Card } from '../card/Card';
import type { ICardReference } from './CardRef';
import { CardRef } from './CardRef';
import type { ICurrentCardProperties, ICurrentRefProperties, ILastKnownCardProperties } from './CardPropertiesInterfaces';
import { CurrentFromCard } from './CurrentFromCard';
import { CurrentOfFormerCopy } from './CurrentOfFormerCopy';
import { LastKnownFromCard } from './LastKnownFromCard';
import { LastKnownFromRecord } from './LastKnownFromRecord';
import type { LkiRegistry } from './LkiRegistry';
import { Contract } from '../utils/Contract';

/**
 * The card-facing view of game state.
 *
 * Deliberately has **no** way to reach a live {@link Card}. Card implementations receive one of
 * these at setup and use it to exchange references for properties; the `deref` capability lives on
 * {@link ICardStateInternal}, which is not re-exported to card modules (D-28).
 *
 * Which implementation a card receives depends on whether it has opted in to last known
 * information (`Card.usesLkiRegistry`); see {@link ICardStateInternal.forCard}.
 */
export interface ICardStateGetter {

    /**
     * Returns the last-known view of the card named by `ref`: its characteristics as of the moment that
     * reference represents. The default way to read a card.
     *
     * For a card that has opted in, the characteristics come from the record written when the card left
     * play during the current action, and from the live card otherwise. Call sites do not need to know
     * which applies, and should not branch on it. A card that has not opted in always reads live state,
     * exactly as reading the card directly would.
     *
     * The view holds characteristics only. Where the card is now, and whether it is in play, attached,
     * attacking or defending, is asked of {@link getCurrentProperties} (D-37).
     *
     * A live {@link Card} is accepted transitionally, while events and contexts still carry card
     * objects rather than references. Once they carry references this overload goes away and the
     * parameter narrows to {@link ICardReference}.
     */
    getLastKnownProperties(refOrCard: ICardReference | Card): ILastKnownCardProperties;

    /**
     * Returns the current view of the copy the reference names: the card as it is right now, never last
     * known information.
     *
     * The copy may no longer exist: the card has since re-entered play or moved into a hidden zone, which
     * makes it a new copy (SWU 8.5.4). So the view answers only whether the copy is in play, attached or a
     * resource until {@link ICurrentRefProperties.isSameCopy} or `asSameCopy()` narrows it to the full
     * current view, as the in-play guard narrows a unit to its stats.
     *
     * Declared before the `Card` overload so that an untyped argument (an `any` event's `cardRef`) gets
     * this, the view that asks first.
     */
    getCurrentProperties(ref: ICardReference): ICurrentRefProperties;

    /**
     * Returns the current view of the card: the card as it is right now, never last known information.
     *
     * The only view with presence: whether the card is in play now, where it is, and whether it is
     * attached, a resource, attacking or defending. Also the view for a card a selector is choosing
     * from, which was found in a zone and is asked about as it is there (D-38). Ignores records
     * entirely. A card is always its own current copy, so this is the full view without asking.
     */
    getCurrentProperties(card: Card): ICurrentCardProperties;

    /**
     * Returns the canonical reference for a card's current identity.
     *
     * Useful when an ability needs to remember *which* card it acted on across steps: references
     * compare by identity, so a card that left play and returned is correctly treated as a
     * different one (`SWU 8.5.4`). Available to every card, whether or not it has opted in.
     */
    getIdentity(card: Card): ICardReference;
}

/** Adds engine-only capabilities that card implementations must not have. */
export interface ICardStateInternal extends ICardStateGetter {

    /**
     * Resolves a reference to the live card, or `null` if it no longer names the card's current
     * identity.
     */
    deref(ref: ICardReference): Card | null;

    /**
     * Returns the getter that `card`'s ability setup should receive.
     *
     * A card that has opted in to last known information (`Card.usesLkiRegistry`) receives the
     * registry-backed getter. Every other card receives a live-only getter, which is what makes it
     * safe to rewrite a card's reads to go through the getter before that card is migrated.
     *
     * Pass the card whose *ability code* is being set up. When one card runs another's setup
     * (Clone, or copying a triggered ability), that is the card the code was written for, not the
     * card that is receiving the abilities.
     */
    forCard(card: Card): ICardStateGetter;
}

function toRef(registry: LkiRegistry, refOrCard: ICardReference | Card): CardRef {
    Contract.assertNotNullLike(
        refOrCard,
        'No card or reference supplied. If this came from `event.cardRef`, that event never had ' +
        'last known information captured — see LastKnownInformation.addDepartureRecordToEvent.'
    );

    // Every reference is a `CardRef`, because only the registry makes them, so anything else is a card.
    return refOrCard instanceof CardRef ? refOrCard : registry.getIdentity(refOrCard as Card);
}

/**
 * The getter handed to cards that have not opted in to last known information.
 *
 * Every read comes from the live card, exactly as reading the card directly would, so routing a
 * card's reads through the getter changes nothing about what it sees: records and identity are
 * ignored, and a reference to a card's earlier identity reads the card as it is now rather than
 * failing. That is what allows every card's reads to be rewritten to go through the getter ahead of
 * the card being migrated (LKI migration, phase 3).
 *
 * Transitional: removed together with `Card.usesLkiRegistry` once every card has opted in.
 */
export class LiveOnlyCardStateGetter implements ICardStateGetter {
    public constructor(private readonly getRegistry: () => LkiRegistry) {}

    public getLastKnownProperties(refOrCard: ICardReference | Card): ILastKnownCardProperties {
        const ref = this.currentIdentityOf(refOrCard);
        return new LastKnownFromCard(ref, ref.getCardForEngine());
    }

    public getCurrentProperties(ref: ICardReference): ICurrentRefProperties;
    public getCurrentProperties(card: Card): ICurrentCardProperties;
    public getCurrentProperties(refOrCard: ICardReference | Card): ICurrentCardProperties {
        // Always the full view, so `isSameCopy()` answers true, as reading the card would.
        const ref = this.currentIdentityOf(refOrCard);
        return new CurrentFromCard(ref, ref.getCardForEngine());
    }

    public getIdentity(card: Card): ICardReference {
        return this.getRegistry().getIdentity(card);
    }

    /**
     * The card's current identity, whichever identity the caller named: the views describe the card as
     * it is now, so they name the identity it has now.
     */
    private currentIdentityOf(refOrCard: ICardReference | Card): CardRef {
        const registry = this.getRegistry();
        return registry.getIdentity(toRef(registry, refOrCard).getCardForEngine());
    }
}

/**
 * The getter for cards that have opted in to last known information, over the registry's records.
 *
 * Resolves the registry lazily through the game rather than holding it, because a card's setup runs
 * once at construction while the registry belongs to the current game state.
 */
export class CardStateGetter implements ICardStateInternal {
    private readonly liveOnly: ICardStateGetter;

    public constructor(private readonly getRegistry: () => LkiRegistry) {
        this.liveOnly = new LiveOnlyCardStateGetter(getRegistry);
    }

    public forCard(card: Card): ICardStateGetter {
        return card.usesLkiRegistry ? this : this.liveOnly;
    }

    /**
     * The record if the identity left play during the current action, otherwise the card as it is now
     * (D-37).
     */
    public getLastKnownProperties(refOrCard: ICardReference | Card): ILastKnownCardProperties {
        const registry = this.getRegistry();
        const ref = toRef(registry, refOrCard);

        const record = registry.recordFor(ref);
        if (record) {
            return new LastKnownFromRecord(ref, record);
        }

        Contract.assertTrue(
            ref.isCurrent,
            `${ref} names an identity that no longer exists and has no record, so nothing can be ` +
            'read from it. Long-lived holders must store the values they need rather than a reference.'
        );

        return new LastKnownFromCard(ref, ref.getCardForEngine());
    }

    public getCurrentProperties(ref: ICardReference): ICurrentRefProperties;
    public getCurrentProperties(card: Card): ICurrentCardProperties;
    public getCurrentProperties(refOrCard: ICardReference | Card): ICurrentRefProperties {
        const ref = toRef(this.getRegistry(), refOrCard);
        return ref.isCurrent ? new CurrentFromCard(ref, ref.getCardForEngine()) : new CurrentOfFormerCopy(ref);
    }

    public deref(ref: ICardReference): Card | null {
        const engineRef = CardRef.fromCardReference(ref);
        return engineRef.isCurrent ? engineRef.getCardForEngine() : null;
    }

    public getIdentity(card: Card): ICardReference {
        return this.getRegistry().getIdentity(card);
    }
}
