import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';

export default class BladeThreeBaneOfTheDevastator extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'blade-three#bane-of-the-devastator-id',
            internalName: 'blade-three#bane-of-the-devastator',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'Give an Advantage token to this unit',
            when: {
                onDamageDealt: (event, context) => event.card === context.player.base,
            },
            immediateEffect: abilityHelper.immediateEffects.giveAdvantage((context) => ({
                target: context.source
            })),
        });
    }
}