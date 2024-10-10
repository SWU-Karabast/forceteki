import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName } from '../../../core/Constants';

export default class BazeMalbusTempleGuardian extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '5879557998',
            internalName: 'baze-malbus#temple-guardian'
        };
    }

    public override setupCardAbilities () {
        this.addConstantAbility({
            title: 'While you have the initiative, this unit gains Sentinel',
            condition: (context) => context.source.controller.hasInitiative(),
            ongoingEffect: AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Sentinel)
        });
    }
}

BazeMalbusTempleGuardian.implemented = true;
