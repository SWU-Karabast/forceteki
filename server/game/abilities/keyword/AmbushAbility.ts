import TriggeredAbility from '../../core/ability/TriggeredAbility';
import type { TriggeredAbilityContext } from '../../core/ability/TriggeredAbilityContext';
import type { Card } from '../../core/card/Card';
import { KeywordName, WildcardZoneName } from '../../core/Constants';
import type Game from '../../core/Game';
import * as Contract from '../../core/utils/Contract';
import { ConditionalSystem } from '../../gameSystems/ConditionalSystem';
import { InitiateAttackSystem } from '../../gameSystems/InitiateAttackSystem';
import { NoActionSystem } from '../../gameSystems/NoActionSystem';
import type { ITriggeredAbilityProps } from '../../Interfaces';

export class AmbushAbility extends TriggeredAbility {
    public override readonly keyword: KeywordName | null = KeywordName.Ambush;

    public static buildAmbushAbilityProperties<TSource extends Card = Card>(): ITriggeredAbilityProps<TSource> {
        return {
            title: 'Ambush',
            optional: true,
            when: {
                onCardPlayed: (event, context) => event.card === context.source,
                onLeaderDeployed: (event, context) => event.card === context.source,
                onUnitEntersPlay: (event, context) => event.card === context.source && context.source.isToken()
            },
            zoneFilter: WildcardZoneName.AnyArena,
            immediateEffect: new ConditionalSystem({
                condition: AmbushAbility.unitWouldHaveAmbushTarget<TSource>,
                onTrue: new InitiateAttackSystem((context) => ({
                    isAmbush: true,
                    attacker: context.source,
                    targetCondition: (card) => !card.isBase(),
                    optional: false     // override the default optional behavior - once we've triggered ambush, the attack is no longer optional
                })),
                onFalse: new NoActionSystem({})
            })
        };
    }

    private static unitWouldHaveAmbushTarget<TSource extends Card = Card>(context: TriggeredAbilityContext<TSource>): boolean {
        // generate an attack action that won't check zone or cost and can't attack bases so that we can see if there would be a hypothetical attack target
        const attackAction = new InitiateAttackSystem({
            attacker: context.source,
            targetCondition: (card) => !card.isBase(),
            ignoredRequirements: ['zone', 'cost']
        });

        return attackAction.hasLegalTarget(context);
    }

    public constructor(game: Game, card: Card) {
        Contract.assertTrue(card.isUnit());

        const properties = AmbushAbility.buildAmbushAbilityProperties();

        super(game, card, properties);
    }
}