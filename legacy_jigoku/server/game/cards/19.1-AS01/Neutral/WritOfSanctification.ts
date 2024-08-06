import AbilityDsl from '../../../abilitydsl';
import type BaseCard from '../../../basecard';
import { AbilityTypes, CardTypes, Players, TargetModes } from '../../../Constants';
import DrawCard from '../../../drawcard';
import type { ActionProps } from '../../../Interfaces';

export default class WritOfSanctification extends DrawCard {
    static id = 'writ-of-sanctification';

    public setupCardAbilities() {
        this.attachmentConditions({
            limitTrait: { title: 1 },
            trait: 'shugenja'
        });

        this.persistentEffect({
            condition: (context) =>
                !(context.player.cardsInPlay as BaseCard[]).some(
                    (card) => card.hasTrait('shadowlands') && card.type === CardTypes.Character
                ),
            effect: AbilityDsl.effects.addKeyword('ancestral')
        });

        this.whileAttached({
            effect: AbilityDsl.effects.gainAbility(AbilityTypes.Action, {
                title: 'Bow corrupt character',
                condition: (context) => context.source.isParticipating(),
                target: {
                    cardType: CardTypes.Character,
                    controller: Players.Any,
                    mode: TargetModes.Single,
                    cardCondition: (card) => card.isParticipating() && (card.hasTrait('shadowlands') || card.isTainted),
                    gameAction: AbilityDsl.actions.bow()
                }
            } as ActionProps)
        });
    }
}
