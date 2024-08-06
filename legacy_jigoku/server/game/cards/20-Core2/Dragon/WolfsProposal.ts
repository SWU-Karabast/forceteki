import AbilityDsl from '../../../abilitydsl';
import { Durations } from '../../../Constants';
import DrawCard from '../../../drawcard';

export default class WolfsProposal extends DrawCard {
    static id = 'wolf-s-proposal';

    setupCardAbilities() {
        this.action({
            title: 'Adjust glory',
            gameAction: AbilityDsl.actions.chooseAction({
                options: {
                    'Increase glory': {
                        action: AbilityDsl.actions.cardLastingEffect((context) => ({
                            target: context.source.parent,
                            duration: Durations.UntilEndOfPhase,
                            effect: AbilityDsl.effects.modifyGlory(1)
                        }))
                    },
                    'Decrease glory': {
                        action: AbilityDsl.actions.cardLastingEffect((context) => ({
                            target: context.source.parent,
                            duration: Durations.UntilEndOfPhase,
                            effect: AbilityDsl.effects.modifyGlory(-1)
                        }))
                    }
                }
            })
        });
    }
}