import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { EventCard } from '../../../core/card/EventCard';
import { RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class BackedByThePykes extends EventCard {
    protected override getImplementationId() {
        return {
            id: 'backed-by-the-pykes-id',
            internalName: 'backed-by-the-pykes',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Give an Experience token to a friendly unit',
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                controller: RelativePlayer.Self,
                immediateEffect: abilityHelper.immediateEffects.giveExperience()
            },
            then: {
                title: 'Deal damage to a unit equal to the number of Experience tokens on friendly units',
                optional: true,
                targetResolver: {
                    activePromptTitle: (context) => `Deal ${context.player.getArenaUnits()
                        .flatMap((x) => x.upgrades)
                        .filter((x) => x.isExperience())
                        .length} damage to a unit`,
                    cardTypeFilter: WildcardCardType.Unit,
                    immediateEffect: abilityHelper.immediateEffects.damage((context) => ({
                        amount: context.player.getArenaUnits()
                            .flatMap((x) => x.upgrades)
                            .filter((x) => x.isExperience())
                            .length
                    }))
                }
            }
        });
    }
}
