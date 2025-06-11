import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, WildcardCardType, WildcardRelativePlayer } from '../../../core/Constants';

export default class JocastaNuTheGiftOfKnowledge extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '8635969563',
            internalName: 'jocasta-nu#the-gift-of-knowledge'
        };
    }

    public override setupCardAbilities() {
        this.addWhenPlayedAbility({
            title: 'Attach a friendly upgrade on a friendly unit to a different eligible unit',
            optional: true,
            targetResolvers: {
                upgrade: {
                    activePromptTitle: 'Choose a friendly upgrade to move',
                    controller: RelativePlayer.Self,
                    cardCondition: (card, context) => card.isUpgrade() && card.controller === context.player && card.parentCard.controller === context.player,
                },
                unit: {
                    dependsOn: 'upgrade',
                    activePromptTitle: 'Choose a different unit to attach the upgrade to',
                    controller: WildcardRelativePlayer.Any,
                    cardCondition: (card, context) => context.targets.upgrade.isUpgrade() && card !== context.targets.upgrade.parentCard && context.targets.upgrade.canAttach(card, context.player),
                    immediateEffect: AbilityHelper.immediateEffects.attachUpgrade((context) => ({
                        upgrade: context.targets.upgrade,
                        target: context.targets.unit,
                    }))
                }
            }
        });
    }
}
