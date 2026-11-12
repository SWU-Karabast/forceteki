import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { EventCard } from '../../../core/card/EventCard';
import { RelativePlayer, WildcardCardType, WildcardZoneName } from '../../../core/Constants';

export default class IssueACommand extends EventCard {
    protected override getImplementationId() {
        return {
            id: '3426175825',
            internalName: 'issue-a-command',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Reveal the top card of your deck. If it\'s a unit, draw it. Give an Experience token to a friendly unit. Resource this event',
            immediateEffect: AbilityHelper.immediateEffects.sequential([
                AbilityHelper.immediateEffects.conditional((context) => {
                    const topCardOfDeck = context.player.getTopCardOfDeck();
                    return {
                        condition: !!topCardOfDeck?.isUnit(),
                        onTrue: AbilityHelper.immediateEffects.revealAndDraw({ target: topCardOfDeck, useDisplayPrompt: true, promptedPlayer: RelativePlayer.Opponent }),
                        onFalse: AbilityHelper.immediateEffects.reveal({ target: topCardOfDeck, useDisplayPrompt: true, promptedPlayer: RelativePlayer.Opponent })
                    };
                }),
                AbilityHelper.immediateEffects.selectCard({
                    activePromptTitle: 'Give an Experience token to a friendly unit',
                    effect: 'give an Experience token to a friendly unit',
                    controller: RelativePlayer.Self,
                    cardTypeFilter: WildcardCardType.Unit,
                    zoneFilter: WildcardZoneName.AnyArena,
                    immediateEffect: AbilityHelper.immediateEffects.giveExperience()
                }),
                AbilityHelper.immediateEffects.resourceCard((context) => ({ target: context.source }))
            ])
        });
    }
}
