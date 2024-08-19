import { IActionAbilityProps } from '../../Interfaces';
import { CardActionAbility } from '../ability/CardActionAbility';
import PlayerOrCardAbility from '../ability/PlayerOrCardAbility';
import TriggeredAbility from '../ability/TriggeredAbility';
import { IConstantAbility } from '../ongoingEffect/IConstantAbility';
import OngoingEffectSource from '../ongoingEffect/OngoingEffectSource';
import type Player from '../Player';
import Contract from '../utils/Contract';
import Card from './Card';
import { CardType, EffectName, Location, Trait } from '../Constants';
import { PlayUnitAction } from '../../actions/PlayUnitAction';
import { InitiateAttackAction } from '../../actions/InitiateAttackAction';
import { checkConvertToEnum } from '../utils/EnumHelpers';

export type CardConstructor = new (...args: any[]) => NewCard;

export class NewCard extends OngoingEffectSource {
    public readonly title: string;

    public controller?: Player = null;

    protected override readonly id: string;
    protected readonly printedKeywords: Set<string>;   // TODO KEYWORDS: enum of keywords
    protected readonly printedTraits: Set<Trait>;
    protected readonly printedTypes: Set<CardType>;

    protected defaultActions: PlayerOrCardAbility[] = [];
    protected defaultController: Player;

    private _location: Location;

    /**
     * The union of the card's "Action Abilities" (i.e. abilities that enable an action, `SWU 7.2.1`)
     * and any other general card actions such as playing a card
     */
    public get actions() {
        return this.isBlank() ? []
            : this.defaultActions;
    }

    public get location() {
        return this._location;
    }

    public get types(): Set<CardType> {
        return this.printedTypes;
    }

    public constructor(
        public readonly owner: Player,
        private readonly cardData: any
    ) {
        super(owner.game);

        this.validateCardData(cardData);
        this.validateImplementationId(cardData);

        this.title = cardData.title;

        this.id = cardData.id;
        this.printedTraits = new Set(checkConvertToEnum(cardData.traits, Trait));
        this.printedTypes = new Set(checkConvertToEnum(cardData.types, CardType));

        this.defaultController = owner;
    }


    // **************************************** INITIALIZATION HELPERS ****************************************
    private validateCardData(cardData: any) {
        Contract.assertNotNullLike(cardData);
        Contract.assertNotNullLike(cardData.id);
        Contract.assertNotNullLike(cardData.title);
        Contract.assertNotNullLike(cardData.types);
        Contract.assertNotNullLike(cardData.traits);
        Contract.assertNotNullLike(cardData.aspects);
        Contract.assertNotNullLike(cardData.keywords);
        Contract.assertNotNullLike(cardData.unique);
    }

    /**
     * If this is a subclass implementation of a specific card, validate that it matches the provided card data
     */
    private validateImplementationId(cardData: any): void {
        const implementationId = this.getImplementationId();
        if (implementationId) {
            if (cardData.id !== implementationId.id || cardData.internalName !== implementationId.internalName) {
                throw new Error(
                    `Implementation { ${implementationId.id}, ${implementationId.internalName} } does not match provided card data { ${cardData.id}, ${cardData.internalName} }`
                );
            }
        }
    }

    /**
     * Subclass implementations for specific cards must override this method and provide the id
     * information for the specific card
     */
    protected getImplementationId(): null | { internalName: string, id: string } {
        return null;
    }

    // TODO THIS PR: remove this
    protected generateOriginalCard() {
        return new Card(this.owner, this.cardData);
    }

    protected unpackConstructorArgs(...args: any[]): [Player, any] {
        Contract.assertArraySize(args, 2);

        return [args[0] as Player, args[1]];
    }


    // ******************************************* CARD TYPE HELPERS *******************************************
    public isEvent(): boolean {
        return false;
    }

    public isUnit(): boolean {
        return false;
    }

    public isUpgrade(): boolean {
        return false;
    }

    public isBase(): boolean {
        return false;
    }

    public isLeader(): boolean {
        return false;
    }

    public isLeaderUnit(): boolean {
        return false;
    }

    public isNonLeaderUnit(): boolean {
        return false;
    }

    public isToken(): boolean {
        return false;
    }

    public hasSomeType(types: Set<CardType> | CardType | CardType[]): boolean {
        let typesToCheck: Set<CardType> | CardType[];

        if (!(types instanceof Set) && !(types instanceof Array)) {
            typesToCheck = [types];
        } else {
            typesToCheck = types;
        }

        for (const type of typesToCheck) {
            if (this.types.has(type)) {
                return true;
            }
        }
        return false;
    }

    public hasEveryType(types: Set<CardType> | CardType[]): boolean {
        let typesToCheck: Set<CardType> | CardType[];

        if (!(types instanceof Set) && !(types instanceof Array)) {
            typesToCheck = [types];
        } else {
            typesToCheck = types;
        }

        for (const type of typesToCheck) {
            if (!this.types.has(type)) {
                return false;
            }
        }
        return false;
    }


    // TODO KEYWORDS: replace 'string' throughout here with new enum type
    // ******************************************* KEYWORD HELPERS *******************************************
    public get keywords() {
        const keywords = this.printedKeywords;

        for (const gainedTrait of this.getEffectValues(EffectName.AddKeyword)) {
            keywords.add(gainedTrait);
        }
        for (const lostTrait of this.getEffectValues(EffectName.LoseKeyword)) {
            keywords.delete(lostTrait);
        }

        return keywords;
    }

