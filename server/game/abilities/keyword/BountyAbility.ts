import TriggeredAbility from '../../core/ability/TriggeredAbility';
import type { Card } from '../../core/card/Card';
import { KeywordName, RelativePlayer } from '../../core/Constants';
import type Game from '../../core/Game';
import type { ITriggeredAbilityBaseProps } from '../../Interfaces';

export class BountyAbility extends TriggeredAbility {
    public override readonly keyword: KeywordName | null = KeywordName.Bounty;

    public constructor(
        game: Game,
        card: Card,
        properties: Omit<ITriggeredAbilityBaseProps, 'abilityController'>,
    ) {
        const { title, optional } = properties;

        const fullProps = {
            ...properties,
            title: 'Bounty: ' + title,
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
    }

    // Bounty abilities always have some game effect because we always do "collecting the bounty" / emitting the onBountyCollected event
    public override hasAnyLegalEffects(context, includeSubSteps = false) {
        return true;
    }
}