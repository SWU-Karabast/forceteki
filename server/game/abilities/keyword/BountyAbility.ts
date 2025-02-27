import TriggeredAbility from '../../core/ability/TriggeredAbility';
import type { Card } from '../../core/card/Card';
import type { IUnitCard } from '../../core/card/propertyMixins/UnitProperties';
import { EventName, KeywordName, RelativePlayer, WildcardZoneName } from '../../core/Constants';
import { GameEvent } from '../../core/event/GameEvent';
import type Game from '../../core/Game';
import * as Contract from '../../core/utils/Contract';
import type { ITriggeredAbilityBaseProps } from '../../Interfaces';

export type IResolvedBountyProperties = Omit<ITriggeredAbilityBaseProps, 'canBeTriggeredBy'> & {
    bountySource?: IUnitCard;
};

/**
 * Extension of {@link TriggeredAbility} to handle bounties. The major difference is that it emits an
 * `onBountyCollected` event with the properties for the bounty ability (used for Bossk leader ability).
 * This event is emitted regardless of whether the bounty's actual effects will change game state.
 */
export class BountyAbility extends TriggeredAbility {
    public override readonly keyword: KeywordName | null = KeywordName.Bounty;

    private readonly bountyProperties: IResolvedBountyProperties;

    public constructor(
        game: Game,
        card: Card,
        properties: Omit<ITriggeredAbilityBaseProps, 'canBeTriggeredBy'>,
    ) {
        Contract.assertTrue(card.isUnit());

        const { title, optional } = properties;

        const fullProps = {
            ...properties,
            title: 'Collect Bounty: ' + title,
            // 7.5.13.E : Resolving a Bounty ability is optional. If a player chooses not to resolve a Bounty ability, they are not considered to have collected that Bounty.
            // however, we do allow overriding the optional behavior in some special cases (e.g. for readying resources or Bossk ability)
            optional: optional ?? true,
            when: {
                onCardDefeated: (event, context) => event.card === context.source,
                onCardCaptured: (event, context) => event.card === context.source
            },
            canBeTriggeredBy: RelativePlayer.Opponent,
            zoneFilter: WildcardZoneName.AnyArena
        };

        super(game, card, fullProps);

        this.canResolveWithoutLegalTargets = true;

        this.bountyProperties = { ...properties, bountySource: card };
    }

    // Bounty abilities always have some game effect because we always do "collecting the bounty" / emitting the onBountyCollected event
    public override hasAnyLegalEffects(context, includeSubSteps = false) {
        return true;
    }

    public override queueEventsForSystems(context: any) {
        super.queueEventsForSystems(context);

        const bountyEvent = new GameEvent(
            EventName.OnBountyCollected,
            context,
            {
                card: this.card,
                bountyProperties: this.bountyProperties
            }
        );

        context.events.push(bountyEvent);
    }
}
