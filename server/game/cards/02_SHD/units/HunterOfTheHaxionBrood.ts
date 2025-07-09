import AbilityHelper from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName } from '../../../core/Constants';

export default class HunterOfTheHaxionBrood extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '6939947927',
            internalName: 'hunter-of-the-haxion-brood',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar) {
        registrar.addConstantAbility({
            title: 'While an enemy unit has a Bounty, this unit gains Shielded',
            condition: (context) => context.player.opponent.isKeywordInPlay(KeywordName.Bounty),
            ongoingEffect: AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Shielded),
        });
    }
}
