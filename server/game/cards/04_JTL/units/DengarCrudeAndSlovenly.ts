import AbilityHelper from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { AbilityType, TargetMode, Trait } from '../../../core/Constants';

export default class DengarCrudeAndSlovenly extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '3282713547',
            internalName: 'dengar#crude-and-slovenly',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar) {
        registrar.addPilotingGainAbilityTargetingAttached({
            type: AbilityType.Triggered,
            title: 'Deal 2 indirect damage to a player. If attached unit is Underworld, deal 3 indirect damage instead.',
            when: {
                onAttack: true,
            },
            targetResolver: {
                activePromptTitle: (context) => `Choose a player to deal ${context.source.hasSomeTrait(Trait.Underworld) ? '3' : '2'} indirect damage to`,
                mode: TargetMode.Player,
                immediateEffect: AbilityHelper.immediateEffects.indirectDamageToPlayer((context) => ({
                    amount: context.source.hasSomeTrait(Trait.Underworld) ? 3 : 2,
                }))
            }
        });
    }
}