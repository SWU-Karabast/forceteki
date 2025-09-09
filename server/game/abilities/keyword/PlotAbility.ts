import TriggeredAbility from '../../core/ability/TriggeredAbility';
import type { Card } from '../../core/card/Card';
import { KeywordName, PlayType, WildcardCardType, ZoneName } from '../../core/Constants';
import type Game from '../../core/Game';
import * as Contract from '../../core/utils/Contract';
import { PlayCardSystem } from '../../gameSystems/PlayCardSystem';
import { ResourceCardSystem } from '../../gameSystems/ResourceCardSystem';
import { SequentialSystem } from '../../gameSystems/SequentialSystem';
import type { ITriggeredAbilityProps } from '../../Interfaces';

export class PlotAbility extends TriggeredAbility {
    public readonly keyword: KeywordName = KeywordName.Plot;

    public static buildPlotAbilityProperties<TSource extends Card = Card>(): ITriggeredAbilityProps<TSource> {
        return {
            title: 'Plot',
            optional: true,
            when: {
                onLeaderDeployed: (event, context) => event.card.owner === context.source.controller && context.source.zoneName === ZoneName.Resource
            },
            zoneFilter: ZoneName.Resource,
            immediateEffect: new SequentialSystem((context) => ({
                gameSystems: [
                    new PlayCardSystem({
                        canPlayFromAnyZone: true,
                        playType: PlayType.Plot,
                        playAsType: WildcardCardType.Any,
                        target: context.source
                    }),
                    new ResourceCardSystem({
                        target: context.source.owner.getTopCardOfDeck()
                    })
                ]
            }))
        };
        // return {
        //     title: 'Ambush',
        //     optional: true,
        //     when: {
        //         onCardPlayed: (event, context) => event.card === context.source,
        //         onLeaderDeployed: (event, context) => event.card === context.source,
        //         onUnitEntersPlay: (event, context) => event.card === context.source && context.source.isToken()
        //     },
        //     zoneFilter: WildcardZoneName.AnyArena,
        //     immediateEffect: new ConditionalSystem({
        //         condition: AmbushAbility.unitWouldHaveAmbushTarget<TSource>,
        //         onTrue: new InitiateAttackSystem((context) => ({
        //             isAmbush: true,
        //             allowExhaustedAttacker: true,
        //             attacker: context.source,
        //             targetCondition: (card) => !card.isBase(),
        //             optional: false     // override the default optional behavior - once we've triggered ambush, the attack is no longer optional
        //         })),
        //         onFalse: new NoActionSystem({})
        //     })
        // };
    }

    // private static unitWouldHaveAmbushTarget<TSource extends Card = Card>(context: TriggeredAbilityContext<TSource>): boolean {
    //     // generate an attack action that won't check zone or cost and can't attack bases so that we can see if there would be a hypothetical attack target
    //     const attackAction = new InitiateAttackSystem({
    //         attacker: context.source,
    //         targetCondition: (card) => !card.isBase(),
    //         ignoredRequirements: ['zone', 'cost']
    //     });

    //     return attackAction.hasLegalTarget(context);
    // }

    public constructor(game: Game, card: Card) {
        Contract.assertTrue(card.isPlayable());
        Contract.assertFalse(card.isLeader()); // Leaders can't have Plot

        const properties = PlotAbility.buildPlotAbilityProperties();

        super(game, card, properties);
    }
}