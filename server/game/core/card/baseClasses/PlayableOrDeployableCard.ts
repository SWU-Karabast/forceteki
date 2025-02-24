import type { IConstantAbilityProps, IOngoingEffectGenerator } from '../../../Interfaces';
import OngoingEffectLibrary from '../../../ongoingEffects/OngoingEffectLibrary';
import type { AbilityContext } from '../../ability/AbilityContext';
import * as KeywordHelpers from '../../ability/KeywordHelpers';
import { KeywordWithNumericValue } from '../../ability/KeywordInstance';
import type { IPilotingCardActionProperties, IPlayCardActionProperties, IPlayCardActionPropertiesBase, ISmuggleCardActionProperties, PlayCardAction } from '../../ability/PlayCardAction';
import type PlayerOrCardAbility from '../../ability/PlayerOrCardAbility';
import type { Aspect } from '../../Constants';
import { CardType, EffectName, KeywordName, PlayType, WildcardRelativePlayer, WildcardZoneName, ZoneName } from '../../Constants';
import type { ICostAdjusterProperties, IIgnoreAllAspectsCostAdjusterProperties, IIgnoreSpecificAspectsCostAdjusterProperties, IIncreaseOrDecreaseCostAdjusterProperties } from '../../cost/CostAdjuster';
import { CostAdjustType } from '../../cost/CostAdjuster';
import type Player from '../../Player';
import * as Contract from '../../utils/Contract';
import { Card } from '../Card';
import type { ICardWithCostProperty } from '../propertyMixins/Cost';
import type { IUnitCard } from '../propertyMixins/UnitProperties';

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

/**
 * Subclass of {@link Card} that represents shared features of all non-base cards.
 * Implements the basic pieces for a card to be able to be played (non-leader) or deployed (leader),
 * as well as exhausted status.
 */
export class PlayableOrDeployableCard extends Card implements IPlayableOrDeployableCard {
    private _exhausted?: boolean = null;
    protected _parentCard?: IUnitCard = null;

    protected attachCondition: (card: Card) => boolean;

    public get exhausted(): boolean {
        this.assertPropertyEnabledForZone(this._exhausted, 'exhausted');
        return this._exhausted;
    }

    public set exhausted(val: boolean) {
        this.assertPropertyEnabledForZone(this._exhausted, 'exhausted');
        this._exhausted = val;
    }

    /** The card that this card is underneath */
    public get parentCard(): IUnitCard {
        Contract.assertNotNullLike(this._parentCard);
        // TODO: move IsInPlay to be usable here
        // Contract.assertTrue(this.isInPlay());

        return this._parentCard;
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
            let playActions = this.buildPlayCardActions(PlayType.PlayFromHand, propertyOverrides);
            // TODO: update this once we suppport Piloting from discard
            if (this.hasSomeKeyword(KeywordName.Piloting)) {
                playActions = playActions.concat(this.buildPlayCardActions(PlayType.Piloting, propertyOverrides));
            }
            return playActions;
        }

        if (this.zoneName === ZoneName.Resource && this.hasSomeKeyword(KeywordName.Smuggle)) {
            return this.buildPlayCardActions(PlayType.Smuggle, propertyOverrides);
        }

