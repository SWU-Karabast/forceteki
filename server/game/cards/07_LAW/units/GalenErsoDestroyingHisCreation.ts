import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName, RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class GalenErsoDestroyingHisCreation extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '5574828561',
            internalName: 'galen-erso#destroying-his-creation',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Your opponent takes control of this unit',
            optional: true,
            immediateEffect: AbilityHelper.immediateEffects.takeControlOfUnit((context) => ({
                target: context.source,
                newController: context.player.opponent,
            }))
        });

        registrar.addConstantAbility({
            title: 'Enemy units gain Raid 1 and Saboteur',
            targetController: RelativePlayer.Opponent,
            targetCardTypeFilter: WildcardCardType.Unit,
            ongoingEffect: [
                AbilityHelper.ongoingEffects.gainKeyword({ keyword: KeywordName.Raid, amount: 1 }),
                AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Saboteur)
            ]
        });
    }
}