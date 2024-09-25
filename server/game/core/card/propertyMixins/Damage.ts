import { Attack } from '../../attack/Attack';
import * as Contract from '../../utils/Contract';
import { Card, CardConstructor } from '../Card';
import type { CardWithDamageProperty } from '../CardTypes';
import { WithPrintedHp } from './PrintedHp';

/**
 * Mixin function that adds the `damage` property and corresponding methods to a base class.
 * This is effectively a subclass of the mixin {@link WithPrintedHp}.
 */
export function WithDamage<TBaseClass extends CardConstructor>(BaseClass: TBaseClass) {
    const HpClass = WithPrintedHp(BaseClass);

    return class WithDamage extends HpClass {
        private _activeAttack?: Attack = null;
        private attackEnabled = false;
        private _damage?: number;

        public setActiveAttack(attack: Attack) {
            Contract.assertNotNullLike(attack);
            this.assertPropertyEnabledBoolean(this.attackEnabled, 'activeAttack');
            this._activeAttack = attack;
        }

        public unsetActiveAttack() {
            this.assertPropertyEnabledBoolean(this.attackEnabled, 'activeAttack');
            if (this._activeAttack !== null) {
                this._activeAttack = null;
            }
        }

        public isDefending(): boolean {
            return (this as Card) === (this.activeAttack?.target as Card);
        }

        public get activeAttack() {
            this.assertPropertyEnabledBoolean(this.attackEnabled, 'activeAttack');
            return this._activeAttack;
        }

        public get damage(): number {
            this.assertPropertyEnabled(this._damage, 'damage');
            return this._damage;
        }

        protected set damage(value: number) {
            this.assertPropertyEnabled(this._damage, 'damage');
            this._damage = value;
        }

        public get remainingHp(): number {
            this.assertPropertyEnabled(this._damage, 'damage');
            return Math.max(0, this.getHp() - this.damage);
        }

        public override canBeDamaged(): this is CardWithDamageProperty {
            return true;
        }

        public addDamage(amount: number) {
            Contract.assertNonNegative(amount);

            this.assertPropertyEnabled(this._damage, 'damage');

            if (amount === 0) {
                return;
            }

            this.damage += amount;

            // TODO EFFECTS: the win and defeat effects should almost certainly be handled elsewhere, probably in a game state check
            if (this.damage >= this.getHp()) {
                if (this.isBase()) {
                    this.game.recordWinner(this.owner.opponent, 'base destroyed');
                } else {
                    this.owner.defeatCard(this);
                }
            }
        }

        /** @returns True if any damage was healed, false otherwise */
        public removeDamage(amount: number): boolean {
            Contract.assertNonNegative(amount);
            this.assertPropertyEnabled(this._damage, 'damage');

            if (amount === 0 || this.damage === 0) {
                return false;
            }

            this.damage -= Math.min(amount, this.damage);
            return true;
        }

        protected setDamageEnabled(enabledStatus: boolean) {
            this._damage = enabledStatus ? 0 : null;
        }

        protected setActiveAttackEnabled(enabledStatus: boolean) {
            if (!enabledStatus) {
                if (this._activeAttack !== null) {
                    this.unsetActiveAttack();
                }
            } else {
                Contract.assertTrue(this._activeAttack === null, `Moved ${this.internalName} to ${this.location} but it has an active attack set`);
            }

            this.attackEnabled = enabledStatus;
        }
    };
}
