import { CardTypes, Durations, Players } from '../../../Constants';
import { Direction } from '../../../GameActions/ModifyBidAction';
import AbilityDsl from '../../../abilitydsl';
import DrawCard from '../../../drawcard';

export default class KakitaTechnique extends DrawCard {
    static id = 'kakita-technique';

    setupCardAbilities() {
        this.duelFocus({
            title: 'Set bid to 0',
            gameAction: AbilityDsl.actions.modifyBid(context =>  {
                const currentBid = context.player.honorBid;

                return {
                    amount: currentBid,
                    direction: Direction.Decrease
                }
            }),
        });

        this.action({
            title: 'Give character +2/+2',
            target: {
                cardType: CardTypes.Character,
                controller: Players.Self,
                cardCondition: (card) => card.isParticipating() && (card.hasTrait('bushi') || card.hasTrait('duelist')),
                gameAction: AbilityDsl.actions.sequential([
                    AbilityDsl.actions.cardLastingEffect(context => ({
                        effect: AbilityDsl.effects.delayedEffect({
                            when: {
                                onCardPlayed: (event, context) => event.player === context.player && event.card.type === CardTypes.Event
                            },
                            message: '{0} gets +{1}{2} and +{1}{3} due to the delayed effect of {4}',
                            messageArgs: () => [context.target, context.target.isDefending() ? '2' : '1', 'military', 'political', context.source],
                            multipleTrigger: true,
                            gameAction: AbilityDsl.actions.cardLastingEffect(() => ({
                                target: context.target,
                                effect: AbilityDsl.effects.modifyBothSkills(() => context.target.isDefending() ? 2 : 1)
                            })) 
                        })
                    })),
                    AbilityDsl.actions.playerLastingEffect(context => ({
                        targetController: context.player,
                        duration: Durations.UntilPassPriority,
                        effect: AbilityDsl.effects.additionalAction(this.getExtraActionCount(context))
                    }))
                ])
            },
            effect: 'give {0} +{1}{2} and +{1}{3} after each event they play{4}{5}{6}{7}',
            effectArgs: (context) => {
                const actions = this.getExtraActionCount(context);
                if (actions > 0)
                    return  [
                        context.target.isDefending() ? '2' : '1', 'military', 'political',
                        ' and take ', actions, ' additional action', (actions > 1 ? 's' : '')
                    ];
                return [context.target.isDefending() ? '2' : '1', 'military', 'political', '', '', '', ''];
            },
            max: AbilityDsl.limit.perConflict(1)
        });
    }

    getExtraActionCount(context) {
        return context.player.isAttackingPlayer() ?
        context.game.currentConflict.defenders.length : 
        context.game.currentConflict.attackers.length
    }
}
