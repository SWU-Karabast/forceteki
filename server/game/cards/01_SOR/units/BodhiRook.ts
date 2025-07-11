import AbilityHelper from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class BodhiRookImperialDefector extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '7257556541',
            internalName: 'bodhi-rook#imperial-defector'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar) {
        registrar.addWhenPlayedAbility({
            title: 'Look at an opponent\'s hand and discard a non-unit card from it.',
            immediateEffect: AbilityHelper.immediateEffects.lookAtAndSelectCard((context) => ({
                target: context.player.opponent.hand,
                canChooseFewer: false,
                immediateEffect: AbilityHelper.immediateEffects.discardSpecificCard(),
                cardCondition: (card) => !card.isUnit()
            }))
        });
    }
}
