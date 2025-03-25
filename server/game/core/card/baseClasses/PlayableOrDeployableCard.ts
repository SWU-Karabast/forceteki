import type { IConstantAbilityProps, IOngoingEffectGenerator } from '../../../Interfaces';
import OngoingEffectLibrary from '../../../ongoingEffects/OngoingEffectLibrary';
import type { AbilityContext } from '../../ability/AbilityContext';
import * as KeywordHelpers from '../../ability/KeywordHelpers';
import { KeywordWithNumericValue } from '../../ability/KeywordInstance';
import type { IAlternatePlayActionProperties, IPlayCardActionProperties, IPlayCardActionPropertiesBase, PlayCardAction } from '../../ability/PlayCardAction';
import type PlayerOrCardAbility from '../../ability/PlayerOrCardAbility';
import type { Aspect } from '../../Constants';
import { CardType, EffectName, KeywordName, PlayType, WildcardRelativePlayer, WildcardZoneName, ZoneName } from '../../Constants';
import type { ICostAdjusterProperties, IIgnoreAllAspectsCostAdjusterProperties, IIgnoreSpecificAspectsCostAdjusterProperties, IIncreaseOrDecreaseCostAdjusterProperties } from '../../cost/CostAdjuster';
import { CostAdjustType } from '../../cost/CostAdjuster';
import type Player from '../../Player';
import * as Contract from '../../utils/Contract';
import * as Helpers from '../../utils/Helpers';
import type { ICardState } from '../Card';
import { Card } from '../Card';
import type { ICardWithCostProperty } from '../propertyMixins/Cost';

export type IPlayCardActionOverrides = Omit<IPlayCardActionPropertiesBase, 'playType'>;

// required for mixins to be based on this class
export type PlayableOrDeployableCardConstructor<T extends IPlayableOrDeployableCardState = IPlayableOrDeployableCardState> = new (...args: any[]) => PlayableOrDeployableCard<T>;

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
    ignoredAspect: Aspect;
    condition?: (context: AbilityContext<TSource>) => boolean;
}

export interface ICardWithExhaustProperty extends Card {
    get exhausted(): boolean;
    set exhausted(value: boolean);
    exhaust();
    ready();
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IPlayableOrDeployableCard extends ICardWithExhaustProperty {}

export interface IPlayableCard extends IPlayableOrDeployableCard, ICardWithCostProperty {
    getPlayCardActions(propertyOverrides?: IPlayCardActionOverrides): PlayCardAction[];
    getPlayCardFromOutOfPlayActions(propertyOverrides?: IPlayCardActionOverrides);
    buildPlayCardAction(properties: IPlayCardActionProperties): PlayCardAction;
}

export interface IPlayableOrDeployableCardState extends ICardState {
    exhausted: boolean | null;
}

/**
 * Subclass of {@link Card} that represents shared features of all non-base cards.
 * Implements the basic pieces for a card to be able to be played (non-leader) or deployed (leader),
 * as well as exhausted status.
 */
export class PlayableOrDeployableCard<T extends IPlayableOrDeployableCardState = IPlayableOrDeployableCardState> extends Card<T> {
    public get exhausted(): boolean {
        this.assertPropertyEnabledForZone(this.state.exhausted, 'exhausted');
        return this.state.exhausted;
    }

    public set exhausted(val: boolean) {
        this.assertPropertyEnabledForZone(this.state.exhausted, 'exhausted');
        this.state.exhausted = val;
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
        let playCardActions: PlayCardAction[] = [];

        if (this.zoneName === ZoneName.Hand) {
            playCardActions = playCardActions.concat(this.buildPlayCardActions(PlayType.PlayFromHand, propertyOverrides));
            if (this.hasSomeKeyword(KeywordName.Piloting)) {
                playCardActions = playCardActions.concat(this.buildPlayCardActions(PlayType.Piloting, propertyOverrides));
            }
        }

        if (this.zoneName === ZoneName.Resource && this.hasSomeKeyword(KeywordName.Smuggle)) {
            playCardActions = this.buildPlayCardActions(PlayType.Smuggle, propertyOverrides);
        }

        if (this.zoneName === ZoneName.Discard) {
            if (this.hasOngoingEffect(EffectName.CanPlayFromDiscard)) {
                playCardActions = this.buildPlayCardActions(PlayType.PlayFromOutOfPlay, propertyOverrides);
                if (this.hasSomeKeyword(KeywordName.Piloting)) {
                    playCardActions = playCardActions.concat(this.buildPlayCardActions(PlayType.Piloting, propertyOverrides));
                }
            }
        }

        return playCardActions;
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

        let playCardActions = this.buildPlayCardActions(PlayType.PlayFromOutOfPlay, propertyOverrides);

        if (this.hasSomeKeyword(KeywordName.Piloting)) {
            playCardActions = playCardActions.concat(this.buildPlayCardActions(PlayType.Piloting, propertyOverrides));
        }

        return playCardActions;
    }

