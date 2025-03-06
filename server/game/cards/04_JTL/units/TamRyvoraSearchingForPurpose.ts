import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { AbilityType, RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class TamRyvoraSearchingForPurpose extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '0086781673',
            internalName: 'tam-ryvora#searching-for-purpose',
        };
    }

    public override setupCardAbilities () {
        this.addPilotingGainAbilityTargetingAttached({
            type: AbilityType.Triggered,
            title: 'Give an enemy unit in this arena –1/–1 for this phase',
            when: {
                onAttackDeclared: (event, context) => event.attack.attacker === context.source
            },
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                controller: RelativePlayer.Opponent,
                cardCondition: (card, context) => card.zone === context.source.zone,
                immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                    effect: AbilityHelper.ongoingEffects.modifyStats({ power: -1, hp: -1 })
                })
            }
        });
    }
}
