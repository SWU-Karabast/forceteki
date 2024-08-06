import { Locations, Phases, PlayTypes, EventNames, CardTypes } from '../../Constants';
import { putIntoPlay, sacrifice } from '../../GameActions/GameActions';
import ThenAbility from '../../ThenAbility';
import AbilityDsl from '../../abilitydsl';
import DrawCard from '../../drawcard';
import DynastyCardAction from '../../dynastycardaction';

const backAlleyPersistentEffect = {
    apply: (card) => {
        // enable popup functionality
        card.showPopup = true;
        card.popupMenuText = 'Use Interrupt ability';
        // register limit which needs to be shared among all the play actions which will be added by the interrupt ability
        card.backAlleyActionLimit.registerEvents(card.game);
    },
    unapply: (card) => {
        for (const character of card.attachments) {
            // move all attachments to the correct discard pile
            character.owner.moveCard(
                character,
                character.isDynasty ? Locations.DynastyDiscardPile : Locations.ConflictDiscardPile
            );
            // remove any added playActions
            // ??
            character.abilities.playActions = character.abilities.playActions.filter(
                (action) => action.title !== 'Play this character from Back-Alley Hideaway'
            );
        }

        // disable popup functionality
        card.showPopup = false;
        card.popupMenuText = '';
        // reset and unregister limit
        card.backAlleyActionLimit.reset();
        card.backAlleyActionLimit.unregisterEvents(card.game);
    }
};

class BackAlleyPlayCharacterAction extends DynastyCardAction {
    title = 'Play this character from Back-Alley Hideaway';
    limit: any;

    constructor(
        public backAlleyCard: BackAlleyHideaway,
        card
    ) {
        super(card);
        this.limit = backAlleyCard.backAlleyActionLimit;
    }

    meetsRequirements(context = this.createContext()) {
        if (context.game.currentPhase !== Phases.Dynasty) {
            return 'phase';
        }
        if (context.source.location !== 'backalley hideaway') {
            return 'location';
        }
        if (
            !context.source.canPlay(context, PlayTypes.PlayFromProvince) ||
            !context.source.parent.canTriggerAbilities(context)
        ) {
            return 'cannotTrigger';
        }
        if (!this.canPayCosts(context)) {
            return 'cost';
        }
        return '';
    }

    executeHandler(context) {
        context.game.addMessage(
            '{0} plays {1} from {2} with {3} additional fate',
            context.player,
            context.source,
            context.source.parent,
            context.chooseFate
        );
        // remove this action from the card
        // ??
        context.source.abilities.playActions = context.source.abilities.playActions.filter(
            (action) => action.title !== 'Play this character from Back-Alley Hideaway'
        );
        // remove associations between this card and Back-Alley Hideaway
        this.backAlleyCard.removeAttachment(context.source);
        context.source.parent = null;
        let putIntoPlayEvent = putIntoPlay({ fate: context.chooseFate }).getEvent(context.source, context);
        let cardPlayedEvent = context.game.getEvent(EventNames.OnCardPlayed, {
            player: context.player,
            card: context.source,
            originalLocation: 'backalley hideaway',
            playType: PlayTypes.PlayFromProvince
        });
        let window = context.game.openEventWindow([putIntoPlayEvent, cardPlayedEvent]);
        context.events = [putIntoPlayEvent];
        let thenAbility = new ThenAbility(context.game, this.backAlleyCard, {
            gameAction: sacrifice({ target: this.backAlleyCard })
        });
        window.addThenAbility(thenAbility, context);
    }

    isCardAbility() {
        return true;
    }
}

export default class BackAlleyHideaway extends DrawCard {
    static id = 'back-alley-hideaway';

    setupCardAbilities() {
        this.backAlleyActionLimit = AbilityDsl.limit.perRound(1);
        this.persistentEffect({
            effect: AbilityDsl.effects.customDetachedCard(backAlleyPersistentEffect)
        });
        this.interrupt({
            title: 'Place character in Hideaway',
            when: {
                onCardLeavesPlay: (event, context) =>
                    event.card.isFaction('scorpion') &&
                    event.card.type === CardTypes.Character &&
                    event.card.controller === context.player &&
                    event.card.location === Locations.PlayArea
            },
            effect: 'move {1} into hiding',
            effectArgs: (context) => context.event.card,
            handler: (context) =>
                context.event.replaceHandler((event) => {
                    context.player.removeCardFromPile(event.card);
                    event.card.leavesPlay();
                    event.card.moveTo('backalley hideaway');
                    context.source.attachments.push(event.card);
                    event.card.parent = context.source;
                    event.card.abilities.playActions.push(new BackAlleyPlayCharacterAction(context.source, event.card));
                })
        });
    }
}
