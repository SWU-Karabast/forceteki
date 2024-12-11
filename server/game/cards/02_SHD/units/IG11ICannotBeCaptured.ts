import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { WildcardCardType, ZoneName } from '../../../core/Constants';


export default class IG11ICannotBeCaptured extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '3417125055',
            internalName: 'ig11#i-cannot-be-captured'
        };
    }

    public override setupCardAbilities() {
        this.addOnAttackAbility({
            title: 'You may deal 3 damage to a damaged ground unit.',
            optional: true,
            targetResolver: {
                cardCondition: (card) => card.isNonLeaderUnit() && card.damage > 0,
                immediateEffect: AbilityHelper.immediateEffects.selectCard({
                    cardTypeFilter: WildcardCardType.Unit,
                    innerSystem: AbilityHelper.immediateEffects.damage({ amount: 3 })
                })
            }
        });
        this.addTriggeredAbility({
            title: 'If this unit would be captured, defeat him and deal 3 damage to each enemy ground unit instead.',
            when: {
                onCardCaptured: (event, context) => event.capture.target === context.source,
            },
            immediateEffect: AbilityHelper.immediateEffects.defeat(),
            targetResolver: {
                immediateEffect: AbilityHelper.immediateEffects.damage((context) => ({
                    target: context.source.controller.opponent.getUnitsInPlay(ZoneName.GroundArena),
                    amount: 3
                }))
            }
        });
    }
}

IG11ICannotBeCaptured.implemented = true;