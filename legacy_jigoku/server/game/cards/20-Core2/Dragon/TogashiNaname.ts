import { CardTypes, Players, TargetModes } from '../../../Constants';
import { RingEffects } from '../../../RingEffects';
import AbilityDsl from '../../../abilitydsl';
import DrawCard from '../../../drawcard';

export default class TogashiNaname extends DrawCard {
    static id = 'togashi-naname';

    public setupCardAbilities() {
        this.persistentEffect({
            effect: AbilityDsl.effects.cardCannot('receiveDishonorToken')
        });

        this.action({
            title: 'Remove fate or resolve a ring',
            condition: (context) => context.source.isParticipating(),
            targets: {
                character: {
                    cardType: CardTypes.Character,
                    controller: Players.Opponent,
                    cardCondition: (card: DrawCard) => card.isParticipating() && card.fate > 0
                },
                ring: {
                    dependsOn: 'character',
                    mode: TargetModes.Ring,
                    ringCondition: (ring) => ring.isUnclaimed()
                },
                select: {
                    mode: TargetModes.Select,
                    dependsOn: 'ring',
                    player: Players.Opponent,
                    choices: (context) => ({
                        [`Move a fate from ${context.targets.character.name} to the ${RingEffects.getRingName(
                            context.rings.ring.element
                        )}`]: AbilityDsl.actions.placeFateOnRing((context) => ({
                            target: context.rings.ring,
                            origin: context.targets.character
                        })),
                        [`Let Opponent Resolve the ${RingEffects.getRingName(context.rings.ring.element)}`]:
                            AbilityDsl.actions.resolveRingEffect((context) => ({
                                player: context.player,
                                target: context.rings.ring
                            }))
                    })
                }
            }
        });
    }
}