    protected buildPlayCardActions(playType: PlayType = PlayType.PlayFromHand, propertyOverrides: IPlayCardActionOverrides = null): PlayCardAction[] {
        // add this card's Exploit amount onto any that come from the property overrides
        const exploitValue = this.getNumericKeywordSum(KeywordName.Exploit);
        const propertyOverridesWithExploit = Helpers.mergeNumericProperty(propertyOverrides, 'exploitValue', exploitValue);

        let defaultPlayAction: PlayCardAction = null;
        if (playType === PlayType.Piloting) {
            if (this.hasSomeKeyword(KeywordName.Piloting)) {
                defaultPlayAction = this.buildCheapestAlternatePlayAction(propertyOverridesWithExploit, KeywordName.Piloting, playType);
            }
        } else if (playType === PlayType.Smuggle) {
            if (this.hasSomeKeyword(KeywordName.Smuggle)) {
                defaultPlayAction = this.buildCheapestAlternatePlayAction(propertyOverridesWithExploit, KeywordName.Smuggle, playType);
            }
        } else {
            defaultPlayAction = this.buildPlayCardAction({ ...propertyOverridesWithExploit, playType });
        }

        // if there's not a basic play action available for the requested play type, return nothing
        if (defaultPlayAction == null) {
            return [];
        }

        const actions: PlayCardAction[] = [defaultPlayAction];

        return actions;
    }

    /** This will calculate the cheapest possible play action for alternate play costs such as Smuggle or Piloting */
    protected buildCheapestAlternatePlayAction(propertyOverrides: IPlayCardActionOverrides = null, keyword: KeywordName, playType: PlayType) {
        Contract.assertTrue(this.hasSomeKeyword(keyword));

        // find all keywords, filtering out any with additional ability costs as those will be implemented manually (e.g. First Light)
        const keywords = this.getKeywordsWithCostValues(keyword)
            .filter((keyword) => !keyword.additionalCosts);

        const alternatePlayActions = keywords.map((keywordWithCostValue) => {
            const alternateActionProps: IAlternatePlayActionProperties = {
                ...propertyOverrides,
                playType: playType,
                alternatePlayActionResourceCost: keywordWithCostValue.cost,
                alternatePlayActionAspects: keywordWithCostValue.aspects
            };

            return this.buildPlayCardAction(alternateActionProps);
        });

        return KeywordHelpers.getCheapestPlayAction(playType, alternatePlayActions);
    }

    // can't do abstract due to mixins
    public buildPlayCardAction(properties: IPlayCardActionProperties): PlayCardAction {
        Contract.fail('This method should be overridden by the subclass');
    }

    public exhaust() {
        this.assertPropertyEnabledForZone(this.state.exhausted, 'exhausted');
        this.state.exhausted = true;
    }

    public ready() {
        this.assertPropertyEnabledForZone(this.state.exhausted, 'exhausted');
        this.state.exhausted = false;
    }

    public override canBeExhausted(): this is IPlayableOrDeployableCard {
        return true;
    }

    public override getSummary(activePlayer: Player) {
        return { ...super.getSummary(activePlayer),
            exhausted: this.state.exhausted };
    }

    protected setExhaustEnabled(enabledStatus: boolean) {
        this.state.exhausted = enabledStatus ? true : null;
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

        this.controller = newController;

        const moveDestination = moveTo || this.zone.name;

        Contract.assertTrue(
            moveDestination === ZoneName.SpaceArena || moveDestination === ZoneName.GroundArena || moveDestination === ZoneName.Resource,
            `Attempting to take control of card ${this.internalName} for player ${newController.name} in invalid zone: ${moveDestination}`
        );

        // if we're changing controller and staying in play, tell the arena to update our controller
        if (this.zone.name === ZoneName.GroundArena || this.zone.name === ZoneName.SpaceArena) {
            // if we're staying in the same arena, no move needed
            if (moveDestination === this.zoneName) {
                // register this transition with the engine so it can do uniqueness check if needed
                this.registerMove(this.zone.name);
            } else {
                this.moveTo(moveDestination);
            }
        } else {
            this.moveTo(moveDestination);
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
        const { title, ignoredAspect, condition, ...otherProps } = properties;

        const costAdjusterProps: ICostAdjusterProperties = {
            ...this.buildCostAdjusterGenericProperties(),
            costAdjustType: CostAdjustType.IgnoreSpecificAspects,
            ignoredAspect: ignoredAspect,
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
