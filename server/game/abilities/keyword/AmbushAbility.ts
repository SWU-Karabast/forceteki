import AbilityHelper from '../../AbilityHelper';
import { AbilityContext } from '../../core/ability/AbilityContext';
import TriggeredAbility from '../../core/ability/TriggeredAbility';
import { TriggeredAbilityContext } from '../../core/ability/TriggeredAbilityContext';
import { Card } from '../../core/card/Card';
import { UnitCard } from '../../core/card/CardTypes';
import { KeywordName } from '../../core/Constants';
import Game from '../../core/Game';
import * as Contract from '../../core/utils/Contract';
import { ITriggeredAbilityProps } from '../../Interfaces';

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
                    AbilityHelper.immediateEffects.attack((context) => {
                        return { attacker: context.source };
                    })]),
                onFalse: AbilityHelper.immediateEffects.noAction()
            })
        };
    }

    private static unitWouldHaveAmbushTarget<TSource extends Card = Card>(context: TriggeredAbilityContext<TSource>): boolean {
        // generate an attack action that won't check location or cost and can't attack bases so that we can see if there would be a hypothetical attack target
        const attackAction = AbilityHelper.immediateEffects.attack({
            attacker: context.source,
            targetCondition: (card) => !card.isBase(),
            ignoredRequirements: ['location', 'cost']
        });

        return attackAction.hasLegalTarget(context);
    }

    public constructor(game: Game, card: Card) {
        Contract.assertTrue(card.isUnit());

        const properties = AmbushAbility.buildAmbushAbilityProperties();

        super(game, card, properties);
    }
}