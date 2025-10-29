import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Aspect, CardType, Duration, EventName, KeywordName } from '../../../core/Constants';
import * as EnumHelpers from '../../../core/utils/EnumHelpers';
import type { TriggeredAbilityContext } from '../../../core/ability/TriggeredAbilityContext';

export default class DiplomaticEnvoy extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '8636880882',
            internalName: 'diplomatic-envoy',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        const aspects = [Aspect.Command];
        registrar.addWhenPlayedAbility({
            title: `Disclose ${EnumHelpers.aspectString(aspects)} to give Ambush for this phase for the next unit you play this phase`,
            immediateEffect: abilityHelper.immediateEffects.disclose({ aspects }),
            ifYouDo: {
                title: 'The next unit you play this phase gains Ambush for this phase',
                immediateEffect: abilityHelper.immediateEffects.delayedPlayerEffect({
                    title: 'The next unit you play this phase gains Ambush',
                    when: {
                        onCardPlayed: (event, context) => this.isUnitPlayedEvent(event, context)
                    },
                    duration: Duration.UntilEndOfPhase,
                    effectDescription: 'give Ambush to the next unit they play this phase',
                    immediateEffect: abilityHelper.immediateEffects.cardLastingEffect((context) => ({
                        target: context.events.find((event) => this.isUnitPlayedEvent(event, context)).card,
                        effect: abilityHelper.ongoingEffects.gainKeyword(KeywordName.Ambush),
                        duration: Duration.UntilEndOfPhase
                    }))
                })
            }
        });
    }

    private isUnitPlayedEvent(event, context: TriggeredAbilityContext): boolean {
        return event.name === EventName.OnCardPlayed &&
          event.cardTypeWhenInPlay === CardType.BasicUnit &&
          event.card.controller === context.player;
    }
}
