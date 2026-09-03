import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class CidScalebackCantBeTrusted extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'cid-scaleback#cant-be-trusted-id',
            internalName: 'cid-scaleback#cant-be-trusted'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'An opponent chooses a unit they control. Give a Weakness token to it.',
            targetResolver: {
                activePromptTitle: 'Choose a unit. Your opponent gives it a Weakness token.',
                choosingPlayer: RelativePlayer.Opponent,
                controller: RelativePlayer.Opponent,
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.giveWeakness()
            }
        });
    }
}