import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { IAbilityHelper } from '../../../AbilityHelper';
import { CardType } from '../../../core/Constants';

export default class YodaTricksterInExile extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '9369725899',
            internalName: 'yoda#trickster-in-exile',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenDefeatedAbility({
            title: 'Put Yoda on top of your deck',
            optional: true,
            immediateEffect: abilityHelper.immediateEffects.conditional({
                // He must be in the resolving player's own discard pile. That rules out both
                // being moved elsewhere first (e.g. into a resource row) and being defeated
                // while under an opponent's control (e.g. No Glory, Only Results), where he
                // ends up in his owner's discard pile rather than the resolving player's.
                condition: (context) => context.source.zone === context.player.discardZone,
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
