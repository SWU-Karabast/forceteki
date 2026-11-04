import type { AbilityContext } from '../core/ability/AbilityContext';
import type { Attack } from '../core/attack/Attack';
import { createAttackerCombatDamageEvent } from '../core/attack/AttackHelpers';
import type { Card } from '../core/card/Card';
import type { IAttackableCard } from '../core/card/CardInterfaces';
import { AbilityRestriction, CardType, EventName, GameStateChangeRequired, WildcardCardType } from '../core/Constants';
import type { GameEvent } from '../core/event/GameEvent';
import { CardTargetSystem, type ICardTargetSystemProperties } from '../core/gameSystem/CardTargetSystem';
import { Contract } from '../core/utils/Contract';
import { Helpers } from '../core/utils/Helpers';

export interface IAttackerCombatDamageProperties extends ICardTargetSystemProperties {

    /** The attack whose attacker deals the damage. Defaults to the attack currently resolving. */
    attack?: Attack;
}

/**
 * The attack's current attacker deals its combat damage to the target, which must be one of the attack's targets.
 * The amount is the attacker's combat damage at the time the event is generated.
 */
export class AttackerCombatDamageSystem<TContext extends AbilityContext = AbilityContext> extends CardTargetSystem<TContext, IAttackerCombatDamageProperties> {
    public override readonly name = 'attackerCombatDamage';
    public override readonly eventName = EventName.OnDamageDealt;
    public override readonly effectDescription = 'deal combat damage to {0}';

    protected override readonly targetTypeFilter = [WildcardCardType.Unit, CardType.Base];

    public override eventHandler(_event): void {
        Contract.fail('AttackerCombatDamageSystem events are generated and resolved by DamageSystem');
    }

    public override queueGenerateEventGameSteps(events: GameEvent[], context: TContext, additionalProperties: Partial<IAttackerCombatDamageProperties> = {}): void {
        const { target } = this.generatePropertiesFromContext(context, additionalProperties);
        const attack = this.getAttack(context, additionalProperties);

        for (const card of Helpers.asArray(target)) {
            if (!this.canAffect(card, context, additionalProperties)) {
                continue;
            }

            const damageEvent = createAttackerCombatDamageEvent(attack, card as IAttackableCard, context);
            if (damageEvent !== null) {
                events.push(damageEvent);
            }
        }
    }

    public override canAffectInternal(card: Card, context: TContext, additionalProperties: Partial<IAttackerCombatDamageProperties> = {}, mustChangeGameState = GameStateChangeRequired.None): boolean {
        const attack = this.getAttack(context, additionalProperties);

        if (
            attack == null ||
            !attack.isAttackerLegal() ||
            attack.attacker.hasRestriction(AbilityRestriction.DealCombatDamage) ||
            !attack.getLegalTargets().includes(card as IAttackableCard) ||
            !attack.isTargetStillInPlay(card as IAttackableCard)
        ) {
            return false;
        }

        return super.canAffectInternal(card, context, additionalProperties, mustChangeGameState);
    }

    private getAttack(context: TContext, additionalProperties: Partial<IAttackerCombatDamageProperties>): Attack | null {
        const { attack } = this.generatePropertiesFromContext(context, additionalProperties);
        return attack ?? context.game.currentAttack ?? null;
    }
}
