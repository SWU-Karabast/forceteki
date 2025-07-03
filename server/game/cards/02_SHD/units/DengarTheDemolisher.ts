import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import * as AbilityLimit from '../../../core/ability/AbilityLimit';

export default class DengarTheDemolisher extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '8031540027',
            internalName: 'dengar#the-demolisher'
        };
    }

    public override setupCardAbilities(card: this) {
        card.addTriggeredAbility({
            title: 'Deal 1 damage to the upgraded unit',
            when: {
                onCardPlayed: (event, context) => event.player === context.player && event.card.isUpgrade(),
            },
            limit: AbilityLimit.unlimited(),
            optional: true,
            immediateEffect: AbilityHelper.immediateEffects.damage((context) => ({
                amount: 1,
                target: context.event.card.parentCard
            }))
        });
    }
}
