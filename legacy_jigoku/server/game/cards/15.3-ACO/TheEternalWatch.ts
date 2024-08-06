import { CardTypes, Players, TargetModes } from '../../Constants';
import { ProvinceCard } from '../../ProvinceCard';
import AbilityDsl from '../../abilitydsl';

export default class TheEternalWatch extends ProvinceCard {
    static id = 'the-eternal-watch';

    setupCardAbilities() {
        this.action({
            title: 'Bow a character or take an honor from your opponent',
            targets: {
                character: {
                    cardType: CardTypes.Character,
                    cardCondition: (card, context) => card.isAttacking() && card.allowGameAction('bow', context)
                },
                select: {
                    mode: TargetModes.Select,
                    dependsOn: 'character',
                    player: Players.Opponent,
                    choices: {
                        'Bow this character': AbilityDsl.actions.bow((context) => ({
                            target: context.targets.character
                        })),
                        'Give your opponent 1 honor': AbilityDsl.actions.takeHonor()
                    }
                }
            },
            effect: '{1}{2}',
            effectArgs: (context) =>
                context.selects.select.choice === 'Give your opponent 1 honor'
                    ? ['take 1 honor from ', context.player.opponent]
                    : ['bow ', context.targets.character]
        });
    }
}
