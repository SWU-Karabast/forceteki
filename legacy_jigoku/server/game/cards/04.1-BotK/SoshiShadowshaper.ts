import { CardTypes, EventNames, Locations, Phases } from '../../Constants';
import { EventRegistrar } from '../../EventRegistrar';
import AbilityDsl = require('../../abilitydsl');
import BaseCard = require('../../basecard');
import DrawCard = require('../../drawcard');

export default class SoshiShadowshaper extends DrawCard {
    static id = 'soshi-shadowshaper';

    private charactersPlayedThisPhase = new Set<BaseCard>();
    private eventRegistrar?: EventRegistrar;

    public setupCardAbilities() {
        this.eventRegistrar = new EventRegistrar(this.game, this);
        this.eventRegistrar.register([EventNames.OnPhaseStarted, EventNames.OnCharacterEntersPlay]);

        this.action({
            title: "Return a character to owner's hand",
            phase: Phases.Conflict,
            cost: AbilityDsl.costs.payHonor(1),
            target: {
                cardType: CardTypes.Character,
                cardCondition: (card) => card.getCost() < 3 && this.charactersPlayedThisPhase.has(card),
                gameAction: AbilityDsl.actions.returnToHand()
            }
        });
    }

    public onPhaseStarted() {
        this.charactersPlayedThisPhase.clear();
    }

    public onCharacterEntersPlay(event: any) {
        if (event.originalLocation === Locations.Hand) {
            this.charactersPlayedThisPhase.add(event.card);
        }
    }
}
