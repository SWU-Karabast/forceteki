import type { AbilityContext } from '../core/ability/AbilityContext';
import type { Card } from '../core/card/Card';
import { EventName, GameStateChangeRequired, WildcardCardType } from '../core/Constants';
import { CardTargetSystem, type ICardTargetSystemProperties } from '../core/gameSystem/CardTargetSystem';
import type { ITriggeredAbilityBaseProps } from '../Interfaces';
import { BountyAbility } from '../abilities/keyword/BountyAbility';
import type { UnitCard } from '../core/card/CardTypes';

export interface ICollectBountyProperties extends ICardTargetSystemProperties {
    bountyProperties: ITriggeredAbilityBaseProps;
    bountySource?: UnitCard;
}

export class CollectBountySystem<TContext extends AbilityContext = AbilityContext> extends CardTargetSystem<TContext, ICollectBountyProperties> {
    public override readonly name = 'collect bounty';
    public override readonly eventName = EventName.OnBountyCollected;
    protected override readonly targetTypeFilter = [WildcardCardType.Unit];

    public eventHandler(event): void {
        // force optional to false since the player has already chosen to resolve the bounty
        const properties = {
            ...event.bountyProperties,
            optional: false
        };

        const ability = new BountyAbility(event.context.game, event.bountySource, properties);

        event.context.game.resolveAbility(ability.createContext(event.context.player, event));
    }

    // since the actual effect of the bounty is resolved in a sub-window, we don't check its effects here
    public override canAffect(card: Card, context: TContext, additionalProperties: any = {}, mustChangeGameState = GameStateChangeRequired.None): boolean {
        return card === context.source;
    }

    protected override addPropertiesToEvent(event, card: Card, context: TContext, additionalProperties): void {
        super.addPropertiesToEvent(event, card, context, additionalProperties);

        const { bountyProperties, bountySource } = this.generatePropertiesFromContext(context, additionalProperties);
        event.bountyProperties = bountyProperties;
        event.bountySource = bountySource ?? card;
    }
}
