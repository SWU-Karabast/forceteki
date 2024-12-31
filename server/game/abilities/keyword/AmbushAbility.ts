import AbilityHelper from '../../AbilityHelper';
import TriggeredAbility from '../../core/ability/TriggeredAbility';
import type { TriggeredAbilityContext } from '../../core/ability/TriggeredAbilityContext';
import type { Card } from '../../core/card/Card';
import { KeywordName } from '../../core/Constants';
import type Game from '../../core/Game';
import * as Contract from '../../core/utils/Contract';
import type { ITriggeredAbilityProps } from '../../Interfaces';

export class AmbushAbility extends TriggeredAbility {
    public override readonly keyword: KeywordName | null = KeywordName.Ambush;

    public static buildAmbushAbilityProperties<TSource extends Card = Card>(): ITriggeredAbilityProps<TSource> {
        return {
            title: 'Ambush',
            optional: true,
            when: { onUnitEntersPlay: (event, context) => event.card === context.source },
            immediateEffect: AbilityHelper.immediateEffects.conditional({
                condition: AmbushAbility.unitWouldHaveAmbushTarget<TSource>,
                onTrue: AbilityHelper.immediateEffects.sequential([
                    AbilityHelper.immediateEffects.ready(),
                    AbilityHelper.immediateEffects.attack((context) => ({
                        isAmbush: true,
                        attacker: context.source,
                        targetCondition: (card) => !card.isBase(),
                        optional: false     // override the default optional behavior - once we've triggered ambush, the attack is no longer optional
                    }))]),
                onFalse: AbilityHelper.immediateEffects.noAction()
            })
        };
    }

    private static unitWouldHaveAmbushTarget<TSource extends Card = Card>(context: TriggeredAbilityContext<TSource>): boolean {
        // generate an attack action that won't check zone or cost and can't attack bases so that we can see if there would be a hypothetical attack target
        const attackAction = AbilityHelper.immediateEffects.attack({
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