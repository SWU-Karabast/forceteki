import { Durations, DuelTypes, ConflictTypes } from '../../../Constants';
import AbilityDsl from '../../../abilitydsl';
import DrawCard from '../../../drawcard';

export default class MirumotoRei2 extends DrawCard {
    static id = 'mirumoto-rei-2';

    getWeaponCount(context) {
        return context.source.attachments.filter((card) => card.hasTrait('weapon')).length;
    }

    setupCardAbilities() {
        this.duelChallenge({
            title: 'Help a character with a duel',
            duelCondition: (duel, context) =>
                duel.participants.includes(context.source) && this.getWeaponCount(context) > 0,
            gameAction: AbilityDsl.actions.duelLastingEffect((context) => ({
                target: (context as any).event.duel,
                effect: AbilityDsl.effects.modifyDuelSkill({
                    amount: this.getWeaponCount(context),
                    player: context.player
                }),
                duration: Durations.UntilEndOfDuel
            })),
            effect: 'add {1} to their duel total',
            effectArgs: (context) => [this.getWeaponCount(context)]
        });

        this.action({
            title: 'Duel an opposing character',
            condition: (context) => context.game.isDuringConflict(ConflictTypes.Military),
            initiateDuel: {
                type: DuelTypes.Military,
                message: 'injure {0}',
                messageArgs: (duel) => [duel.loser],
                gameAction: (duel) =>
                    duel.loser &&
                    AbilityDsl.actions.multipleContext(() => {
                        const gameActions = [];
                        duel.loser.forEach((loser) => {
                            if (loser.getFate() > 0) {
                                gameActions.push(
                                    AbilityDsl.actions.removeFate({
                                        target: loser,
                                        amount: 1
                                    })
                                );
                            } else {
                                gameActions.push(
                                    AbilityDsl.actions.discardFromPlay({
                                        target: loser
                                    })
                                );
                            }
                        });
                        return { gameActions };
                    })
            }
        });
    }
}
