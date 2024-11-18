import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName } from '../../../core/Constants';

export default class ReputableHunter extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '6905327595',
            internalName: 'reputable-hunter',
        };
    }

    public override setupCardAbilities() {
        this.addDecreaseCostAbility({
            title: 'While an enemy unit has a Bounty, this unit costs 1 less to play',
            condition: (context) => context.source.controller.opponent.isKeywordInPlay(KeywordName.Bounty),
            amount: 1
        });
    }
}

ReputableHunter.implemented = true;
