import { Contract } from '../utils/Contract';
import type {
    ILastKnownBaseProperties,
    ILastKnownDamageableProperties,
    ILastKnownExhaustableProperties,
    ILastKnownUnitInPlayProperties,
    ILastKnownUnitProperties,
    ILastKnownUpgradeInPlayProperties,
    ILastKnownUpgradeProperties
} from './CardPropertiesInterfaces';
import { notOfKind, refusePresence } from './ViewHelpers';
import { ViewFromCard } from './ViewFromCard';

/**
 * The last-known view of a card that has no record: one that has not left play during the current
 * action, or any card read through the getter of a card that has not opted in. Its last known
 * characteristics are its current ones, so it reads them from the live card.
 *
 * Has no presence members (D-37); see {@link refusePresence}.
 */
export class LastKnownFromCard extends ViewFromCard
    implements ILastKnownUnitInPlayProperties, ILastKnownUpgradeInPlayProperties, ILastKnownBaseProperties {
    public isUnit(): this is ILastKnownUnitProperties {
        return this.card.isUnit();
    }

    public asUnit(): ILastKnownUnitProperties {
        Contract.assertTrue(this.card.isUnit(), notOfKind(this.ref, 'a unit', this.card.type));
        return this;
    }

    public isUpgrade(): this is ILastKnownUpgradeProperties {
        return this.card.isUpgrade();
    }

    public asUpgrade(): ILastKnownUpgradeProperties {
        Contract.assertTrue(this.card.isUpgrade(), notOfKind(this.ref, 'an upgrade', this.card.type));
        return this;
    }

    public isBase(): this is ILastKnownBaseProperties {
        return this.card.isBase();
    }

    public canBeExhausted(): this is ILastKnownExhaustableProperties {
        return this.card.canBeExhausted();
    }

    public canBeDamaged(): this is ILastKnownDamageableProperties {
        return this.card.canBeDamaged();
    }

    /**
     * As of now: the card has no record, so its last known moment is the present. Narrows a unit or an
     * upgrade to its in-play members, through their interfaces.
     */
    public wasInPlay(): this is ILastKnownUnitInPlayProperties & ILastKnownUpgradeInPlayProperties {
        return this.isInPlayNow();
    }

    public asInPlay(): ILastKnownUnitInPlayProperties & ILastKnownUpgradeInPlayProperties {
        Contract.assertTrue(this.isInPlayNow(), () => `Expected ${this.ref} to be in play, but it is in ${this.card.zoneName}`);
        return this;
    }

    protected override get inPlayGuardName(): string {
        return 'wasInPlay()';
    }
}

refusePresence(LastKnownFromCard);
