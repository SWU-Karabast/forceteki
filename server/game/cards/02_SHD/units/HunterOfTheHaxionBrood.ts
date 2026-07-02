import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName } from '../../../core/Constants';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class HunterOfTheHaxionBrood extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '6939947927',
            internalName: 'hunter-of-the-haxion-brood',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: `While an enemy unit has a ${TextHelper.Bounty}, this unit gains ${TextHelper.Shielded}`,
            condition: (context) => context.player.opponent.isKeywordInPlay(KeywordName.Bounty),
            ongoingEffect: AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Shielded),
        });
    }
}
