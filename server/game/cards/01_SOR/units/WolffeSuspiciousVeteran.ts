import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { AbilityRestriction } from '../../../core/Constants';

export default class WolffeSuspiciousVeteran extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '7533529264',
            internalName: 'wolffe#suspicious-veteran'
        };
    }

    public override setupCardAbilities() {
        this.addTriggeredAbility({
            title: 'Bases can\'t be healed',
            when: {
                onCardPlayed: (event, context) => event.card === context.source,
                onAttackDeclared: (event, context) => event.attack.attacker === context.source,
            },
            immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect((context) => ({
                effect: AbilityHelper.ongoingEffects.cardCannot(AbilityRestriction.BeHealed),
                target: [context.source.controller.base, context.source.controller.opponent.base],
            }))
        });
    }
}

WolffeSuspiciousVeteran.implemented = true;
