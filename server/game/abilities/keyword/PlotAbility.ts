import { TriggeredAbilityBase } from '../../core/ability/TriggeredAbility';
import type { Card } from '../../core/card/Card';
import { KeywordName, PlayType, WildcardCardType, ZoneName } from '../../core/Constants';
import type { Game } from '../../core/Game';
import { Contract } from '../../core/utils/Contract';
import { TextHelper } from '../../core/utils/TextHelper';
import { PlayCardSystem } from '../../gameSystems/PlayCardSystem';
import { ResourceCardSystem } from '../../gameSystems/ResourceCardSystem';
import type { ITriggeredAbilityProps } from '../../Interfaces';
import type { TriggeredAbilityContext } from '../../core/ability/TriggeredAbilityContext';

import { registerState } from '../../core/GameObjectUtils';

@registerState()
export class PlotAbility extends TriggeredAbilityBase {
    public readonly keyword: KeywordName = KeywordName.Plot;

    public static buildPlotAbilityProperties<TSource extends Card = Card>(cardTitle: string): ITriggeredAbilityProps<TSource> {
        return {
            title: `Play ${cardTitle} using ${TextHelper.Plot}`,
            optional: true,
            when: {
                onLeaderDeployed: (event, context) => event.card.owner === context.source.controller && context.source.zoneName === ZoneName.Resource // TODO See if we can remove this zone check once we update Plot registration
            },
            zoneFilter: ZoneName.Resource,
            customConfirmation: (context) => PlotAbility.getLostReadyResourceWarning(context),
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

    /**
     * Playing a card with Plot replaces it with an exhausted resource. If the card is ready and costs nothing
     * (e.g. thanks to a discount), it can't pay for itself, so the player ends up with one ready resource fewer.
     * Players often don't expect that, so we warn them in the trigger prompt.
     */
    private static getLostReadyResourceWarning(context: TriggeredAbilityContext): string | null {
        const card = context.source;
        if (!card.isPlayable() || card.exhausted || card.zoneName !== ZoneName.Resource) {
            return null;
        }

        const playAction = card.getPlayCardWithPlotAction();
        if (playAction.getAdjustedCost(playAction.createContext(context.player)) > 0) {
            return null;
        }

        return `${card.title} is a ready resource and costs nothing to play, so the resource replacing it enters exhausted. You will have one fewer ready resource.`;
    }

    public constructor(game: Game, card: Card) {
        Contract.assertTrue(card.isPlayable());
        Contract.assertFalse(card.isLeader()); // Leaders can't have Plot

        const properties = PlotAbility.buildPlotAbilityProperties(card.title);

        super(game, card, properties);
    }
}