import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class BailOrganaRespondingToCatastrophe extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '9280012856',
            internalName: 'bail-organa#responding-to-catastrophe',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addOnAttackAbility({
            title: 'Discard a card from your hand. If you do, create a Spy token',
            optional: true,
            immediateEffect: abilityHelper.immediateEffects.discardCardsFromOwnHand((context) => ({ target: context.player, amount: 1 })),
            ifYouDo: {
                title: 'Create a Spy token',
                immediateEffect: abilityHelper.immediateEffects.createSpy(),
            }
        });
    }
}
