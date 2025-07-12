import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { AbilityType, WildcardCardType, WildcardRelativePlayer } from '../../../core/Constants';

export default class FriskVanguardLoudmouth extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '0514089787',
            internalName: 'frisk#vanguard-loudmouth',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addPilotingAbility({
            type: AbilityType.Triggered,
            title: 'Defeat an upgrade that costs 2 or less',
            when: {
                whenPlayed: true,
            },
            optional: true,
            targetResolver: {
                activePromptTitle: 'Choose an upgrade to defeat',
                controller: WildcardRelativePlayer.Any,
                cardTypeFilter: WildcardCardType.Upgrade,
                cardCondition: (card) => card.hasCost() && card.cost <= 2,
                immediateEffect: AbilityHelper.immediateEffects.defeat()
            }
        });
    }
}