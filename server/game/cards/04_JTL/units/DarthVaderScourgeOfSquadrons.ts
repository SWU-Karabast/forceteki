import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { AbilityType, WildcardCardType } from '../../../core/Constants';

export default class DarthVaderScourgeOfSquadrons extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '6079255999',
            internalName: 'darth-vader#scourge-of-squadrons',
        };
    }

    public override setupCardAbilities () {
        this.addPilotingGainAbilityTargetingAttached({
            type: AbilityType.Triggered,
            title: 'Deal 1 damage to a unit',
            optional: true,
            when: {
                onAttackDeclared: (event, context) => event.attack.attacker === context.source
            },
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 1 })
            },
            ifYouDo: {
                title: 'Deal 1 damage to a unit or base',
                optional: true,
                ifYouDoCondition: (ifYouDoContext) => ifYouDoContext.events[0].willDefeat,
                immediateEffect: AbilityHelper.immediateEffects.selectCard({
                    activePromptTitle: 'Deal 1 damage to a unit or base',
                    innerSystem: AbilityHelper.immediateEffects.damage({ amount: 1 })
                })
            }
        });
    }
}