import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class InvasionLander extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '1582734327',
            internalName: 'invasion-lander'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Give each other friendly unit +2/+2 for this phase',
            immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect((context) => ({
                target: context.player.getArenaUnits({ otherThan: context.source }),
                effect: AbilityHelper.ongoingEffects.modifyStats({ power: +2, hp: +2 }),
            })),
        });
    }
}