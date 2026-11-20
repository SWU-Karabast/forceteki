import type { ZoneName } from '../Constants';
import type { Attack } from '../attack/Attack';
import type { Zone } from '../../Interfaces';
import { Contract } from '../utils/Contract';
import type {
    ICurrentBaseProperties,
    ICurrentCardProperties,
    ICurrentDamageableProperties,
    ICurrentExhaustableProperties,
    ICurrentUnitInPlayProperties,
    ICurrentUnitProperties,
    ICurrentUpgradeInPlayProperties,
    ICurrentUpgradeProperties
} from './CardPropertiesInterfaces';
import { notOfKind } from './ViewHelpers';
import { ViewFromCard } from './ViewFromCard';

/**
 * The current view of a card's current copy: the card as it is now, never a record (D-37, D-38). The
 * only view with presence: where the card is, and whether it is in play, attached, a resource or in an
 * attack.
 *
 * A reference to a copy that no longer exists gets {@link CurrentOfFormerCopy} instead.
 */
export class CurrentFromCard extends ViewFromCard
    implements ICurrentUnitInPlayProperties, ICurrentUpgradeInPlayProperties, ICurrentBaseProperties {
    public isSameCopy(): this is ICurrentCardProperties {
        return true;
    }

    public asSameCopy(): ICurrentCardProperties {
        return this;
    }

    public isUnit(): this is ICurrentUnitProperties {
        return this.card.isUnit();
    }

    public asUnit(): ICurrentUnitProperties {
        Contract.assertTrue(this.card.isUnit(), notOfKind(this.ref, 'a unit', this.card.type));
        return this;
    }

    public isUpgrade(): this is ICurrentUpgradeProperties {
        return this.card.isUpgrade();
    }

    public asUpgrade(): ICurrentUpgradeProperties {
        Contract.assertTrue(this.card.isUpgrade(), notOfKind(this.ref, 'an upgrade', this.card.type));
        return this;
    }

    public isBase(): this is ICurrentBaseProperties {
        return this.card.isBase();
    }

    public canBeExhausted(): this is ICurrentExhaustableProperties {
        return this.card.canBeExhausted();
    }

    public canBeDamaged(): this is ICurrentDamageableProperties {
        return this.card.canBeDamaged();
    }

    // ----- presence

    public get zoneName(): ZoneName {
        return this.card.zoneName;
    }

    public get zone(): Zone | null {
        return this.card.zone;
    }

    /** Narrows a unit or an upgrade to its in-play members, through their interfaces. */
    public isInPlay(): this is ICurrentUnitInPlayProperties & ICurrentUpgradeInPlayProperties {
        return this.isInPlayNow();
    }

    public asInPlay(): ICurrentUnitInPlayProperties & ICurrentUpgradeInPlayProperties {
        Contract.assertTrue(this.isInPlayNow(), () => `Expected ${this.ref} to be in play, but it is in ${this.card.zoneName}`);
        return this;
    }

    public isAttached(): boolean {
        return this.card.canBeInPlay() && this.card.isAttached();
    }

    public isResource(): boolean {
        return this.card.isResource();
    }

    // The attack members fail as on `Card` outside the zones where attacks happen.

    public isAttacking(): boolean {
        return this.unitCard('isAttacking').isAttacking();
    }

    public isDefending(): boolean {
        const card = this.card;
        Contract.assertTrue(card.canBeDamaged(), () => `'isDefending' does not apply to ${this.ref}, which cannot be damaged`);
        return card.isDefending();
    }

    public get activeAttack(): Attack | null {
        const card = this.card;
        Contract.assertTrue(card.canBeDamaged(), () => `'activeAttack' does not apply to ${this.ref}, which cannot be damaged`);
        return card.activeAttack;
    }

    protected override get inPlayGuardName(): string {
        return 'isInPlay()';
    }
}
