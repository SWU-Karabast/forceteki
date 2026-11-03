import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class BlackOneDrawFireTwice extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'black-one#draw-fire-twice-id',
            internalName: 'black-one#draw-fire-twice',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'Draw a card',
            when: {
                whenPlayed: true,
                whenDefeated: true,
            },
            immediateEffect: abilityHelper.immediateEffects.draw()
        });
    }
}