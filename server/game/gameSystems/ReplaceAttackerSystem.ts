import type { AbilityContext } from '../core/ability/AbilityContext';
import type { Attack } from '../core/attack/Attack';
import type { Card } from '../core/card/Card';
import { EventName, GameStateChangeRequired, WildcardCardType } from '../core/Constants';
import { CardTargetSystem, type ICardTargetSystemProperties } from '../core/gameSystem/CardTargetSystem';

export interface IReplaceAttackerProperties extends ICardTargetSystemProperties {

    /** The attack whose attacker is replaced. Defaults to the attack currently resolving. */
    attack?: Attack;
}

/**
 * Makes the target unit the attacker of an attack in progress. The previous attacker stops being part
 * of the attack but is otherwise left where it is.
 */
export class ReplaceAttackerSystem<TContext extends AbilityContext = AbilityContext> extends CardTargetSystem<TContext, IReplaceAttackerProperties> {
    public override readonly name = 'replaceAttacker';
    public override readonly eventName = EventName.OnAttackerReplaced;
    public override readonly effectDescription = 'make {0} the attacker';

    protected override readonly targetTypeFilter = [WildcardCardType.Unit];

    public override eventHandler(event): void {
        (event.attack as Attack).replaceAttacker(event.card);
    }

    public override canAffectInternal(card: Card, context: TContext, additionalProperties: Partial<IReplaceAttackerProperties> = {}, mustChangeGameState = GameStateChangeRequired.None): boolean {
        const attack = this.getAttack(context, additionalProperties);

        if (
            attack == null ||
            !card.isUnit() ||
            !card.isInPlay() ||
            card === attack.attacker ||
            card.controller !== attack.attackingPlayer ||
            attack.getAllTargets().includes(card)
        ) {
            return false;
        }

        return super.canAffectInternal(card, context, additionalProperties, mustChangeGameState);
    }

    protected override addPropertiesToEvent(event, card: Card, context: TContext, additionalProperties: Partial<IReplaceAttackerProperties> = {}): void {
        super.addPropertiesToEvent(event, card, context, additionalProperties);
        event.attack = this.getAttack(context, additionalProperties);
    }

    private getAttack(context: TContext, additionalProperties: Partial<IReplaceAttackerProperties>): Attack | null {
        const { attack } = this.generatePropertiesFromContext(context, additionalProperties);
        return attack ?? context.game.currentAttack ?? null;
    }
}
