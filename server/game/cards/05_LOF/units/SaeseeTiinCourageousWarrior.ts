import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { TargetMode, WildcardCardType } from '../../../core/Constants';

export default class SaeseeTiinCourageousWarrior extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '7137948532',
            internalName: 'saesee-tiin#courageous-warrior',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'If you have the initiative, deal 1 damage to each of up to 3 units',
            immediateEffect: AbilityHelper.immediateEffects.conditional({
                condition: (context) => context.player.hasInitiative(),
                onTrue: AbilityHelper.immediateEffects.selectCard({
                    mode: TargetMode.UpTo,
                    cardTypeFilter: WildcardCardType.Unit,
                    canChooseNoCards: true,
                    numCards: 3,
                    immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 1 }),
                })
            })
        });
    }
}