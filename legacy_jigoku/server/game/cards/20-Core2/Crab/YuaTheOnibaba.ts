import { Durations } from '../../../Constants';
import AbilityDsl from '../../../abilitydsl';
import DrawCard from '../../../drawcard';
import type { Conflict } from '../../../conflict';
import type Player from '../../../player';

function charactersToBuffAndNerf(yuaController: Player, conflict: Conflict) {
    const res = {
        toBuff: [] as Array<DrawCard>,
        toNerf: [] as Array<DrawCard>
    };
    for (const character of conflict.getAttackers()) {
        if (!character.hasTrait('bushi')) {
            res.toNerf.push(character);
        } else if (character.controller === yuaController) {
            res.toBuff.push(character);
        }
    }
    for (const character of conflict.getDefenders()) {
        if (!character.hasTrait('bushi')) {
            res.toNerf.push(character);
        } else if (character.controller === yuaController) {
            res.toBuff.push(character);
        }
    }
    return res;
}

export default class YuaTheOnibaba extends DrawCard {
    static id = 'yua-the-onibaba';

    public setupCardAbilities() {
        this.action({
            title: 'Weaken non-bushi, empower bushi',
            condition: (context) => context.source.isParticipating(),
            effect: 'give all friendly participating bushi characters +1{1} / +1{2} and give all participating non-bushi characters -1{1} / -1{2}',
            effectArgs: () => ['military', 'political'],
            gameAction: AbilityDsl.actions.multipleContext((context) => {
                const targets = charactersToBuffAndNerf(context.player, context.game.currentConflict);
                return {
                    gameActions: [
                        AbilityDsl.actions.cardLastingEffect({
                            target: targets.toBuff,
                            effect: AbilityDsl.effects.modifyBothSkills(1),
                            duration: Durations.UntilEndOfConflict
                        }),
                        AbilityDsl.actions.cardLastingEffect({
                            target: targets.toNerf,
                            effect: AbilityDsl.effects.modifyBothSkills(-1),
                            duration: Durations.UntilEndOfConflict
                        })
                    ]
                };
            })
        });
    }
}