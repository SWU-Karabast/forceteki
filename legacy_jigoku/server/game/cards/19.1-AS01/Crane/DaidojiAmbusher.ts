import type { AbilityContext } from '../../../AbilityContext';
import AbilityDsl from '../../../abilitydsl';
import { CardTypes } from '../../../Constants';
import DrawCard from '../../../drawcard';

const enum Timing {
    BEFORE_PENALTY,
    AFTER_PENALTY
}

export default class DaidojiAmbusher extends DrawCard {
    static id = 'daidoji-ambusher';

    public setupCardAbilities() {
        this.action({
            title: 'Give someone -2 military',
            condition: (context) => context.game.isDuringConflict('military') && context.source.isParticipating(),
            target: {
                cardType: CardTypes.Character,
                cardCondition: (card) => card.isParticipating(),
                gameAction: AbilityDsl.actions.sequential([
                    AbilityDsl.actions.cardLastingEffect({
                        effect: AbilityDsl.effects.modifyMilitarySkill(-2)
                    }),
                    AbilityDsl.actions.conditional({
                        condition: (context) => this.triggerKickerEffect(context, Timing.AFTER_PENALTY),
                        trueGameAction: AbilityDsl.actions.conditional({
                            condition: (context) => this.shouldDiscardTarget(context),
                            trueGameAction: AbilityDsl.actions.discardFromPlay(),
                            falseGameAction: AbilityDsl.actions.removeFate()
                        }),
                        falseGameAction: AbilityDsl.actions.noAction()
                    })
                ])
            },
            effect: 'give {0} -2{1}{2}',
            effectArgs: (context) => [
                'military',
                this.triggerKickerEffect(context, Timing.BEFORE_PENALTY)
                    ? ` and ${this.shouldDiscardTarget(context) ? 'discard them' : 'remove a fate from them'}`
                    : ''
            ]
        });
    }

    private triggerKickerEffect(context: AbilityContext, timing: Timing): boolean {
        const isDishonored = context.source.isDishonored;
        const targetZero =
            timing === Timing.BEFORE_PENALTY
                ? context.target.getMilitarySkill() <= 2
                : context.target.getMilitarySkill() === 0;

        return isDishonored && targetZero;
    }

    private shouldDiscardTarget(context: AbilityContext): boolean {
        return context.target.getFate() === 0;
    }
}
