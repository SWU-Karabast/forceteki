import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { ZoneName } from '../../../core/Constants';
import { DefeatSourceType } from '../../../IDamageOrDefeatSource';

export default class ShadowedIntentions extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '9003830954',
            internalName: 'shadowed-intentions',
        };
    }

    public override setupCardAbilities(card: this) {
        card.addReplacementEffectAbilityTargetingAttached({
            title: 'This unit can\'t be captured, defeated, or returned to its owner\'s hand by enemy card abilities',
            when: {
                onCardCaptured: (event, context) =>
                    event.card === context.source &&
                    event.context.player !== context.player,
                onCardDefeated: (event, context) =>
                    event.card === context.source &&
                    event.defeatSource.type === DefeatSourceType.Ability &&
                    event.defeatSource.player !== context.player,
                onCardMoved: (event, context) =>
                    event.card === context.source &&
                    event.destination === ZoneName.Hand &&
                    event.context.player !== context.player
            }
        });
    }
}
