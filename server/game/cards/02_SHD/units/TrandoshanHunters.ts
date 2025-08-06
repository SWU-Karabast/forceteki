import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName } from '../../../core/Constants';

export default class TrandoshanHunters extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '1743599390',
            internalName: 'trandoshan-hunters',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'If an enemy unit has a Bounty, give an Experience token to this unit',
            immediateEffect: AbilityHelper.immediateEffects.conditional({
                condition: (context) => context.player.opponent.isKeywordInPlay(KeywordName.Bounty),
                onTrue: AbilityHelper.immediateEffects.giveExperience(),
            })
        });
    }
}
