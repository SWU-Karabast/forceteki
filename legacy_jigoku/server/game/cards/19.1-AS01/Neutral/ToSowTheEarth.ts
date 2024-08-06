import { CardTypes, Players, Locations, TargetModes } from '../../../Constants';
import { PlayCharacterAsIfFromHand } from '../../../PlayCharacterAsIfFromHand';
import { PlayDisguisedCharacterAsIfFromHand } from '../../../PlayDisguisedCharacterAsIfFromHand';
import AbilityDsl = require('../../../abilitydsl');
import BaseCard = require('../../../basecard');
import DrawCard = require('../../../drawcard');

export default class ToSowTheEarth extends DrawCard {
    static id = 'to-sow-the-earth';

    public setupCardAbilities() {
        this.action({
            title: 'Play a peasant from the discard pile',
            target: {
                cardType: CardTypes.Character,
                controller: Players.Self,
                location: [Locations.ConflictDiscardPile, Locations.DynastyDiscardPile],
                mode: TargetModes.Single,
                cardCondition: (card) => card.hasTrait('peasant'),
                gameAction: AbilityDsl.actions.sequential([
                    AbilityDsl.actions.cardLastingEffect((context) => ({
                        target: context.target,
                        effect: [
                            AbilityDsl.effects.gainPlayAction(PlayCharacterAsIfFromHand),
                            AbilityDsl.effects.gainPlayAction(PlayDisguisedCharacterAsIfFromHand)
                        ]
                    })),
                    AbilityDsl.actions.playCard((context) => ({
                        target: context.target
                    }))
                ])
            },
            effect: 'play {0} from their discard pile'
        });

        this.action({
            title: 'Place a province facedown',
            cost: AbilityDsl.costs.bow({
                cardCondition: (card: BaseCard) => card.hasTrait('peasant')
            }),
            target: {
                cardType: CardTypes.Province,
                location: Locations.Provinces,
                controller: Players.Any,
                cardCondition: (card) => card.isBroken === false,
                gameAction: AbilityDsl.actions.turnFacedown()
            },
            max: AbilityDsl.limit.perRound(1)
        });
    }
}
