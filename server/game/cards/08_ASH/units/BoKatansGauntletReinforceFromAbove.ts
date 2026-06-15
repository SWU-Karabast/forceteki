import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { AbilityType, RelativePlayer } from '../../../core/Constants';

export default class BoKatansGauntletReinforceFromAbove extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '7898172309',
            internalName: 'bokatans-gauntlet#reinforce-from-above',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: 'Other friendly units gain when defeated ability',
            targetController: RelativePlayer.Self,
            matchTarget: (card, context) => card !== context.source && !card.isTokenUnit(),
            ongoingEffect: abilityHelper.ongoingEffects.gainAbility({
                type: AbilityType.Triggered,
                title: 'Create a Mandalorian token',
                when: { whenDefeated: true },
                immediateEffect: abilityHelper.immediateEffects.createMandalorian({ amount: 1 })
            })
        });
    }
}