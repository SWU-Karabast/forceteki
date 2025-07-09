import AbilityHelper from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName } from '../../../core/Constants';

export default class ConsortiumStarViper extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '1611702639',
            internalName: 'consortium-starviper'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar) {
        registrar.addConstantAbility({
            title: 'While you have the initiative, this unit gains Restore 2.',
            condition: (context) => context.player.hasInitiative(),
            ongoingEffect: AbilityHelper.ongoingEffects.gainKeyword({ keyword: KeywordName.Restore, amount: 2 }),
        });
    }
}
