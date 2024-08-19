import PlayerOrCardAbility from '../ability/PlayerOrCardAbility';
import { CardType, EventName, Location } from '../Constants';
import Player from '../Player';
import Contract from '../utils/Contract';
import { isArena } from '../utils/EnumHelpers';
import { NewCard } from './NewCard';

/**
 * Subclass of {@link NewCard} that represents shared features of all non-base cards.
 * Implements the basic pieces for a card to be able to be played (non-leader) or deployed (leader),
 * as well as exhausted status.
 */
export class PlayableOrDeployableCard extends NewCard {
    /**
         * List of actions that the player can take with this card that aren't printed text abilities.
         * Typical examples are playing / deploying cards and attacking.
         */
    protected defaultActions: PlayerOrCardAbility[] = [];

    private _enteredPlayThisRound?: boolean = null;
    private _exhausted?: boolean = null;

    public override get actions(): PlayerOrCardAbility[] {
        return this.isBlank() ? []
            : this.defaultActions.concat(super.actions);
    }

    public get enteredPlayThisTurn() {
        Contract.assertNotNullLike(this._enteredPlayThisRound);
        return this._enteredPlayThisRound;
    }

    public get exhausted() {
        Contract.assertNotNullLike(this._exhausted);
        return this._exhausted;
    }

    // see NewCard constructor for list of expected args
    public constructor(owner: Player, cardData: any) {
        super(owner, cardData);

        // this class is for all card types other than Base
        Contract.assertFalse(this.printedTypes.has(CardType.Base));
    }

    public exhaust() {
        Contract.assertNotNullLike(this._exhausted);
        this._exhausted = true;
    }

    public ready() {
        Contract.assertNotNullLike(this._exhausted);
        this._exhausted = false;
    }

    protected enableExhaust(enabledStatus: boolean) {
        this._exhausted = enabledStatus ? true : null;
    }

    protected override initializeForCurrentLocation(prevLocation: Location) {
        super.initializeForCurrentLocation(prevLocation);

        this._enteredPlayThisRound = isArena(this.location) ? true : null;

        // register a handler to reset the enteredPlayThisRound flag after the end of the round
        this.game.on(EventName.OnRoundEndedCleanup, this.resetEnteredPlayThisRound);
    }

    private resetEnteredPlayThisRound() {
        // if the value is null, the card is no longer in play
        if (this._enteredPlayThisRound !== null) {
            this._enteredPlayThisRound = false;
        }
    }
}