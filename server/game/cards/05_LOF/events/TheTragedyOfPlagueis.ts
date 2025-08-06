import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class TheTragedyOfPlagueis extends EventCard {
    protected override getImplementationId() {
        return {
            id: '9242267986',
            internalName: 'the-tragedy-of-plagueis'
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Choose a friendly unit. For this phase, it can\'t be defeated by having no remaining HP. An opponent chooses a unit they control. Defeat that unit.',
            targetResolvers: {
                friendlyUnit: {
                    activePromptTitle: 'Choose a friendly unit. For this phase, it can\'t be defeated by having no remaining HP.',
                    controller: RelativePlayer.Self,
                    cardTypeFilter: WildcardCardType.Unit,
                    immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                        effect: AbilityHelper.ongoingEffects.cannotBeDefeatedByDamage()
                    })
                },
                opponentUnit: {
                    activePromptTitle: 'Choose a unit to defeat',
                    choosingPlayer: RelativePlayer.Opponent,
                    controller: RelativePlayer.Opponent,
                    cardTypeFilter: WildcardCardType.Unit,
                    immediateEffect: AbilityHelper.immediateEffects.defeat()
                }
            }
        });
    }
}