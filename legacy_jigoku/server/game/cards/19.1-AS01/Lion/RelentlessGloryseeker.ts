import { EventNames, Locations, Phases } from '../../../Constants';
import { EventRegistrar } from '../../../EventRegistrar';
import AbilityDsl = require('../../../abilitydsl');
import DrawCard = require('../../../drawcard');

const MAXIMUM_RESSURRECTIONS = 1;

export default class RelentlessGloryseeker extends DrawCard {
    static id = 'relentless-gloryseeker';

    private ressurrectionsThisRound = 0;
    private eventRegistrar?: EventRegistrar;

    public setupCardAbilities() {
        this.eventRegistrar = new EventRegistrar(this.game, this);
        this.eventRegistrar.register([EventNames.OnRoundEnded, EventNames.OnCardLeavesPlay]);

        this.reaction({
            title: 'Put this character into play',
            location: Locations.DynastyDiscardPile,
            when: {
                onCardLeavesPlay: (event, context) =>
                    event.card === context.source &&
                    context.game.currentPhase === Phases.Conflict &&
                    this.ressurrectionsThisRound < MAXIMUM_RESSURRECTIONS
            },
            gameAction: AbilityDsl.actions.putIntoPlay(),
            effect: 'return to play - {0} is ready for more!',
            then: () => {
                this.ressurrectionsThisRound++;
                return { gameAction: AbilityDsl.actions.noAction() };
            }
        });
    }

    public onRoundEnded() {
        this.ressurrectionsThisRound = 0;
    }

    public onCardLeavesPlay(event: any) {
        if (
            event.card === this &&
            this.location !== Locations.RemovedFromGame &&
            this.ressurrectionsThisRound >= MAXIMUM_RESSURRECTIONS
        ) {
            this.game.addMessage(
                '{0} is removed from the game due to leaving play - may their tales lead them to Yomi',
                this
            );
            this.owner.moveCard(this, Locations.RemovedFromGame);
        }
    }
}
