import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import type { IAbilityHelper } from '../../../AbilityHelper';
import { RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class SynchronizedStrike extends EventCard {
    protected override getImplementationId() {
        return {
            id: '0633620454',
            internalName: 'synchronized-strike'
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Deal damage to an enemy unit equal to the number of units you control in its arena',
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                controller: RelativePlayer.Opponent,
                immediateEffect: AbilityHelper.immediateEffects.damage((context) => ({
                    amount: context.player.getArenaUnits({ arena: context.target.zoneName }).length,
                }))
            }
        });
    }
}
