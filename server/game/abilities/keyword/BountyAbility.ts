import TriggeredAbility from '../../core/ability/TriggeredAbility';
import type { Card } from '../../core/card/Card';
import { EventName, KeywordName, RelativePlayer } from '../../core/Constants';
import { GameEvent } from '../../core/event/GameEvent';
import type Game from '../../core/Game';
import type { ITriggeredAbilityBaseProps } from '../../Interfaces';

export class BountyAbility extends TriggeredAbility {
    public override readonly keyword: KeywordName | null = KeywordName.Bounty;

    private readonly bountyProperties: Omit<ITriggeredAbilityBaseProps, 'abilityController'>;

    public constructor(
        game: Game,
        card: Card,
        properties: Omit<ITriggeredAbilityBaseProps, 'abilityController'>,
    ) {
        const { title, optional } = properties;

        const fullProps = {
            ...properties,
            title: 'Collect Bounty: ' + title,
            // 7.5.13.E : Resolving a Bounty ability is optional. If a player chooses not to resolve a Bounty ability, they are not considered to have collected that Bounty.
            // however, we do allow overriding the optional behavior in some special cases (usually for readying resources)
            optional: optional ?? true,
            when: {
                onCardDefeated: (event, context) => event.card === context.source,
                onCardCaptured: (event, context) => event.card === context.source
            },
            abilityController: RelativePlayer.Opponent
        };

        super(game, card, fullProps);

        this.canResolveWithoutLegalTargets = true;

        this.bountyProperties = properties;
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
                source: this.card,
                bountyProperties: this.bountyProperties
            }
        );

        context.events.push(bountyEvent);
    }
}