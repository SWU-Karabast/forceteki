import PlayerOrCardAbility from '../../ability/PlayerOrCardAbility';
import { CardType, EventName, Location } from '../../Constants';
import Player from '../../Player';
import Contract from '../../utils/Contract';
import { isArena } from '../../utils/EnumHelpers';
import { NewCard } from '../NewCard';

// required for mixins to be based on this class
export type PlayableOrDeployableCardConstructor = new (...args: any[]) => PlayableOrDeployableCard;

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

    private _exhausted?: boolean = null;

    public override get actions(): PlayerOrCardAbility[] {
        return this.isBlank() ? []
            : this.defaultActions.concat(super.actions);
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
}