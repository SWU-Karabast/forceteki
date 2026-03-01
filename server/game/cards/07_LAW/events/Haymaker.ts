import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class Haymaker extends EventCard {
    protected override getImplementationId () {
        return {
            id: '6417951289',
            internalName: 'haymaker',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Give a friendly unit an Experience token',
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                controller: RelativePlayer.Self,
                immediateEffect: AbilityHelper.immediateEffects.giveExperience(),
            },
            then: (thenContext) => ({
                title: 'Deal damage equal to the unit\'s power to an enemy unit in the same arena',
                thenCondition: (thenContext) => thenContext.target != null,
                targetResolver: {
                    activePromptTitle: `Deal ${thenContext.target?.getPower()} damage to an enemy unit in the same arena`,
                    controller: RelativePlayer.Opponent,
                    cardTypeFilter: WildcardCardType.Unit,
                    zoneFilter: thenContext.target?.zoneName,
                    immediateEffect: AbilityHelper.immediateEffects.damage({
                        amount: thenContext.target?.getPower(),
                        source: thenContext.target,
                    })
                }
            })
        });
    }
}
