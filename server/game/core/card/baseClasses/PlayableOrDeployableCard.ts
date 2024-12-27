import type { IConstantAbilityProps, IOngoingEffectGenerator } from '../../../Interfaces';
import OngoingEffectLibrary from '../../../ongoingEffects/OngoingEffectLibrary';
import type { AbilityContext } from '../../ability/AbilityContext';
import * as KeywordHelpers from '../../ability/KeywordHelpers';
import { KeywordWithNumericValue } from '../../ability/KeywordInstance';
import type { IPlayCardActionProperties, IPlayCardActionPropertiesBase, ISmuggleCardActionProperties, PlayCardAction } from '../../ability/PlayCardAction';
import type PlayerOrCardAbility from '../../ability/PlayerOrCardAbility';
import type { Aspect, MoveZoneDestination } from '../../Constants';
import { CardType, KeywordName, PlayType, WildcardRelativePlayer, WildcardZoneName, ZoneName } from '../../Constants';
import type { ICostAdjusterProperties, IIgnoreAllAspectsCostAdjusterProperties, IIgnoreSpecificAspectsCostAdjusterProperties, IIncreaseOrDecreaseCostAdjusterProperties } from '../../cost/CostAdjuster';
import { CostAdjustType } from '../../cost/CostAdjuster';
import type Player from '../../Player';
import * as Contract from '../../utils/Contract';
import { Card } from '../Card';

export type IPlayCardActionOverrides = Omit<IPlayCardActionPropertiesBase, 'playType'>;

// required for mixins to be based on this class
export type PlayableOrDeployableCardConstructor = new (...args: any[]) => PlayableOrDeployableCard;

export interface IDecreaseCostAbilityProps<TSource extends Card = Card> extends Omit<IIncreaseOrDecreaseCostAdjusterProperties, 'cardTypeFilter' | 'match' | 'costAdjustType'> {
    title: string;
    condition?: (context: AbilityContext<TSource>) => boolean;
}

export interface IIgnoreAllAspectPenaltiesProps<TSource extends Card = Card> extends Omit<IIgnoreAllAspectsCostAdjusterProperties, 'cardTypeFilter' | 'match' | 'costAdjustType'> {
    title: string;
    condition?: (context: AbilityContext<TSource>) => boolean;
}

export interface IIgnoreSpecificAspectPenaltyProps<TSource extends Card = Card> extends Omit<IIgnoreSpecificAspectsCostAdjusterProperties, 'cardTypeFilter' | 'match' | 'costAdjustType'> {
    title: string;
    ignoredAspects: Aspect | Aspect[];
    condition?: (context: AbilityContext<TSource>) => boolean;
}

/**
 * Subclass of {@link Card} that represents shared features of all non-base cards.
 * Implements the basic pieces for a card to be able to be played (non-leader) or deployed (leader),
 * as well as exhausted status.
 */
