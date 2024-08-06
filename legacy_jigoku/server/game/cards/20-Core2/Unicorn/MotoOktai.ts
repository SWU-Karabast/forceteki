import { CardTypes, Durations, Locations, Players } from '../../../Constants';
import AbilityDsl from '../../../abilitydsl';
import DrawCard from '../../../drawcard';

function skillBonus(card: DrawCard) {
    return card.getMilitarySkill();
}

export default class MotoOktai extends DrawCard {
    static id = 'moto-oktai';

    setupCardAbilities() {
        this.interrupt({
            title: "Increase this character's skill",
            when: {
                onCardLeavesPlay: ({ card }, context) =>
                    card.location === Locations.PlayArea &&
                    card.type === CardTypes.Character &&
                    context.game.isDuringConflict()
            },
            effect: 'get +{1} {2} for this phase - he is emboldened by justice, but unburdened by mercy!',
            effectArgs: (context) => [skillBonus(context.event.card), 'military'],
            gameAction: AbilityDsl.actions.cardLastingEffect((context) => ({
                duration: Durations.UntilEndOfPhase,
                effect: AbilityDsl.effects.modifyMilitarySkill(skillBonus((context as any).event.card))
            }))
        });

        this.action({
            title: 'Discard a character from play',
            condition: (context) => context.source.isParticipatingFor(context.player),
            target: {
                cardType: CardTypes.Character,
                controller: Players.Self,
                gameAction: AbilityDsl.actions.discardFromPlay()
            },
            effect: 'discard {1} - purge the weak!',
            effectArgs: (context) => [context.target]
        });
    }
}
