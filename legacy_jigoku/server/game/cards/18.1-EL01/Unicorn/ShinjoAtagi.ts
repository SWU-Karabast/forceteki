import AbilityDsl from '../../../abilitydsl';
import { CardTypes, Locations, Players } from '../../../Constants';
import DrawCard from '../../../drawcard';
import { ProvinceCard } from '../../../ProvinceCard';

export default class ShinjoAtagi extends DrawCard {
    static id = 'shinjo-atagi';

    setupCardAbilities() {
        this.action({
            title: "Set a participating character's skills",
            condition: (context) => context.source.isParticipating(),
            target: {
                cardType: CardTypes.Character,
                controller: Players.Any,
                cardCondition: (card) => card.isParticipating(),
                gameAction: AbilityDsl.actions.selectCard((context) => ({
                    activePromptTitle: 'Choose an attacked province',
                    hidePromptIfSingleCard: true,
                    cardType: CardTypes.Province,
                    location: Locations.Provinces,
                    message: '{3} sets the {1} skill of {0} to {2}{1}',
                    messageArgs: (card: ProvinceCard) => [
                        context.target,
                        context.game.currentConflict.conflictType,
                        card.getStrength(),
                        context.source
                    ],
                    cardCondition: (card) => card.isConflictProvince(),
                    subActionProperties: (card: ProvinceCard) => {
                        context.targets.province = card;
                        const provinceStrength = card.getStrength();
                        const effect =
                            context.game.currentConflict.conflictType === 'military'
                                ? AbilityDsl.effects.setMilitarySkill(provinceStrength)
                                : AbilityDsl.effects.setPoliticalSkill(provinceStrength);
                        return {
                            target: context.target,
                            effect: effect
                        };
                    },
                    gameAction: AbilityDsl.actions.cardLastingEffect({})
                }))
            },
            effect: 'set the {1} skill of {0} to the strength of an attacked province',
            effectArgs: (context) => [context.game.currentConflict.conflictType]
        });
    }
}