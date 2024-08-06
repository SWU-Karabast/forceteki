import AbilityDsl from '../../../abilitydsl';
import DrawCard from '../../../drawcard';
import Player from '../../../player';

export default class IkomaYumiko extends DrawCard {
    static id = 'ikoma-yumiko';

    setupCardAbilities() {
        this.persistentEffect({
            effect: [
                AbilityDsl.effects.modifyBothSkills(
                    (card, context) =>
                        (context.player.opponent as undefined | Player)?.cardsInPlay.reduce(
                            (total: number, char: DrawCard) => (char.isDishonored ? total + 1 : total),
                            0
                        ) ?? 0
                )
            ]
        });

        this.reaction({
            title: 'Claim Imperial favor',
            when: {
                onCharacterEntersPlay: (event, context) => event.card === context.source
            },
            effect: `claim the Emperor's favor`,
            gameAction: AbilityDsl.actions.claimImperialFavor((context) => ({
                target: context.player
            }))
        });
    }
}
