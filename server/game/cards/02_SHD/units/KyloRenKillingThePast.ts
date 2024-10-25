import { NonLeaderUnitCard } from '../../../../../server/game/core/card/NonLeaderUnitCard';

export default class KyloRenKillingThePast extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '6263178121',
            internalName: 'kylo-ren#killing-the-past'
        };
    }

    public override setupCardAbilities() {
        // TODO: Ignore Villain Aspect On Play
        // TODO: Attack Ability
    }
}

KyloRenKillingThePast.implemented = false;