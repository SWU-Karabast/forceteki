import { Locations, CardTypes, CharacterStatus } from '../../../Constants';
import AbilityDsl from '../../../abilitydsl';
import DrawCard from '../../../drawcard';

export default class DiligentChaperone extends DrawCard {
    static id = 'diligent-chaperone';

    setupCardAbilities() {
        this.persistentEffect({
            location: Locations.Any,
            effect: AbilityDsl.effects.cannotParticipateAsAttacker()
        });

        this.wouldInterrupt({
            title: 'Prevent a character from losing an honor token',
            when: {
                onStatusTokenMoved: (event, context) =>
                    event.token.grantedStatus === CharacterStatus.Honored &&
                    event.token.card.controller === context.player &&
                    event.token.card.type === CardTypes.Character &&
                    !context.source.bowed,
                onCardDishonored: (event, context) =>
                    event.card.isHonored &&
                    event.card.controller === context.player &&
                    event.card.type === CardTypes.Character &&
                    !context.source.bowed
            },
            effect: 'prevent {1} from losing their status token',
            effectArgs: (context) => context.event.token?.card ?? context.event.card,
            gameAction: AbilityDsl.actions.cancel({
                replacementGameAction: AbilityDsl.actions.noAction()
            })
        });
    }
}
