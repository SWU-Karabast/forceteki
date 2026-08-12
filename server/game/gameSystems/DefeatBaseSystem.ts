import type { AbilityContext } from '../core/ability/AbilityContext';
import type { Card } from '../core/card/Card';
import { CardType, EventName, GameStateChangeRequired } from '../core/Constants';
import { CardTargetSystem, type ICardTargetSystemProperties } from '../core/gameSystem/CardTargetSystem';
import { Contract } from '../core/utils/Contract';

export type IDefeatBaseProperties = ICardTargetSystemProperties;

/**
 * Directly defeats a base, causing its owner to lose the game. This is distinct from a base being defeated
 * by the game rules when its damage reaches its HP; it covers abilities that read "defeat a base".
 */
export class DefeatBaseSystem<TContext extends AbilityContext = AbilityContext, TProperties extends IDefeatBaseProperties = IDefeatBaseProperties> extends CardTargetSystem<TContext, TProperties> {
    public override readonly name = 'defeatBase';
    public override readonly eventName = EventName.OnBaseDefeated;
    public override readonly effectDescription = 'defeat {0}';
    protected override readonly targetTypeFilter = [CardType.Base];

    public eventHandler(event): void {
        const base: Card = event.card;
        Contract.assertTrue(base.isBase());
        base.defeatBase();

        // End the game immediately if this defeat resolves a win condition.
        event.context.game.checkWinCondition();
    }

    public override canAffectInternal(card: Card, context: TContext, additionalProperties: Partial<TProperties> = {}, mustChangeGameState = GameStateChangeRequired.None): boolean {
        if (!card.isBase() || card.defeated) {
            return false;
        }

        return super.canAffectInternal(card, context, additionalProperties, mustChangeGameState);
    }
}
