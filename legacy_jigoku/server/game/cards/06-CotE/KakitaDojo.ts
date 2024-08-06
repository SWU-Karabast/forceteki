import { DuelTypes } from '../../Constants';
import { Duel } from '../../Duel';
import AbilityDsl from '../../abilitydsl';
import DrawCard from '../../drawcard';

export default class KakitaDojo extends DrawCard {
    static id = 'kakita-dojo';

    setupCardAbilities() {
        this.action({
            title: 'Initiate a military duel',
            initiateDuel: {
                type: DuelTypes.Military,
                message: '{0} {1}cannot trigger its abilities until the end of the conflict',
                messageArgs: (duel) => [duel.loser, this.#wonByDuelist(duel) ? 'is bowed and ' : ''],
                gameAction: (duel) =>
                    AbilityDsl.actions.multiple([
                        AbilityDsl.actions.cardLastingEffect({
                            target: duel.loser,
                            effect: AbilityDsl.effects.cardCannot('triggerAbilities')
                        }),
                        AbilityDsl.actions.bow({ target: this.#wonByDuelist(duel) ? duel.loser : undefined })
                    ])
            }
        });
    }

    #wonByDuelist(duel: Duel): boolean {
        return duel.winner?.some((char) => char.hasTrait('duelist')) ?? false;
    }
}
