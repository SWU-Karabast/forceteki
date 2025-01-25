import { EventCard } from '../../../core/card/EventCard';
import AbilityHelper from '../../../AbilityHelper';
import { WildcardCardType, WildcardRelativePlayer } from '../../../core/Constants';

export default class UnlimitedPower extends EventCard {
    protected override getImplementationId() {
        return {
            id: '0056489820',
            internalName: 'unlimited-power'
        };
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'Deal 4 damage to a unit, 3 damage to a second unit, 2 damage to a third unit, and 1 damage to a fourth unit.',
            targetResolvers: {
                firstUnit: {
                    activePromptTitle: 'Choose a unit to deal 4 damage to',
                    cardTypeFilter: WildcardCardType.Unit,
                    controller: WildcardRelativePlayer.Any,
                    immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 4 })
                },
                secondUnit: {
                    activePromptTitle: 'Choose a unit to deal 3 damage to',
                    dependsOn: 'firstUnit',
                    cardTypeFilter: WildcardCardType.Unit,
                    controller: WildcardRelativePlayer.Any,
                    cardCondition: (card, context) => card !== context.targets.firstUnit,
                    immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 3 })
                },
                thirdUnit: {
                    activePromptTitle: 'Choose a unit to deal 2 damage to',
                    dependsOn: 'secondUnit',
                    cardTypeFilter: WildcardCardType.Unit,
                    controller: WildcardRelativePlayer.Any,
                    cardCondition: (card, context) => card !== context.targets.firstUnit && card !== context.targets.secondUnit,
                    immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 2 })
                },
                fourthUnit: {
                    activePromptTitle: 'Choose a unit to deal 1 damage to',
                    dependsOn: 'thirdUnit',
                    cardTypeFilter: WildcardCardType.Unit,
                    controller: WildcardRelativePlayer.Any,
                    cardCondition: (card, context) => card !== context.targets.firstUnit && card !== context.targets.secondUnit && card !== context.targets.thirdUnit,
                    immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 1 })
                },
            }
        });
    }
}
