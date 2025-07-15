import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName } from '../../../core/Constants';

export default class ReputableHunter extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '6905327595',
            internalName: 'reputable-hunter',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar) {
        registrar.addDecreaseCostAbility({
            title: 'While an enemy unit has a Bounty, this unit costs 1 less to play',
            condition: (context) => context.player.opponent.isKeywordInPlay(KeywordName.Bounty),
            amount: 1
        });
    }
}
