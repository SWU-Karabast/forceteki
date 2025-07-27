import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Trait } from '../../../core/Constants';

export default class TheGhostSpectreHomeBase extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '6931439330',
            internalName: 'the-ghost#spectre-home-base'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'Give a shield token to another Spectre unit',
            when: {
                onAttack: true,
                whenPlayed: true,
            },
            optional: true,
            targetResolver: {
                cardCondition: (card, context) => card !== context.source && card.hasSomeTrait(Trait.Spectre),
                immediateEffect: AbilityHelper.immediateEffects.giveShield()
            }
        });
    }
}
