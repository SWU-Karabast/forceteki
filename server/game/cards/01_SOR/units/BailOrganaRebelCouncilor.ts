import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer } from '../../../core/Constants';
import AbilityHelper from '../../../AbilityHelper';

export default class BailOrganaRebelCouncilor extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '2554951775',
            internalName: 'bail-organa#rebel-councilor'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar) {
        registrar.addActionAbility({
            title: 'Give an Experience token to another friendly unit',
            cost: AbilityHelper.costs.exhaustSelf(),
            targetResolver: {
                controller: RelativePlayer.Self,
                cardCondition: (card, context) => card !== context.source,
                immediateEffect: AbilityHelper.immediateEffects.giveExperience()
            },
        });
    }
}
