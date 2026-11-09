import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { IAbilityHelper } from '../../../AbilityHelper';
import { WildcardCardType } from '../../../core/Constants';

export default class ChimaeraGrandAdmiralsMight extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '0013137056',
            internalName: 'chimaera#grand-admirals-might',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Give an Experience token to each friendly unit for each upgrade on it',
            immediateEffect: abilityHelper.immediateEffects.giveExperience((context) => ({
                target: context.player.getArenaUnits().filter((unit) => unit.upgrades.length > 0),
                amount: (unit) => unit.upgrades.length
            })),
            then: {
                title: 'Heal 1 damage from your base for each friendly upgrade',
                immediateEffect: abilityHelper.immediateEffects.heal((context) => ({
                    target: context.player.base,
                    amount: context.player.getInPlayCards({ type: WildcardCardType.Upgrade }).length
                }))
            }
        });
    }
}