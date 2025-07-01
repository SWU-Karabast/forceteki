import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import { RelativePlayer, WildcardCardType, WildcardRelativePlayer } from '../../../core/Constants';

export default class EvidenceOfTheCrime extends EventCard {
    protected override getImplementationId() {
        return {
            id: '6452159858',
            internalName: 'evidence-of-the-crime',
        };
    }

    public override setupCardAbilities(card: this) {
        card.setEventAbility({
            title: 'Take control of an upgrade that costs 3 or less and attach it to an eligible unit of your choice',
            targetResolvers: {
                upgrade: {
                    activePromptTitle: 'Choose an upgrade to take control of',
                    controller: WildcardRelativePlayer.Any,
                    cardTypeFilter: WildcardCardType.Upgrade,
                    cardCondition: (card) => card.hasCost() && card.cost <= 3,
                },
                unit: {
                    dependsOn: 'upgrade',
                    activePromptTitle: 'Choose a unit to attach the upgrade to',
                    controller: WildcardRelativePlayer.Any,
                    cardCondition: (card, context) => context.targets.upgrade.isUpgrade() && context.targets.upgrade.canAttach(card, context, context.player),
                    immediateEffect: AbilityHelper.immediateEffects.attachUpgrade((context) => ({
                        newController: RelativePlayer.Self,
                        upgrade: context.targets.upgrade,
                        target: context.targets.unit,
                    }))
                }
            }
        });
    }
}
