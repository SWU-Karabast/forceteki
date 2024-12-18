import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class KnightOfTheRepublic extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '4541556921',
            internalName: 'knight-of-the-republic',
        };
    }

    protected override setupCardAbilities() {
        this.addTriggeredAbility({
            title: 'Create a Clone Trooper token.',
            when: {
                onAttackDeclared: (event, context) => event.attack.target === context.source,
            },
            immediateEffect: AbilityHelper.immediateEffects.createCloneTrooper()
        });
    }
}

KnightOfTheRepublic.implemented = true;