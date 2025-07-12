import type { IAbilityHelper } from '../../../AbilityHelper';
import type { TriggeredAbilityContext } from '../../../core/ability/TriggeredAbilityContext';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { CardType, Duration, EventName, KeywordName } from '../../../core/Constants';

export default class DeceptiveShade extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '2554581368',
            internalName: 'deceptive-shade',
        };
    }

    protected override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenDefeatedAbility({
            title: 'The next unit you play this phase gains Ambush for this phase',
            immediateEffect: AbilityHelper.immediateEffects.delayedPlayerEffect({
                title: 'The next unit you play this phase gains Ambush',
                when: {
                    onCardPlayed: (event, context) => this.isUnitPlayedEvent(event, context)
                },
                duration: Duration.UntilEndOfPhase,
                effectDescription: 'give Ambush to the next unit they play this phase',
                immediateEffect: AbilityHelper.immediateEffects.cardLastingEffect((context) => ({
                    target: context.events.find((event) => this.isUnitPlayedEvent(event, context)).card,
                    effect: AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Ambush),
                    duration: Duration.UntilEndOfPhase
                }))
            })
        });
    }

    private isUnitPlayedEvent(event, context: TriggeredAbilityContext): boolean {
        return event.name === EventName.OnCardPlayed &&
          event.cardTypeWhenInPlay === CardType.BasicUnit &&
          event.card.controller === context.player;
    }
}