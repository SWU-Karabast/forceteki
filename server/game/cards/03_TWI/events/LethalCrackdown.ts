import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { EventCard } from '../../../core/card/EventCard';
import { WildcardCardType } from '../../../core/Constants';

export default class LethalCrackdown extends EventCard {
    protected override getImplementationId () {
        return {
            id: '1389085256',
            internalName: 'lethal-crackdown'
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Defeat a non-leader unit. If you do, deal damage to your base equal to that unit\'s power',
            targetResolver: {
                cardTypeFilter: WildcardCardType.NonLeaderUnit,
                immediateEffect: AbilityHelper.immediateEffects.defeat()
            },
            ifYouDo: (ifYouDoContext) => ({
                title: 'Deal damage to your base equal to that unit\'s power',
                immediateEffect: AbilityHelper.immediateEffects.damage({
                    target: ifYouDoContext.player.base,
                    amount: ifYouDoContext.events[0].lastKnownInformation.power
                })
            })
        });
    }
}
