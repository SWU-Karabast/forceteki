import AbilityDsl from '../../../abilitydsl';
import { CardTypes, Durations, Locations } from '../../../Constants';
import DrawCard from '../../../drawcard';
import { ProvinceCard } from '../../../ProvinceCard';

export default class ScoutsSteed extends DrawCard {
    static id = 'scout-s-steed';

    public setupCardAbilities() {
        this.attachmentConditions({ myControl: true });

        this.reaction({
            title: 'Call your steed and go out to explore!',
            when: {
                onCardPlayed: (event, context) => event.card === context.source
            },
            target: {
                cardType: CardTypes.Province,
                location: Locations.Provinces,
                cardCondition: (card) => card.isFacedown() && card.canBeAttacked()
            },
            gameAction: AbilityDsl.actions.sequentialContext(
                ({ player, target: province, source: { parent: character } }) => ({
                    gameActions: [
                        AbilityDsl.actions.ready({ target: character }),
                        AbilityDsl.actions.cardLastingEffect({
                            target: character,
                            effect: AbilityDsl.effects.mustBeDeclaredAsAttacker(),
                            duration: Durations.UntilEndOfConflict
                        }),
                        AbilityDsl.actions.cardLastingEffect(() => ({
                            target: province,
                            targetLocation: Locations.Provinces,
                            effect: AbilityDsl.effects.cardCannot('break'),
                            duration: Durations.UntilEndOfConflict
                        })),
                        AbilityDsl.actions.initiateConflict({
                            target: player,
                            forceProvinceTarget: province,
                            canPass: false
                        })
                    ]
                })
            ),
            effect: "ready {1} and send them on a journey! {2} cannot be broken during this conflict - it's just exploration for now",
            effectArgs: (context) => [
                context.source.parent,
                context.target.isFacedown() ? context.target.location : context.target
            ]
        });
    }
}