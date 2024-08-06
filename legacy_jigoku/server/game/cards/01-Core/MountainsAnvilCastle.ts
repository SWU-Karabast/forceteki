import { CardTypes } from '../../Constants';
import { StrongholdCard } from '../../StrongholdCard';
import AbilityDsl from '../../abilitydsl';

export default class MountainsAnvilCastle extends StrongholdCard {
    static id = 'mountain-s-anvil-castle';

    setupCardAbilities() {
        this.action({
            title: 'Give a character with attachments bonus skill',
            cost: AbilityDsl.costs.bowSelf(),
            condition: () => Boolean(this.game.currentConflict),
            target: {
                cardType: CardTypes.Character,
                cardCondition: (card) => card.isParticipating() && card.attachments.length > 0,
                gameAction: AbilityDsl.actions.cardLastingEffect((context) => ({
                    effect: AbilityDsl.effects.modifyBothSkills(Math.min(context.target.attachments.length, 2))
                }))
            },
            effect: 'give {0} +{1}{2}/{1}{3}',
            effectArgs: (context) => [Math.min(context.target.attachments.length, 2), 'military', 'political']
        });
    }
}
