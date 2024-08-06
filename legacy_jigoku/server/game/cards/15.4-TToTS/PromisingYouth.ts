import { CardTypes, Durations } from '../../Constants';
import { PlayCharacterAsAttachment } from '../../PlayCharacterAsAttachment';
import AbilityDsl from '../../abilitydsl';
import DrawCard from '../../drawcard';

export default class PromisingYouth extends DrawCard {
    static id = 'promising-youth';

    setupCardAbilities() {
        this.abilities.playActions.push(new PlayCharacterAsAttachment(this));
        this.whileAttached({
            effect: AbilityDsl.effects.modifyBothSkills(2)
        });
        this.wouldInterrupt({
            title: 'when attached char leaves play, turn into character',
            when: {
                onCardLeavesPlay: (event, context) => event.card === context.source.parent
            },
            gameAction: AbilityDsl.actions.multiple([
                AbilityDsl.actions.cardLastingEffect((context) => ({
                    target: context.source,
                    duration: Durations.Custom,
                    effect: AbilityDsl.effects.changeType(CardTypes.Character)
                })),
                AbilityDsl.actions.detach((context) => ({ target: context.source }))
            ])
        });
    }

    leavesPlay() {
        this.printedType = CardTypes.Character;
        super.leavesPlay();
    }
}
