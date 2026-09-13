import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { IAbilityHelper } from '../../../AbilityHelper';
import { CardType, ZoneName } from '../../../core/Constants';

export default class YodaTricksterInExile extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'yoda#trickster-in-exile-id',
            internalName: 'yoda#trickster-in-exile',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenDefeatedAbility({
            title: 'Put Yoda on top of your deck',
            optional: true,
            immediateEffect: abilityHelper.immediateEffects.conditional({
                // Only move him if he actually landed in the discard pile - something else may
                // have taken him elsewhere (e.g. into a resource row) before this resolves.
                condition: (context) => context.source.zoneName === ZoneName.Discard,
                onTrue: abilityHelper.immediateEffects.moveToTopOfDeck((context) => ({ target: context.source }))
            }),
            ifYouDo: {
                title: 'Heal 2 damage from a base',
                targetResolver: {
                    cardTypeFilter: CardType.Base,
                    immediateEffect: abilityHelper.immediateEffects.heal({ amount: 2 })
                }
            }
        });
    }
}
