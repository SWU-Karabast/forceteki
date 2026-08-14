import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, StandardTriggeredAbilityType, TargetMode, WildcardCardType, ZoneName } from '../../../core/Constants';
import { MetaActionCost } from '../../../core/cost/MetaActionCost';
import { Helpers } from '../../../core/utils/Helpers';
import { SelectCardSystem } from '../../../gameSystems/SelectCardSystem';

export default class VernestraRwohWeShouldHandleThisOurselves extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'vernestra-rwoh-we-should-handle-this-ourselves-id',
            internalName: 'vernestra-rwoh-we-should-handle-this-ourselves',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addAdditionalPlayCost(this.makeMetaActionCostForSelectedUnits(AbilityHelper));

        registrar.addPreEnterPlayAbility({
            title: 'This unit gains the "When Played" abilities of the chosen units for this phase',
            immediateEffect: AbilityHelper.immediateEffects.conditional({
                condition: (context) =>
                    context.costs['selectCard'] &&
                    Helpers.asArray(context.costs['selectCard']).length > 0,
                onTrue: AbilityHelper.immediateEffects.forThisPhaseCardEffect((context) => {
                    const selectedCards = Helpers.asArray(context.costs['selectCard']);
                    return {
                        effect: selectedCards.map((card) => AbilityHelper.ongoingEffects.copyStandardTriggeredAbilities(card, StandardTriggeredAbilityType.WhenPlayed)),
                    };
                }),
            }),
        });
    }

    private makeMetaActionCostForSelectedUnits(abilityHelper: IAbilityHelper): MetaActionCost {
        return new MetaActionCost(
            new SelectCardSystem({
                mode: TargetMode.UpTo,
                numCards: 2,
                zoneFilter: ZoneName.Discard,
                controller: RelativePlayer.Self,
                cardTypeFilter: WildcardCardType.Unit,
                cardCondition: (card) => card.hasCost() && card.cost <= 5,
                immediateEffect: abilityHelper.immediateEffects.moveToBottomOfDeck(),
                isCost: true,
            }),
            'Put up to 2 units on the bottom of your deck'
        );
    }
}
