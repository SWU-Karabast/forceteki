import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, WildcardCardType } from '../../../core/Constants';
import * as Helpers from '../../../core/utils/Helpers';

export default class CountDookuFallenJedi extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '8655450523',
            internalName: 'count-dooku#fallen-jedi',
        };
    }

    public override setupCardAbilities () {
        this.addWhenPlayedAbility({
            title: 'For each unit you exploited while playing this card, deal damage to an enemy unit equal to the power of the exploited unit',
            immediateEffect: AbilityHelper.immediateEffects.sequential(
                // TODO: correct implementation of the rules for multiple instances of damage in the same ability
                (context) => Helpers.asArray(context.event.costs.exploitedUnitsInformation).map((exploitedUnitInformation) =>
                    AbilityHelper.immediateEffects.selectCard({
                        cardTypeFilter: WildcardCardType.Unit,
                        controller: RelativePlayer.Opponent,
                        optional: true,
                        innerSystem: AbilityHelper.immediateEffects.damage({ amount: exploitedUnitInformation.power }),
                    })
                )
            )
        });
    }
}
