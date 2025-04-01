import type { Attack } from '../../attack/Attack';
import * as Contract from '../../utils/Contract';
import type { Card, CardConstructor, ICardState } from '../Card';
import type { Player } from '../../Player';
import type { ICardWithPrintedHpProperty } from './PrintedHp';
import { WithPrintedHp } from './PrintedHp';
import type { IDamageSource } from '../../../IDamageOrDefeatSource';
import { EffectName } from '../../Constants';

export interface ICardWithDamageProperty extends ICardWithPrintedHpProperty {
    setActiveAttack(attack: Attack);
    unsetActiveAttack();
    isDefending(): boolean;
    get activeAttack(): Attack;
    get damage(): number;
    get remainingHp(): number;
    addDamage(amount: number, source: IDamageSource): number;
    removeDamage(amount: number): number;
}

export interface IWithDamageState extends ICardState {
    attackEnabled: boolean;
    damage?: number;
    // TODO: This is the idea, but I don't know how attack IDs will work.
    activeAttackUuid?: any;
}

/**
 * Mixin function that adds the `damage` property and corresponding methods to a base class.
 * This is effectively a subclass of the mixin {@link WithPrintedHp}.
 */
export function WithDamage<TBaseClass extends CardConstructor<TState>, TState extends ICardState>(BaseClass: TBaseClass) {
    const HpClass = WithPrintedHp(BaseClass);

    return class WithDamage extends (HpClass as typeof HpClass & CardConstructor<TState & IWithDamageState>) implements ICardWithDamageProperty {
        // STATE TODO: How do we handle full objects? This would need to be saved as a activeAttackRef (likely it's UUID)
        private _activeAttack?: Attack = null;

        protected override setupDefaultState() {
            super.setupDefaultState();
            this.state.attackEnabled = false;
        }

        public setActiveAttack(attack: Attack) {
            Contract.assertNotNullLike(attack);
            this.assertPropertyEnabledForZoneBoolean(this.state.attackEnabled, 'activeAttack');
            this._activeAttack = attack;
        }

        public unsetActiveAttack() {
            this.assertPropertyEnabledForZoneBoolean(this.state.attackEnabled, 'activeAttack');
            if (this._activeAttack !== null) {
                this._activeAttack = null;
            }
        }

        public isDefending(): boolean {
            return (this.activeAttack?.getAllTargets().some((target) => (target as Card) === (this as Card))) ?? false;
        }

        public get activeAttack() {
            this.assertPropertyEnabledForZoneBoolean(this.state.attackEnabled, 'activeAttack');
            return this._activeAttack;
        }

        public get damage(): number {
            this.assertPropertyEnabledForZone(this.state.damage, 'damage');
            return this.state.damage;
        }

        protected set damage(value: number) {
            this.assertPropertyEnabledForZone(this.state.damage, 'damage');
            this.state.damage = value;
        }

        public get remainingHp(): number {
            this.assertPropertyEnabledForZone(this.state.damage, 'damage');
            return Math.max(0, this.getHp() - this.damage);
        }

        public override canBeDamaged(): this is ICardWithDamageProperty {
            return true;
        }

        /**
         * @param source Metadata about the source of the damage (attack or ability)
         * @returns The amount of damage actually added, anything else is excess damage
         */
        public addDamage(amount: number, source: IDamageSource): number {
            Contract.assertNonNegative(amount);

            // damage source is only needed for tracking cause of defeat on units but we should enforce that it's provided consistently
            Contract.assertNotNullLike(source);

            this.assertPropertyEnabledForZone(this.state.damage, 'damage');

            if (amount === 0) {
                return 0;
            }
            // if a card can't be defeated by damage (e.g. Chirrut) we consider all damage to have been
            // applied to the card, even if it goes above max hp (important for overwhelm calculation)
            const damageToAdd = this.hasOngoingEffect(EffectName.CannotBeDefeatedByDamage)
                ? amount
                : Math.min(amount, this.remainingHp);

            this.damage += damageToAdd;

            return damageToAdd;
        }

        /** @returns The amount of damage actually removed */
        public removeDamage(amount: number): number {
            Contract.assertNonNegative(amount);
            this.assertPropertyEnabledForZone(this.state.damage, 'damage');

            if (amount === 0 || this.damage === 0) {
                return 0;
            }

            const damageToRemove = Math.min(amount, this.damage);
            this.damage -= damageToRemove;

            return damageToRemove;
        }

        protected setDamageEnabled(enabledStatus: boolean) {
            this.state.damage = enabledStatus ? 0 : null;
        }

        public override getSummary(activePlayer: Player) {
            return { ...super.getSummary(activePlayer), damage: this.state.damage };
        }

        protected setActiveAttackEnabled(enabledStatus: boolean) {
            if (!enabledStatus) {
                if (this._activeAttack !== null) {
                    this.unsetActiveAttack();
                }
            } else {
                Contract.assertIsNullLike(this._activeAttack, `Moved ${this.internalName} to ${this.zoneName} but it has an active attack set`);
            }

            this.state.attackEnabled = enabledStatus;
        }
    };
}