export class PlayableOrDeployableCard extends Card {
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
        return super.getActions()
            .concat(this.getPlayCardActions());
    }

    /**
     * Get the available "play card" actions for this card in its current zone. If `propertyOverrides` is provided, will generate the actions using the included overrides.
     *
     * Note that if the card is currently in an out-of-play zone, by default this will return nothing since cards cannot be played from out of play in normal circumstances.
     * If using an ability to grant an out-of-play action, use `getPlayCardFromOutOfPlayActions` which will generate the appropriate actions.
     */
    public getPlayCardActions(propertyOverrides: IPlayCardActionOverrides = null): PlayCardAction[] {
        if (this.zoneName === ZoneName.Hand) {
            return this.buildPlayCardActions(PlayType.PlayFromHand, propertyOverrides);
        }

        if (this.zoneName === ZoneName.Resource && this.hasSomeKeyword(KeywordName.Smuggle)) {
            return this.buildPlayCardActions(PlayType.Smuggle, propertyOverrides);
        }

        return [];
    }

    /**
     * Get the available "play card" actions for this card in the current out-of-play zone.
     * This will generate an action to play the card from out of play even if it would normally not have one available.
     *
     * If `propertyOverrides` is provided, will generate the actions using the included overrides.
     */
    public getPlayCardFromOutOfPlayActions(propertyOverrides: IPlayCardActionOverrides = null) {
        Contract.assertFalse(
            [ZoneName.Hand, ZoneName.SpaceArena, ZoneName.GroundArena].includes(this.zoneName),
            `Attempting to get "play from out of play" actions for card ${this.internalName} in invalid zone: ${this.zoneName}`
        );

        return this.buildPlayCardActions(PlayType.PlayFromOutOfPlay, propertyOverrides);
    }

    protected buildPlayCardActions(playType: PlayType = PlayType.PlayFromHand, propertyOverrides: IPlayCardActionOverrides = null): PlayCardAction[] {
        let defaultPlayAction: PlayCardAction = null;
        if (playType === PlayType.Smuggle) {
            if (this.hasSomeKeyword(KeywordName.Smuggle)) {
                defaultPlayAction = this.buildCheapestSmuggleAction(propertyOverrides);
            }
        } else {
            defaultPlayAction = this.buildPlayCardAction({ ...propertyOverrides, playType });
        }

        // if there's not a basic play action available for the requested play type, return nothing
        if (defaultPlayAction == null) {
            return [];
        }

        const actions: PlayCardAction[] = [defaultPlayAction];

        // generate "play with exploit" action from default action
        const exploitValue = this.getNumericKeywordSum(KeywordName.Exploit);
        if (exploitValue) {
            actions.push(defaultPlayAction.clone({ exploitValue }));
        }

        return actions;
    }

    protected buildCheapestSmuggleAction(propertyOverrides: IPlayCardActionOverrides = null) {
        Contract.assertTrue(this.hasSomeKeyword(KeywordName.Smuggle));

        const smuggleKeywords = this.getKeywordsWithCostValues(KeywordName.Smuggle);
        const smuggleActions = smuggleKeywords.map((smuggleKeyword) => {
            const smuggleActionProps: ISmuggleCardActionProperties = {
                ...propertyOverrides,
                playType: PlayType.Smuggle,
                smuggleResourceCost: smuggleKeyword.cost,
                smuggleAspects: smuggleKeyword.aspects
            };

            return this.buildPlayCardAction(smuggleActionProps);
        });

        return KeywordHelpers.getCheapestSmuggle(smuggleActions);
    }

    // can't do abstract due to mixins
    public buildPlayCardAction(properties: IPlayCardActionProperties): PlayCardAction {
        Contract.fail('This method should be overridden by the subclass');
    }

    public exhaust() {
        this.assertPropertyEnabled(this._exhausted, 'exhausted');
        this._exhausted = true;
    }

    public ready() {
        this.assertPropertyEnabled(this._exhausted, 'exhausted');
        this._exhausted = false;
    }

    public override moveTo(targetZone: MoveZoneDestination, resetController?: boolean): void {
        // If this card is a resource and it is ready, try to ready another resource instead
        // and exhaust this one. This should be the desired behavior for most cases.
        if (this.zoneName === ZoneName.Resource && !this.exhausted) {
            this.controller.swapResourceReadyState(this);
        }

        super.moveTo(targetZone, resetController);
    }

    public override canBeExhausted(): this is PlayableOrDeployableCard {
        return true;
    }

    public override getSummary(activePlayer: Player) {
        return { ...super.getSummary(activePlayer), exhausted: this._exhausted };
    }

    protected setExhaustEnabled(enabledStatus: boolean) {
        this._exhausted = enabledStatus ? true : null;
    }

    /**
     * For the "numeric" keywords (e.g. Raid), finds all instances of that keyword that are active
     * for this card and adds up the total of their effect values.
     * @returns value of the total effect if enabled, `null` if the effect is not present
     */
    public getNumericKeywordSum(keywordName: KeywordName.Exploit | KeywordName.Restore | KeywordName.Raid): number | null {
        let keywordValueTotal = 0;

        for (const keyword of this.keywords.filter((keyword) => keyword.name === keywordName)) {
            Contract.assertTrue(keyword instanceof KeywordWithNumericValue);
            keywordValueTotal += keyword.value;
        }

        return keywordValueTotal > 0 ? keywordValueTotal : null;
    }

    /**
     * The passed player takes control of this card. If `moveTo` is provided, the card will be moved to that zone under the
     * player's control. If not, it will move to the same zone type it currently occupies but under the new controller.
     *
     * For example, if the card is current in the resource zone and `moveTo` is not provided, it will move to the new
     * controller's resource zone.
     *
     * If `newController` is the same as the current controller, nothing happens.
     */
    public takeControl(newController: Player, moveTo: ZoneName.SpaceArena | ZoneName.GroundArena | ZoneName.Resource = null) {
        if (newController === this.controller) {
            return;
        }

        this._controller = newController;

        const moveDestination = moveTo || this.zone.name;

        Contract.assertTrue(
            moveDestination === ZoneName.SpaceArena || moveDestination === ZoneName.GroundArena || moveDestination === ZoneName.Resource,
            `Attempting to take control of card ${this.internalName} for player ${newController.name} in invalid zone: ${moveDestination}`
        );

        // if we're changing controller and staying in the arena, just tell the arena to update our controller. no move needed
        if (moveDestination === this.zoneName && (this.zone.name === ZoneName.GroundArena || this.zone.name === ZoneName.SpaceArena)) {
            this.zone.updateController(this);

            // register this transition with the engine so it can do uniqueness check if needed
            this.registerMove(this.zone.name);
        } else {
            this.moveTo(moveDestination, false);
        }

        // update the context of all constant abilities so they are aware of the new controller
        for (const constantAbility of this.constantAbilities) {
            if (constantAbility.registeredEffects) {
                for (const effect of constantAbility.registeredEffects) {
                    effect.refreshContext();
                }
            }
        }
    }

    /** Create constant ability props on the card that decreases its cost under the given condition */
    protected generateDecreaseCostAbilityProps(properties: IDecreaseCostAbilityProps<this>): IConstantAbilityProps {
        const { title, condition, ...otherProps } = properties;

        const costAdjusterProps: ICostAdjusterProperties = {
            ...this.buildCostAdjusterGenericProperties(),
            costAdjustType: CostAdjustType.Decrease,
            ...otherProps
        };

        const effect = OngoingEffectLibrary.decreaseCost(costAdjusterProps);
        return this.buildCostAdjusterAbilityProps(condition, title, effect);
    }


    /** Create constant ability props on the card that decreases its cost under the given condition */
    protected generateIgnoreAllAspectPenaltiesAbilityProps(properties: IIgnoreAllAspectPenaltiesProps<this>): IConstantAbilityProps {
        const { title, condition, ...otherProps } = properties;

        const costAdjusterProps: ICostAdjusterProperties = {
            ...this.buildCostAdjusterGenericProperties(),
            costAdjustType: CostAdjustType.IgnoreAllAspects,
            ...otherProps
        };

        const effect = OngoingEffectLibrary.ignoreAllAspectPenalties(costAdjusterProps);
        return this.buildCostAdjusterAbilityProps(condition, title, effect);
    }


    /** Create constant ability props on the card that decreases its cost under the given condition */
    protected generateIgnoreSpecificAspectPenaltiesAbilityProps(properties: IIgnoreSpecificAspectPenaltyProps<this>): IConstantAbilityProps {
        const { title, ignoredAspects, condition, ...otherProps } = properties;

        const costAdjusterProps: ICostAdjusterProperties = {
            ...this.buildCostAdjusterGenericProperties(),
            costAdjustType: CostAdjustType.IgnoreSpecificAspects,
            ignoredAspects: ignoredAspects,
            ...otherProps
        };

        const effect = OngoingEffectLibrary.ignoreSpecificAspectPenalties(costAdjusterProps);
        return this.buildCostAdjusterAbilityProps(condition, title, effect);
    }

    private buildCostAdjusterGenericProperties() {
        return {
            cardTypeFilter: this.printedType,
            match: (card, adjusterSource) => card === adjusterSource
        };
    }

    private buildCostAdjusterAbilityProps(condition: (context: AbilityContext<this>) => boolean, title: string, ongoingEffect: IOngoingEffectGenerator): IConstantAbilityProps {
        const costAdjustAbilityProps: IConstantAbilityProps = {
            title,
            sourceZoneFilter: WildcardZoneName.Any,
            targetController: WildcardRelativePlayer.Any,
            condition,
            ongoingEffect
        };

        return costAdjustAbilityProps;
    }
}
