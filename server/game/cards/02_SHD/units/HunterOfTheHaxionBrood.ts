import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName } from '../../../core/Constants';

export default class HunterOfTheHaxionBrood extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '6939947927',
            internalName: 'hunter-of-the-haxion-brood',
        };
    }

    public override setupCardAbilities() {
        this.addConstantAbility({
            title: 'While an enemy unit has a Bounty, this unit gains Shielded',
            condition: (context) => context.source.controller.opponent.isKeywordInPlay(KeywordName.Bounty),
            ongoingEffect: AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Shielded),
        });
    }
}

HunterOfTheHaxionBrood.implemented = true;
