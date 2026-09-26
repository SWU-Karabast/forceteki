import type { IAbilityHelper } from '../../../AbilityHelper';
import type { Card } from '../../../core/card/Card';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Duration, RelativePlayer, StandardTriggeredAbilityType, TargetMode, WildcardCardType, ZoneName } from '../../../core/Constants';
import { Helpers } from '../../../core/utils/Helpers';

export default class VernestraRwohWeShouldHandleThisOurselves extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '2449316417',
            internalName: 'vernestra-rwoh#we-should-handle-this-ourselves',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        const chosenUnitsCostName = 'unitsPutOnBottomOfDeck';

        registrar.addAdditionalPlayCost({
            title: 'Put up to 2 units on the bottom of your deck',
            costName: chosenUnitsCostName,
            targetResolver: {
                mode: TargetMode.UpTo,
                numCards: 2,
                zoneFilter: ZoneName.Discard,
                controller: RelativePlayer.Self,
                cardTypeFilter: WildcardCardType.Unit,
                cardCondition: (card) => card.hasCost() && card.cost <= 5,
                immediateEffect: AbilityHelper.immediateEffects.moveToBottomOfDeck(),
            },
        });

        registrar.addPreEnterPlayAbility({
            title: 'This unit gains the "When Played" abilities of the chosen units for this phase',
            immediateEffect: AbilityHelper.immediateEffects.conditional({
                condition: (context) => Helpers.asArray(context.costs[chosenUnitsCostName] ?? []).length > 0,
                onTrue: AbilityHelper.immediateEffects.cardLastingEffect((context) => {
                    const selectedCards = Helpers.asArray(context.costs[chosenUnitsCostName] ?? []) as Card[];
                    const cardTitlesList = selectedCards.map((card) => card.title).join(' and ');

                    return {
                        title: `Gain the "When Played" abilities of ${cardTitlesList} for this phase`,
                        ongoingEffectDescription: `copy the "When Played" abilities of ${cardTitlesList} for this phase{0}`,
                        ongoingEffectTargetDescription: '',
                        // TODO: Using a custom duration here as a band-aid fix for GH Issue #2885
                        duration: Duration.Custom,
                        target: context.source,
                        until: {
                            onCardLeavesPlay: (event, context) => event.card === context.source,
                            onPhaseEnded: () => true,
                        },
                        effect: AbilityHelper.ongoingEffects.copyStandardTriggeredAbilities(selectedCards, StandardTriggeredAbilityType.WhenPlayed),
                    };
                }),
            }),
        });
    }
}
