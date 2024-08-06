import { AbilityTypes, DuelTypes } from '../../Constants';
import type { Duel } from '../../Duel';
import type { GameAction } from '../../GameActions/GameAction';
import type { TriggeredAbilityContext } from '../../TriggeredAbilityContext';
import AbilityDsl from '../../abilitydsl';
import DrawCard from '../../drawcard';

export default class JusticarsApproach extends DrawCard {
    static id = 'justicar-s-approach';

    setupCardAbilities() {
        this.attachmentConditions({ trait: 'courtier' });

        this.whileAttached({
            effect: AbilityDsl.effects.gainAbility(AbilityTypes.Action, {
                title: 'Initiate a duel to dishonor/bow/discard',
                condition: (context: TriggeredAbilityContext) => context.source.isParticipating(),
                printedAbility: false,
                initiateDuel: {
                    type: DuelTypes.Military,
                    gameAction: (duel: Duel) =>
                        AbilityDsl.actions.multiple(
                            duel.loser?.map((loserChar) => this.#effectsOnLoser(loserChar)) ?? []
                        )
                }
            })
        });
    }

    #effectsOnLoser(target: DrawCard): GameAction {
        const effects: GameAction[] = [AbilityDsl.actions.dishonor({ target })];
        if (target.isDishonored) {
            effects.push(AbilityDsl.actions.bow({ target }));
        }
        if (target.isDishonored && target.bowed) {
            effects.push(AbilityDsl.actions.discardFromPlay({ target }));
        }

        return AbilityDsl.actions.multiple(effects);
    }
}