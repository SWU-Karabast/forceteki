import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, WildcardCardType } from '../../../core/Constants';
import * as CostHelpers from '../../../core/cost/CostHelpers';

export default class CountDookuFallenJedi extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '8655450523',
            internalName: 'count-dooku#fallen-jedi',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'For each unit you exploited while playing this card, deal damage to an enemy unit equal to the power of the exploited unit',
            immediateEffect: AbilityHelper.immediateEffects.sequential(
                // TODO: correct implementation of the rules for multiple instances of damage in the same ability
                (context) => CostHelpers.getExploitedUnits(context.event).map((exploitedUnitInformation) =>
                    AbilityHelper.immediateEffects.selectCard({
                        activePromptTitle: `Deal ${exploitedUnitInformation.power} damage to an enemy unit (for exploiting ${exploitedUnitInformation.title})`,
                        cardTypeFilter: WildcardCardType.Unit,
                        controller: RelativePlayer.Opponent,
                        optional: true,
                        immediateEffect: AbilityHelper.immediateEffects.damage({ amount: exploitedUnitInformation.power }),
                    })
                )
            )
        });
    }
}
