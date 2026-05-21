import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class WartimeMercenaries extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '6507361368',
            internalName: 'wartime-mercenaries',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenDefeatedAbility({
            title: 'Give an Experience token to a unit',
            targetResolver: {
                choosingPlayer: RelativePlayer.Opponent,
                cardTypeFilter: WildcardCardType.Unit,
                canChooseNoCards: true,
                immediateEffect: abilityHelper.immediateEffects.giveExperience()
            }
        });
    }
}