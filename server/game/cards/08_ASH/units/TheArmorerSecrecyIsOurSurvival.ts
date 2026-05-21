import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName } from '../../../core/Constants';

export default class TheArmorerSecrecyIsOurSurvival extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'the-armorer#secrecy-is-our-survival-id',
            internalName: 'the-armorer#secrecy-is-our-survival',
        };
    }

    public override setupCardAbilities (registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Give a Shield token to each friendly unit with Shielded',
            immediateEffect: abilityHelper.immediateEffects.giveShield((context) => ({
                target: context.player.getArenaUnits({ condition: (c) => c.hasSomeKeyword(KeywordName.Shielded) })
            }))
        });
    }
}