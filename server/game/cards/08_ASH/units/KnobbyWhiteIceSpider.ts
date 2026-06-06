import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class KnobbyWhiteIceSpider extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '3333577035',
            internalName: 'knobby-white-ice-spider',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'For each enemy unit, give an Advantage token to this unit',
            contextTitle: (context) => `Give ${context.player.opponent.getArenaUnits().length} Advantage tokens to this unit`,
            immediateEffect: AbilityHelper.immediateEffects.giveAdvantage((context) => ({
                amount: context.player.opponent.getArenaUnits().length
            }))
        });
    }
}