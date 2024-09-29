import { PlayEventAction } from '../../../actions/PlayEventAction';
import { PlayUnitAction } from '../../../actions/PlayUnitAction';
import { PlayUpgradeAction } from '../../../actions/PlayUpgradeAction';
import PlayerOrCardAbility from '../../ability/PlayerOrCardAbility';
import { CardType, EventName, KeywordName, Location, PlayType } from '../../Constants';
import Player from '../../Player';
import * as Contract from '../../utils/Contract';
import * as EnumHelpers from '../../utils/EnumHelpers';
import { Card } from '../Card';
import { NonLeaderUnitCard } from '../NonLeaderUnitCard';

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
        Contract.assertFalse(this.printedType === CardType.Base);
    }

    public override getActions(): PlayerOrCardAbility[] {
        const actions = this.defaultActions.concat(super.getActions());

        if (this.location === Location.Resource && this.hasSomeKeyword(KeywordName.Smuggle)) {
            if (this.isUnit()) {
                actions.push(new PlayUnitAction(this, PlayType.Smuggle));
            }
            if (this.isEvent()) {
                actions.push(new PlayEventAction(this, PlayType.Smuggle));
            }
            if (this.isUpgrade()) {
                actions.push(new PlayUpgradeAction(this, PlayType.Smuggle));
            }
        }

        return actions;
    }

    public exhaust() {
        this.assertPropertyEnabled(this._exhausted, 'exhausted');
        this._exhausted = true;
    }

    public ready() {
        this.assertPropertyEnabled(this._exhausted, 'exhausted');
        this._exhausted = false;
    }

    public override canBeExhausted(): this is PlayableOrDeployableCard {
        return true;
    }


    protected setExhaustEnabled(enabledStatus: boolean) {
        this._exhausted = enabledStatus ? true : null;
    }
}