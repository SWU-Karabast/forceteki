import type { AbilityContext } from '../core/ability/AbilityContext';
import type { Card } from '../core/card/Card';
import { AbilityType, EventName, GameStateChangeRequired, WildcardCardType } from '../core/Constants';
import { CardTargetSystem, type ICardTargetSystemProperties } from '../core/gameSystem/CardTargetSystem';
import type { ITriggeredAbilityBaseProps } from '../Interfaces';
import CardAbilityStep from '../core/ability/CardAbilityStep';
import { TriggeredAbilityContext } from '../core/ability/TriggeredAbilityContext';

export interface ICollectBountyProperties extends ICardTargetSystemProperties {
    bountyAbilityProps: ITriggeredAbilityBaseProps;
}

// TODO THIS PR: remove this file if not used

export class CollectBountySystem<TContext extends AbilityContext = AbilityContext> extends CardTargetSystem<TContext, ICollectBountyProperties> {
    public override readonly name = 'collect bounty';
    public override readonly eventName = EventName.OnBountyCollected;
    protected override readonly targetTypeFilter = [WildcardCardType.Unit];

    public eventHandler(event): void {
        const ability = new CardAbilityStep(event.context.game, event.card, event.bountyAbilityProps, AbilityType.Triggered);

        const abilityContext = ability.createContext(event.context.player);
        const triggeredAbilityContext = new TriggeredAbilityContext({
            ...abilityContext.getProps(),
            event
        });

        event.context.game.resolveAbility(triggeredAbilityContext);
    }

    // since the actual effect of the bounty is resolved in a sub-window, we don't check its effects here
    public override canAffect(card: Card, context: TContext, additionalProperties: any = {}, mustChangeGameState = GameStateChangeRequired.None): boolean {
        return card === context.source;
    }

    protected override addPropertiesToEvent(event, card: Card, context: TContext, additionalProperties): void {
        const { bountyAbilityProps } = this.generatePropertiesFromContext(context, additionalProperties);
        super.addPropertiesToEvent(event, card, context, additionalProperties);
        event.bountyAbilityProps = bountyAbilityProps;
    }
}