        if (this.zoneName === ZoneName.Discard && this.hasOngoingEffect(EffectName.CanPlayFromDiscard)) {
            return this.buildPlayCardActions(PlayType.PlayFromOutOfPlay, propertyOverrides);
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
        if (playType === PlayType.Piloting) {
            if (this.hasSomeKeyword(KeywordName.Piloting)) {
                defaultPlayAction = this.buildCheapestPilotingAction(propertyOverrides);
            }
        } else if (playType === PlayType.Smuggle) {
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

    public assertIsUpgrade(): void {
        Contract.assertTrue(this.isUpgrade());
        Contract.assertNotNullLike(this.parentCard);
    }

    public attachTo(newParentCard: IUnitCard, newController?: Player) {
        Contract.assertTrue(newParentCard.isUnit());

        // this assert needed for type narrowing or else the moveTo fails
        Contract.assertTrue(newParentCard.zoneName === ZoneName.SpaceArena || newParentCard.zoneName === ZoneName.GroundArena);

        if (this._parentCard) {
            this.unattach();
        }

        if (newController && newController !== this.controller) {
            this.takeControl(newController, newParentCard.zoneName);
        } else {
            this.moveTo(newParentCard.zoneName);
        }

        newParentCard.attachUpgrade(this);
        this._parentCard = newParentCard;
    }

    public isAttached(): boolean {
        this.assertIsUpgrade();
        return !!this._parentCard;
    }

    public unattach() {
        Contract.assertNotNullLike(this._parentCard, 'Attempting to unattach upgrade when already unattached');
        this.assertIsUpgrade();

        this.parentCard.unattachUpgrade(this);
        this._parentCard = null;
    }

    /**
     * Checks whether the passed card meets any attachment restrictions for this card. Upgrade
     * implementations must override this if they have specific attachment conditions.
     */
    public canAttach(targetCard: Card, controller: Player = this.controller): boolean {
        if (!targetCard.isUnit() || (this.attachCondition && !this.attachCondition(targetCard))) {
            return false;
        }

        return true;
    }

    // TODO: Simplify this if it turns out there are no alternative ways to gain a Piloting cost
    protected buildCheapestPilotingAction(propertyOverrides: IPlayCardActionOverrides = null) {
        Contract.assertTrue(this.hasSomeKeyword(KeywordName.Piloting));

        // find all Piloting keywords, filtering out any with additional ability costs as those will be implemented manually
        const pilotingKeywords = this.getKeywordsWithCostValues(KeywordName.Piloting)
            .filter((keyword) => !keyword.additionalCosts);

        const pilotingActions = pilotingKeywords.map((pilotingKeyword) => {
            const pilotingActionProps: IPilotingCardActionProperties = {
                ...propertyOverrides,
                playType: PlayType.Piloting,
                alternatePlayActionResourceCost: pilotingKeyword.cost,
                alternatePlayActionAspects: pilotingKeyword.aspects
            };

            return this.buildPlayCardAction(pilotingActionProps);
        });

        return KeywordHelpers.getCheapestPlayAction(PlayType.Piloting, pilotingActions);
    }

    protected buildCheapestSmuggleAction(propertyOverrides: IPlayCardActionOverrides = null) {
        Contract.assertTrue(this.hasSomeKeyword(KeywordName.Smuggle));

        // find all Smuggle keywords, filtering out any with additional ability costs as those will be implemented manually (e.g. First Light)
        const smuggleKeywords = this.getKeywordsWithCostValues(KeywordName.Smuggle)
            .filter((keyword) => !keyword.additionalCosts);

        const smuggleActions = smuggleKeywords.map((smuggleKeyword) => {
            const smuggleActionProps: ISmuggleCardActionProperties = {
                ...propertyOverrides,
                playType: PlayType.Smuggle,
                alternatePlayActionResourceCost: smuggleKeyword.cost,
                alternatePlayActionAspects: smuggleKeyword.aspects
            };

            return this.buildPlayCardAction(smuggleActionProps);
        });

        return KeywordHelpers.getCheapestPlayAction(PlayType.Smuggle, smuggleActions);
    }

    // can't do abstract due to mixins
    public buildPlayCardAction(properties: IPlayCardActionProperties): PlayCardAction {
        Contract.fail('This method should be overridden by the subclass');
    }

    public exhaust() {
        this.assertPropertyEnabledForZone(this._exhausted, 'exhausted');
        this._exhausted = true;
    }

    public ready() {
        this.assertPropertyEnabledForZone(this._exhausted, 'exhausted');
        this._exhausted = false;
    }

    public override canBeExhausted(): this is IPlayableOrDeployableCard {
        return true;
    }

    public override getSummary(activePlayer: Player) {
        return { ...super.getSummary(activePlayer),
            exhausted: this._exhausted,
            parentCardId: this._parentCard ? this._parentCard.uuid : null };
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
