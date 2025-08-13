import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class FurtiveHandmaiden extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'furtive-handmaiden-id',
            internalName: 'furtive-handmaiden',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addOnAttackAbility({
            title: 'Discard a card from your hand. If you do, draw a card.',
            optional: true,
            immediateEffect: abilityHelper.immediateEffects.discardCardsFromOwnHand((context) => ({ amount: 1, target: context.player })),
            ifYouDo: {
                title: 'Draw a card',
                immediateEffect: abilityHelper.immediateEffects.draw((context) => ({ amount: 1, target: context.player }))
            }
        });
    }
}
