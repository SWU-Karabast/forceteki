import PlayerOrCardAbility from '../../ability/PlayerOrCardAbility';
import { CardType, EventName, Location } from '../../Constants';
import Player from '../../Player';
import Contract from '../../utils/Contract';
import { isArena } from '../../utils/EnumHelpers';
import { Card } from '../Card';

// required for mixins to be based on this class
export type PlayableOrDeployableCardConstructor = new (...args: any[]) => PlayableOrDeployableCard;

/**
 * Subclass of {@link Card} that represents shared features of all non-base cards.
 * Implements the basic pieces for a card to be able to be played (non-leader) or deployed (leader),
 * as well as exhausted status.
 */
export class PlayableOrDeployableCard extends Card {
    /**
         * List of actions that the player can take with this card that aren't printed text abilities.
         * Typical examples are playing / deploying cards and attacking.
         */
    protected defaultActions: PlayerOrCardAbility[] = [];

    private _exhausted?: boolean = null;

    public get exhausted(): boolean {
        this.assertPropertyEnabled(this._exhausted, 'exhausted');
        return this._exhausted;
    }

    public set exhausted(val: boolean) {
        this.assertPropertyEnabled(this._exhausted, 'exhausted');
        this._exhausted = val;
    }

    // see Card constructor for list of expected args
    public constructor(owner: Player, cardData: any) {
        super(owner, cardData);

        // this class is for all card types other than Base
        Contract.assertFalse(this.printedTypes.has(CardType.Base));
    }

    public override getActions(): PlayerOrCardAbility[] {
        return this.isBlank() ? []
            : this.defaultActions.concat(super.getActions());
    }

    public exhaust() {
        this.assertPropertyEnabled(this._exhausted, 'exhausted');
        this._exhausted = true;
    }

    public ready() {
        this.assertPropertyEnabled(this._exhausted, 'exhausted');
        this._exhausted = false;
    }

    protected enableExhaust(enabledStatus: boolean) {
        this._exhausted = enabledStatus ? true : null;
    }
}