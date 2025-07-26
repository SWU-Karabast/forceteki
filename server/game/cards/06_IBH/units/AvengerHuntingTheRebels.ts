import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { IAbilityHelper } from '../../../AbilityHelper';

export default class AvengerHuntingTheRebels extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '4184803715',
            internalName: 'avenger#hunting-the-rebels',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Deal 1 damage to each other unit',
            immediateEffect: abilityHelper.immediateEffects.damage((context) => ({
                target: context.game.getArenaUnits({ otherThan: context.source }),
                amount: 1
            })),
        });
    }
}