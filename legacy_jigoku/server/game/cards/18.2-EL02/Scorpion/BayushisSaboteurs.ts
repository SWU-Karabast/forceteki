import { Locations, Players, TargetModes } from '../../../Constants';
import AbilityDsl from '../../../abilitydsl';
import DrawCard from '../../../drawcard';
import type Player from '../../../player';
import type { AbilityContext } from '../../../AbilityContext';

const DISCARD = 'Discard all cards from your provinces';
const FLIP = 'Flip all cards in your provinces facedown';

function defender(context: AbilityContext): Player {
    return context.game.currentConflict.defendingPlayer;
}

export default class BayushisSaboteurs extends DrawCard {
    static id = 'bayushi-s-saboteurs';

    setupCardAbilities() {
        this.reaction({
            title: "Discard or flip facedown cards in the defender's provinces",
            when: {
                onConflictDeclared: (event, context) => event.attackers.includes(context.source),
                onDefendersDeclared: (event, context) => event.defenders.includes(context.source),
                onMoveToConflict: (event, context) => event.card === context.source
            },
            target: {
                mode: TargetModes.Select,
                player: (context) =>
                    context.player !== context.game.currentConflict.defendingPlayer ? Players.Opponent : Players.Self,
                choices: {
                    [DISCARD]: AbilityDsl.actions.sequential([
                        AbilityDsl.actions.discardCard((context) => ({
                            target: defender(context).getDynastyCardsInProvince(Locations.Provinces)
                        })),
                        AbilityDsl.actions.refillFaceup((context) => ({
                            target: defender(context),
                            location: [
                                Locations.StrongholdProvince,
                                Locations.ProvinceOne,
                                Locations.ProvinceTwo,
                                Locations.ProvinceThree,
                                Locations.ProvinceFour
                            ]
                        }))
                    ]),
                    [FLIP]: AbilityDsl.actions.turnFacedown((context) => ({
                        target: defender(context).getDynastyCardsInProvince(Locations.Provinces)
                    }))
                }
            },
            effect: "{1} all of {2}'s dynasty cards",
            effectArgs: (context) => [context.select === DISCARD ? 'discard' : 'flip facedown', defender(context)]
        });
    }
}
