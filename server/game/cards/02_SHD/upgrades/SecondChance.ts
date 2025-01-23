import AbilityHelper from '../../../AbilityHelper';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import OngoingEffectLibrary from '../../../ongoingEffects/OngoingEffectLibrary';

export default class SecondChance extends UpgradeCard {
    protected override getImplementationId () {
        return {
            id: '6911505367',
            internalName: 'second-chance',
        };
    }

    public override setupCardAbilities() {
        this.setAttachCondition((card) => card.isNonLeaderUnit());
        this.addGainWhenDefeatedAbilityTargetingAttached({
            title: 'For this phase, this unit\'s owner may play it from their discard pile for free.',
            immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect((context) => ({
                effect: [
                    OngoingEffectLibrary.canPlayFromDiscard(),
                    OngoingEffectLibrary.forFree({ match: (card) => card === context.source })
                ]
            }))
        });
    }
}
