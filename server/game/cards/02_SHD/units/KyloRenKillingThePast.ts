import { NonLeaderUnitCard } from '../../../../../server/game/core/card/NonLeaderUnitCard';
import { Aspect } from '../../../core/Constants';

export default class KyloRenKillingThePast extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '6263178121',
            internalName: 'kylo-ren#killing-the-past'
        };
    }

    public override setupCardAbilities() {
        this.addIgnoreSpecificAspectPenaltyAbility({
            title: 'If you control Rey, ignore the Villainy aspect when playing this',
            ignoredAspects: Aspect.Villainy,
            condition: (context) => context.source.controller.controlsUnitWithName('Rey')
        });

        // TODO: Attack Ability
    }
}

KyloRenKillingThePast.implemented = true;