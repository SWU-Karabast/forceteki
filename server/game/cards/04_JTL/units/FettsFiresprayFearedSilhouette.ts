import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { TargetMode } from '../../../core/Constants';

export default class FettsFiresprayFearedSilhouette extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '6648978613',
            internalName: 'fetts-firespray#feared-silhouette',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'Deal 1 indirect damage to a player. If you control Boba Fett, deal 2 indirect damage instead',
            when: {
                onAttack: true,
                whenPlayed: true,
            },
            targetResolver: {
                mode: TargetMode.Player,
                immediateEffect: AbilityHelper.immediateEffects.conditional({
                    condition: (context) => context.player.controlsLeaderUnitOrUpgradeWithTitle('Boba Fett'),
                    onTrue: AbilityHelper.immediateEffects.indirectDamageToPlayer({ amount: 2 }),
                    onFalse: AbilityHelper.immediateEffects.indirectDamageToPlayer({ amount: 1 }),
                })
            }
        });
    }
}
