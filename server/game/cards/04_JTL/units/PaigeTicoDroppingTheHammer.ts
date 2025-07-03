import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { AbilityType } from '../../../core/Constants';

export default class PaigeTicoDroppingTheHammer extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '1039444094',
            internalName: 'paige-tico#dropping-the-hammer',
        };
    }

    public override setupCardAbilities(card: this) {
        card.addPilotingGainAbilityTargetingAttached({
            type: AbilityType.Triggered,
            title: 'Give an Experience token to this unit, then deal 1 damage to it',
            when: {
                onAttack: true,
            },
            immediateEffect: AbilityHelper.immediateEffects.sequential([
                AbilityHelper.immediateEffects.giveExperience({ amount: 1 }),
                AbilityHelper.immediateEffects.damage({ amount: 1 })
            ])
        });
    }
}
