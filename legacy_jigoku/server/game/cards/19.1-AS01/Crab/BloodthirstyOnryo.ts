import { CardTypes, Locations } from '../../../Constants';
import { EventRegistrar } from '../../../EventRegistrar';
import AbilityDsl = require('../../../abilitydsl');
import DrawCard = require('../../../drawcard');

export default class BloodthirstyOnryo extends DrawCard {
    static id = 'bloodthirsty-onryo';

    public setupCardAbilities() {
        this.eventRegistrar = new EventRegistrar(this.game, this);
        this.eventRegistrar.register(['onCardLeavesPlay']);

        this.action({
            title: 'Put this into play',
            cost: AbilityDsl.costs.sacrifice({ cardType: CardTypes.Character }),
            location: [Locations.Provinces, Locations.DynastyDiscardPile],
            gameAction: AbilityDsl.actions.putIntoPlay()
        });
    }

    public onCardLeavesPlay(event: any) {
        if (event.card === this && this.location !== Locations.RemovedFromGame) {
            this.game.addMessage('{0} is removed from the game due to leaving play', this);
            this.owner.moveCard(this, Locations.RemovedFromGame);
        }
    }
}
