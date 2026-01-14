import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { WildcardCardType } from '../../../core/Constants';

export default class HondoOhnakaPlaysByHisOwnRules extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '6961763445',
            internalName: 'hondo-ohnaka#plays-by-his-own-rules',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: 'You may look at the top card of your deck at any time',
            ongoingEffect: AbilityHelper.ongoingEffects.canLookAtTopOfDeck()
        });

        registrar.addActionAbility({
            title: 'Play the top card of your deck',
            limit: AbilityHelper.limit.perRound(1),
            condition: (context) => context.player.getTopCardOfDeck() != null,
            immediateEffect: AbilityHelper.immediateEffects.playCardFromOutOfPlay((context) => ({
                target: context.player.getTopCardOfDeck(),
                playAsType: WildcardCardType.Any
            }))
        });
    }
}