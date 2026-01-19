import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { EventCard } from '../../../core/card/EventCard';
import { RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class NothingLeftToFear extends EventCard {
    protected override getImplementationId () {
        return {
            id: 'nothing-left-to-fear-id',
            internalName: 'nothing-left-to-fear',
        };
    }

    public override setupCardAbilities (registrar: IEventAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Choose a friendly unit and give it +2/+2 for this phase. Then, you may defeat a non-leader unit with power equal to or less than the chosen unit.',
            targetResolver: {
                controller: RelativePlayer.Self,
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: abilityHelper.immediateEffects.forThisPhaseCardEffect({
                    effect: abilityHelper.ongoingEffects.modifyStats({ power: 2, hp: 2 })
                })
            },
            then: (thenContext) => ({
                thenCondition: () => thenContext.target,
                title: 'Defeat a non-leader unit with power equal to or less than the chosen unit',
                optional: true,
                targetResolver: {
                    activePromptTitle: () => `Defeat a non-leader unit with ${thenContext.target.getPower()} power or less`,
                    cardCondition: (card) => card.isNonLeaderUnit() && thenContext.target.isUnit() && card.getPower() <= thenContext.target.getPower(),
                    immediateEffect: abilityHelper.immediateEffects.defeat()
                }
            })
        });
    }
}