    // TODO THIS PR: remove this
    public hasKeyword(keyword: string): boolean {
        const targetKeyword = keyword.toLowerCase();

        const addKeywordEffects = this.getEffectValues(EffectName.AddKeyword).filter(
            (effectValue: string) => effectValue === targetKeyword
        );
        const loseKeywordEffects = this.getEffectValues(EffectName.LoseKeyword).filter(
            (effectValue: string) => effectValue === targetKeyword
        );

        return addKeywordEffects.length > loseKeywordEffects.length;
    }

    // TODO THIS PR: remove this
    public hasPrintedKeyword(keyword: string) {
        return this.printedKeywords.has(keyword);
    }

    public hasSomeKeyword(keywords: Set<string> | string | string[]): boolean {
        let keywordsToCheck: Set<string> | string[];

        if (!(keywords instanceof Set) && !(keywords instanceof Array)) {
            keywordsToCheck = [keywords];
        } else {
            keywordsToCheck = keywords;
        }

        const cardKeywords = this.keywords;
        for (const keyword of keywordsToCheck) {
            if (cardKeywords.has(keyword)) {
                return true;
            }
        }
        return false;
    }

    public hasEveryKeyword(keywords: Set<string> | string[]): boolean {
        let keywordsToCheck: Set<string> | string[];

        if (!(keywords instanceof Set) && !(keywords instanceof Array)) {
            keywordsToCheck = [keywords];
        } else {
            keywordsToCheck = keywords;
        }

        const cardKeywords = this.keywords;
        for (const keyword of keywordsToCheck) {
            if (!cardKeywords.has(keyword)) {
                return false;
            }
        }
        return false;
    }


    // ******************************************* TRAIT HELPERS *******************************************
    public get traits() {
        const traits = new Set(
            this.getEffectValues(EffectName.Blank).some((blankTraits: boolean) => blankTraits)
                ? []
                : this.printedTraits
        );

        for (const gainedTrait of this.getEffectValues(EffectName.AddTrait)) {
            traits.add(gainedTrait);
        }
        for (const lostTrait of this.getEffectValues(EffectName.LoseTrait)) {
            traits.delete(lostTrait);
        }

        return traits;
    }

    // TODO THIS PR: remove this
    public hasTrait(trait: Trait): boolean {
        return this.hasSomeTrait(trait);
    }

    public hasSomeTrait(traits: Set<Trait> | Trait | Trait[]): boolean {
        let traitsToCheck: Set<Trait> | Trait[];

        if (!(traits instanceof Set) && !(traits instanceof Array)) {
            traitsToCheck = [traits];
        } else {
            traitsToCheck = traits;
        }

        const cardTraits = this.traits;
        for (const trait of traitsToCheck) {
            if (cardTraits.has(trait)) {
                return true;
            }
        }
        return false;
    }

    public hasEveryTrait(traits: Set<Trait> | Trait[]): boolean {
        let traitsToCheck: Set<Trait> | Trait[];

        if (!(traits instanceof Set) && !(traits instanceof Array)) {
            traitsToCheck = [traits];
        } else {
            traitsToCheck = traits;
        }

        const cardTraits = this.traits;
        for (const trait of traitsToCheck) {
            if (!cardTraits.has(trait)) {
                return false;
            }
        }
        return false;
    }


    // *************************************** EFFECT HELPERS ***************************************
    public isBlank(): boolean {
        return this.anyEffect(EffectName.Blank);
    }


    // TODO UPGRADES: this whole section
    // *************************************** UPGRADE HELPERS ***************************************
    // attachmentConditions(properties: AttachmentConditionProps): void {
    //     const effects = [];
    //     if (properties.limit) {
    //         effects.push(Effects.attachmentLimit(properties.limit));
    //     }
    //     if (properties.myControl) {
    //         effects.push(Effects.attachmentMyControlOnly());
    //     }
    //     if (properties.opponentControlOnly) {
    //         effects.push(Effects.attachmentOpponentControlOnly());
    //     }
    //     if (properties.unique) {
    //         effects.push(Effects.attachmentUniqueRestriction());
    //     }
    //     if (properties.faction) {
    //         const factions = Array.isArray(properties.faction) ? properties.faction : [properties.faction];
    //         effects.push(Effects.attachmentFactionRestriction(factions));
    //     }
    //     if (properties.trait) {
    //         const traits = Array.isArray(properties.trait) ? properties.trait : [properties.trait];
    //         effects.push(Effects.attachmentTraitRestriction(traits));
    //     }
    //     if (properties.limitTrait) {
    //         const traitLimits = Array.isArray(properties.limitTrait) ? properties.limitTrait : [properties.limitTrait];
    //         traitLimits.forEach((traitLimit) => {
    //             const trait = Object.keys(traitLimit)[0];
    //             effects.push(Effects.attachmentRestrictTraitAmount({ [trait]: traitLimit[trait] }));
    //         });
    //     }
    //     if (properties.cardCondition) {
    //         effects.push(Effects.attachmentCardCondition(properties.cardCondition));
    //     }
    //     if (effects.length > 0) {
    //         this.persistentEffect({
    //             location: Location.Any,
    //             effect: effects
    //         });
    //     }
    // }

    // ******************************************* MISC *******************************************
    // this is here to be overridden, we can't use abstract bc it doesn't work with mixins sadly
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    protected initializeForCurrentLocation() {
    }

    // isInPlay(): boolean {
    //     if (this.isFacedown()) {
    //         return false;
    //     }
    //     if ([CardType.Holding, CardType.Province, CardType.Stronghold].includes(this.type)) {
    //         return this.isInProvince();
    //     }
    //     return this.location === Location.PlayArea;
    // }

    // applyAnyLocationPersistentEffects(): void {
    //     for (const effect of this.persistentEffects) {
    //         if (effect.location === Location.Any) {
    //             effect.registeredEffects = this.addEffectToEngine(effect);
    //         }
    //     }
    // }
}