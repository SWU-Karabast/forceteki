import type { AbilityContext } from '../../AbilityContext';
import AbilityDsl from '../../abilitydsl';
import type BaseCard from '../../basecard';
import { AbilityTypes, CardTypes, Durations, Players } from '../../Constants';
import type DrawCard from '../../drawcard';
import type { PersistentEffectProps } from '../../Interfaces';
import { BaseOni } from './_BaseOni';

export default class UndeadHorror extends BaseOni {
    static id = 'undead-horror';

    public setupCardAbilities() {
        super.setupCardAbilities();
        this.reaction({
            title: 'Attach a character to this card',
            when: {
                afterConflict: (event, context) =>
                    event.conflict.winner === context.source.controller &&
                    context.source.isParticipating() &&
                    context.player.opponent &&
                    (context.player.opponent.dynastyDiscardPile as BaseCard[]).filter(
                        (card) => card.type === CardTypes.Character
                    ).length > 0
            },
            effect: "attach a random character from {1}'s dynasty discard pile to {2}",
            effectArgs: (context) => [context.player.opponent, context.source],
            gameAction: AbilityDsl.actions.sequentialContext((context) => {
                const potentialTargets = (context.player.opponent.dynastyDiscardPile as BaseCard[]).filter(
                    (card): card is DrawCard => card.type === CardTypes.Character
                );
                var j = Math.floor(Math.random() * potentialTargets.length);
                const targetCard = potentialTargets[j];

                this.messageShown = false;
                return {
                    gameActions: [
                        AbilityDsl.actions.cardLastingEffect({
                            target: targetCard,
                            canChangeZoneOnce: true,
                            duration: Durations.Custom,
                            effect: [
                                AbilityDsl.effects.blank(true),
                                AbilityDsl.effects.changeType(CardTypes.Attachment),
                                AbilityDsl.effects.gainAbility(AbilityTypes.Persistent, {
                                    match: (card, context) => card === context.source.parent,
                                    targetController: Players.Opponent,
                                    effect: [
                                        AbilityDsl.effects.modifyMilitarySkill(
                                            (card: BaseCard, context: AbilityContext) =>
                                                context.source.printedMilitarySkill || 0
                                        ),
                                        AbilityDsl.effects.modifyPoliticalSkill(
                                            (card: BaseCard, context: AbilityContext) =>
                                                context.source.printedPoliticalSkill || 0
                                        )
                                    ]
                                } as PersistentEffectProps)
                            ]
                        }),
                        AbilityDsl.actions.attach({
                            target: context.source,
                            attachment: targetCard
                        }),
                        AbilityDsl.actions.handler({
                            handler: (context) => {
                                if (!this.messageShown) {
                                    // for some reason, it shows the message twice
                                    context.game.addMessage('{0} is attached to {1}', targetCard, context.source);
                                }
                            }
                        })
                    ]
                };
            })
        });
    }
}