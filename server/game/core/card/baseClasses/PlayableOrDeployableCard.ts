import AbilityHelper from '../../../AbilityHelper';
import { IConstantAbilityProps } from '../../../Interfaces';
import PlayerOrCardAbility from '../../ability/PlayerOrCardAbility';
import { CardType, RelativePlayer, WildcardLocation } from '../../Constants';
import { CostAdjustType, ICostAdjusterProperties } from '../../cost/CostAdjuster';
import { IConstantAbility } from '../../ongoingEffect/IConstantAbility';
import Player from '../../Player';
import * as Contract from '../../utils/Contract';
import { Card } from '../Card';
import { IDecreaseEventCostAbilityProps } from '../EventCard';

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
        return this.defaultActions.concat(super.getActions());
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

    /** Create constant ability props on the card that decreases its cost under the given condition */
    protected generateDecreaseCostAbilityProps(properties: IDecreaseEventCostAbilityProps<this>): IConstantAbilityProps {
        const { title, condition, ...otherProps } = properties;

        const costAdjusterProps: ICostAdjusterProperties = Object.assign(otherProps, {
            cardTypeFilter: CardType.Event,
            match: (card, adjusterSource) => card === adjusterSource,
            costAdjustType: CostAdjustType.Decrease
        });

        const costAdjustAbilityProps: IConstantAbilityProps = {
            title,
            sourceLocationFilter: WildcardLocation.Any,
            targetController: RelativePlayer.Any,
            condition: condition,
            ongoingEffect: AbilityHelper.ongoingEffects.decreaseCost(costAdjusterProps)
        };

        return costAdjustAbilityProps;
    }
}