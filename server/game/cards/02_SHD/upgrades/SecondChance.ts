import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';

export default class SecondChance extends UpgradeCard {
    protected override getImplementationId () {
        return {
            id: '6911505367',
            internalName: 'second-chance',
        };
    }

    public override setupCardAbilities(registrar: IUpgradeAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setAttachCondition((card) => card.isNonLeaderUnit());
        registrar.addGainWhenDefeatedAbilityTargetingAttached({
            title: 'For this phase, this unit\'s owner may play it from their discard pile for free.',
            immediateEffect: AbilityHelper.immediateEffects.simultaneous([
                AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                    effect: AbilityHelper.ongoingEffects.canPlayFromDiscard(),
                }),
                AbilityHelper.immediateEffects.forThisPhasePlayerEffect((context) => ({
                    target: context.source.owner,
                    effect: AbilityHelper.ongoingEffects.forFree({ match: (card) => card === context.source }),
                }))
            ])
        });
    }
}
