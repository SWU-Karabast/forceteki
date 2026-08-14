import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, StandardTriggeredAbilityType, TargetMode, WildcardCardType, ZoneName } from '../../../core/Constants';
import { Helpers } from '../../../core/utils/Helpers';

export default class VernestraRwohWeShouldHandleThisOurselves extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'vernestra-rwoh#we-should-handle-this-ourselves-id',
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
                condition: (context) =>
                    context.costs[chosenUnitsCostName] &&
                    Helpers.asArray(context.costs[chosenUnitsCostName]).length > 0,
                onTrue: AbilityHelper.immediateEffects.forThisPhaseCardEffect((context) => {
                    const selectedCards = Helpers.asArray(context.costs[chosenUnitsCostName]);
                    const cardTitlesList = selectedCards.map((card) => card.title).join(' and ');
                    return {
                        title: `Gain the "When Played" abilities of ${cardTitlesList} for this phase`,
                        effect: selectedCards.map((card) => AbilityHelper.ongoingEffects.copyStandardTriggeredAbilities(card, StandardTriggeredAbilityType.WhenPlayed)),
                    };
                }),
            }),
        });
    }
}
