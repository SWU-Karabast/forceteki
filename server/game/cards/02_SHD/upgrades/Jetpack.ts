import AbilityHelper from '../../../AbilityHelper';
import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { PhaseName, Trait } from '../../../core/Constants';

export default class Jetpack extends UpgradeCard {
    protected override getImplementationId () {
        return {
            id: '6117103324',
            internalName: 'jetpack',
        };
    }

    public override setupCardAbilities(registrar: IUpgradeAbilityRegistrar) {
        registrar.setAttachCondition((card) => !card.hasSomeTrait(Trait.Vehicle));

        registrar.addWhenPlayedAbility({
            title: 'Give a Shield token to attached unit. At the start of the regroup phase, defeat that token.',
            immediateEffect: AbilityHelper.immediateEffects.sequential([
                AbilityHelper.immediateEffects.giveShield((context) => ({
                    target: context.source.parentCard,
                    highPriorityRemoval: true
                })),
                AbilityHelper.immediateEffects.delayedCardEffect((context) => ({
                    title: 'Defeat the Jetpack Shield token',
                    when: {
                        onPhaseStarted: (context) => context.phase === PhaseName.Regroup
                    },
                    immediateEffect: AbilityHelper.immediateEffects.defeat(),
                    target: context.events?.[0]?.generatedTokens?.[0]
                }))
            ])
        });
    }
}
