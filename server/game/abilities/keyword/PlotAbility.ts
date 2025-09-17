import TriggeredAbility from '../../core/ability/TriggeredAbility';
import type { Card } from '../../core/card/Card';
import { KeywordName, PlayType, WildcardCardType, ZoneName } from '../../core/Constants';
import type Game from '../../core/Game';
import * as Contract from '../../core/utils/Contract';
import { PlayCardSystem } from '../../gameSystems/PlayCardSystem';
import { ResourceCardSystem } from '../../gameSystems/ResourceCardSystem';
import type { ITriggeredAbilityProps } from '../../Interfaces';

export class PlotAbility extends TriggeredAbility {
    public readonly keyword: KeywordName = KeywordName.Plot;

    public static buildPlotAbilityProperties<TSource extends Card = Card>(cardTitle: string): ITriggeredAbilityProps<TSource> {
        return {
            title: `Play ${cardTitle} using Plot`,
            optional: true,
            when: {
                onLeaderDeployed: (event, context) => event.card.owner === context.source.controller && context.source.zoneName === ZoneName.Resource // TODO See if we can remove this zone check once we update Plot registration
            },
            zoneFilter: ZoneName.Resource,
            immediateEffect: new PlayCardSystem((context) => ({
                canPlayFromAnyZone: true,
                playType: PlayType.Plot,
                playAsType: WildcardCardType.Any,
                target: context.source
            })),
            ifYouDo: {
                title: 'Resource the top card of your deck',
                immediateEffect: new ResourceCardSystem((context) => ({
                    target: context.player.getTopCardOfDeck()
                }))
            }
        };
    }

    public constructor(game: Game, card: Card) {
        Contract.assertTrue(card.isPlayable());
        Contract.assertFalse(card.isLeader()); // Leaders can't have Plot

        const properties = PlotAbility.buildPlotAbilityProperties(card.title);

        super(game, card, properties);
    }
}