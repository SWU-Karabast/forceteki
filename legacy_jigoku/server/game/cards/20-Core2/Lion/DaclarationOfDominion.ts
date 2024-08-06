import { CardTypes, Players, TargetModes } from '../../../Constants';
import AbilityDsl from '../../../abilitydsl';
import type DrawCard from '../../../drawcard';
import { BattlefieldAttachment } from '../../BattlefieldAttachment';

export default class DaclarationOfDominion extends BattlefieldAttachment {
    static id = 'declaration-of-dominion';

    public setupCardAbilities() {
        super.setupCardAbilities();

        this.action({
            title: 'Gives Pride to chosen characters',
            condition: (context) => context.source.parent?.isConflictProvince(),
            targets: {
                myCard: {
                    activePromptTitle: 'Choose a character on your side',
                    mode: TargetModes.UpTo,
                    numCards: 1,
                    optional: true,
                    cardType: CardTypes.Character,
                    controller: Players.Self,
                    cardCondition: (card: DrawCard) => card.isParticipating(),
                    gameAction: AbilityDsl.actions.cardLastingEffect({
                        effect: AbilityDsl.effects.addKeyword('pride')
                    })
                },
                opponentsCard: {
                    activePromptTitle: 'Choose a character on the enemy side',
                    mode: TargetModes.UpTo,
                    numCards: 1,
                    optional: true,
                    cardType: CardTypes.Character,
                    controller: Players.Opponent,
                    cardCondition: (card: DrawCard) => card.isParticipating(),
                    gameAction: AbilityDsl.actions.cardLastingEffect({
                        effect: AbilityDsl.effects.addKeyword('pride')
                    })
                }
            },
            effect: 'give pride to {1}',
            effectArgs: (context) => [
                ((context.targets.myCard as undefined | Array<DrawCard>) ?? []).concat(
                    (context.targets.opponentsCard as undefined | Array<DrawCard>) ?? []
                )
            ]
        });
    }
}