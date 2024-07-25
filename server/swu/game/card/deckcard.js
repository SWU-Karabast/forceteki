const _ = require('underscore');

const BaseCard = require('./basecard');
const StatModifier = require('../StatModifier');

const { Locations, EffectNames, CardTypes, PlayTypes, EventNames, isArena, StatType } = require('../Constants.js');
const { GameModes } = require('../../GameModes.js');
// const { EventRegistrar } = require('./EventRegistrar');

// TODO: rename back to DrawCard
class DeckCard extends BaseCard {
    // fromOutOfPlaySource ?: Array < DeckCard >;
    menu = [
        { command: 'exhaust', text: 'Exhaust/Ready' },
        { command: 'control', text: 'Give control' }
    ];

    constructor(owner, cardData) {
        super(owner, cardData);

        this.defaultController = owner;
        this.parent = null;

        this.printedPower = this.getPrintedSkill('power');
        this.printedHp = this.getPrintedSkill('health');
        this.printedCost = parseInt(this.cardData.cost);

        if (!_.isNumber(this.printedCost) || isNaN(this.printedCost)) {
            if (this.type === CardTypes.Event) {
                this.printedCost = 0;
            } else {
                this.printedCost = null;
            }
        }
        this.printedGlory = parseInt(cardData.glory);
        this.printedStrengthBonus = parseInt(cardData.strength_bonus);
        this.fate = 0;
        this.exhausted = false;
        this.covert = false;
        this.isConflict = cardData.side === 'conflict';
        this.isDynasty = cardData.side === 'dynasty';
        this.allowDuplicatesOfAttachment = !!cardData.attachment_allow_duplicates;
        this.defaultArena = cardData.arena + " arena";  // TODO: figure out how this is actually stored and parse it to enum

        // if (cardData.type === CardTypes.Character) {
        //     this.abilities.reactions.push(new CourtesyAbility(this.game, this));
        //     this.abilities.reactions.push(new PrideAbility(this.game, this));
        //     this.abilities.reactions.push(new SincerityAbility(this.game, this));
        // }
        // if (cardData.type === CardTypes.Attachment) {
        //     this.abilities.reactions.push(new CourtesyAbility(this.game, this));
        //     this.abilities.reactions.push(new SincerityAbility(this.game, this));
        // }
        // if (cardData.type === CardTypes.Event && this.hasEphemeral()) {
        //     this.eventRegistrarForEphemeral = new EventRegistrar(this.game, this);
        //     this.eventRegistrarForEphemeral.register([{ [EventNames.OnCardPlayed]: 'handleEphemeral' }]);
        // }
        // if (this.isDynasty) {
        //     this.abilities.reactions.push(new RallyAbility(this.game, this));
        // }
    }

    handleEphemeral(event) {
        if (event.card === this) {
            if (this.location !== Locations.RemovedFromGame) {
                this.owner.moveCard(this, Locations.RemovedFromGame);
            }
            this.fromOutOfPlaySource = undefined;
        }
    }

    getPrintedStat(type) {
        if (type === StatType.Power) {
            return this.cardData.damage === null || this.cardData.damage === undefined
                ? NaN
                : isNaN(parseInt(this.cardData.power))
                ? 0
                : parseInt(this.cardData.power);
        } else if (type === StatType.Hp) {
            return this.cardData.political === null || this.cardData.political === undefined
                ? NaN
                : isNaN(parseInt(this.cardData.political))
                ? 0
                : parseInt(this.cardData.political);
        }
    }

    isLimited() {
        return this.hasKeyword('limited') || this.hasPrintedKeyword('limited');
    }

    isRestricted() {
        return this.hasKeyword('restricted');
    }

    isAncestral() {
        return this.hasKeyword('ancestral');
    }

    isCovert() {
        return this.hasKeyword('covert');
    }

    hasSincerity() {
        return this.hasKeyword('sincerity');
    }

    hasPride() {
        return this.hasKeyword('pride');
    }

    hasCourtesy() {
        return this.hasKeyword('courtesy');
    }

    hasEphemeral() {
        return this.hasPrintedKeyword('ephemeral');
    }

    hasPeaceful() {
        return this.hasPrintedKeyword('peaceful');
    }

    hasNoDuels() {
        return this.hasKeyword('no duels');
    }

    isDire() {
        return this.getFate() === 0;
    }

    hasRally() {
        //Facedown cards are out of play and their keywords don't update until after the reveal reaction window is done, so we need to check for the printed keyword
        return this.hasKeyword('rally') || (!this.isBlank() && this.hasPrintedKeyword('rally'));
    }

    getCost() {
        let copyEffect = this.mostRecentEffect(EffectNames.CopyCharacter);
        return copyEffect ? copyEffect.printedCost : this.printedCost;
    }

    costLessThan(num) {
        let cost = this.printedCost;
        return num && (cost || cost === 0) && cost < num;
    }

    anotherUniqueInPlay(player) {
        return (
            this.isUnique() &&
            this.game.allCards.any(
                (card) =>
                    card.isInPlay() &&
                    card.printedName === this.printedTitle &&
                    card !== this &&
                    (card.owner === player || card.controller === player || card.owner === this.owner)
            )
        );
    }

    anotherUniqueInPlayControlledBy(player) {
        return (
            this.isUnique() &&
            this.game.allCards.any(
                (card) =>
                    card.isInPlay() &&
                    card.printedName === this.printedTitle &&
                    card !== this &&
                    card.controller === player
            )
        );
    }

    createSnapshot() {
        let clone = new DeckCard(this.owner, this.cardData);

        // clone.upgrades = _(this.upgrades.map((attachment) => attachment.createSnapshot()));
        clone.childCards = this.childCards.map((card) => card.createSnapshot());
        clone.effects = _.clone(this.effects);
        clone.controller = this.controller;
        clone.exhausted = this.exhausted;
        // clone.statusTokens = [...this.statusTokens];
        clone.location = this.location;
        clone.parent = this.parent;
        clone.aspects = _.clone(this.aspects);
        // clone.fate = this.fate;
        // clone.inConflict = this.inConflict;
        clone.traits = Array.from(this.getTraits());
        clone.uuid = this.uuid;
        return clone;
    }

    // hasDash(type = '') {
    //     if (type === 'glory' || this.printedType !== CardTypes.Character) {
    //         return false;
    //     }

    //     let baseSkillModifiers = this.getBaseSkillModifiers();

    //     if (type === 'military') {
    //         return isNaN(baseSkillModifiers.baseMilitarySkill);
    //     } else if (type === 'political') {
    //         return isNaN(baseSkillModifiers.basePoliticalSkill);
    //     }

    //     return isNaN(baseSkillModifiers.baseMilitarySkill) || isNaN(baseSkillModifiers.basePoliticalSkill);
    // }

    // getContributionToConflict(type) {
    //     let skillFunction = this.mostRecentEffect(EffectNames.ChangeContributionFunction);
    //     if (skillFunction) {
    //         return skillFunction(this);
    //     }
    //     return this.getSkill(type);
    // }

    /**
     * Direct the stat query to the correct sub function.
     * @param  {string} type - The type of the stat; power or hp
     * @return {number} The chosen stat value
     */
    getStat(type) {
        switch (type) {
            case StatType.Power:
                return this.getPower();
            case StatType.Hp:
                return this.getHp();
        }
    }

    /**
     * Apply any modifiers that explicitly say they change the base skill value
     */ 
    getBaseStatModifiers() {
        const baseModifierEffects = [
            EffectNames.CopyCharacter,
            EffectNames.CalculatePrintedPower,
            EffectNames.SetBasePower,
        ];

        let baseEffects = this.getRawEffects().filter((effect) => baseModifierEffects.includes(effect.type));
        let basePowerModifiers = [StatModifier.fromCard(this.printedPower, this, 'Printed power', false)];
        let baseHpModifiers = [StatModifier.fromCard(this.printedHp, this, 'Printed hp', false)];
        let basePower = this.printedPower;
        let baseHp = this.printedHp;

        baseEffects.forEach((effect) => {
            switch (effect.type) {
                // this case is for cards that don't have a default printed power but it is instead calculated
                case EffectNames.CalculatePrintedPower: {
                    let damageFunction = effect.getValue(this);
                    let calculatedDamageValue = damageFunction(this);
                    basePower = calculatedDamageValue;
                    basePowerModifiers = basePowerModifiers.filter(
                        (mod) => !mod.name.startsWith('Printed power')
                    );
                    basePowerModifiers.push(
                        StatModifier.fromEffect(
                            basePower,
                            effect,
                            false,
                            `Printed power due to ${StatModifier.getEffectName(effect)}`
                        )
                    );
                    break;
                }
                case EffectNames.CopyCharacter: {
                    let copiedCard = effect.getValue(this);
                    basePower = copiedCard.getPrintedStat(StatType.Power);
                    baseHp = copiedCard.getPrintedStat(StatType.Hp);
                    // replace existing base or copied modifier
                    basePowerModifiers = basePowerModifiers.filter(
                        (mod) => !mod.name.startsWith('Printed stat')
                    );
                    baseHpModifiers = baseHpModifiers.filter(
                        (mod) => !mod.name.startsWith('Printed stat')
                    );
                    basePowerModifiers.push(
                        StatModifier.fromEffect(
                            basePower,
                            effect,
                            false,
                            `Printed skill from ${copiedCard.name} due to ${StatModifier.getEffectName(effect)}`
                        )
                    );
                    baseHpModifiers.push(
                        StatModifier.fromEffect(
                            baseHp,
                            effect,
                            false,
                            `Printed skill from ${copiedCard.name} due to ${StatModifier.getEffectName(effect)}`
                        )
                    );
                    break;
                }
                case EffectNames.SetBasePower:
                    basePower = effect.getValue(this);
                    basePowerModifiers.push(
                        StatModifier.fromEffect(
                            basePower,
                            effect,
                            true,
                            `Base power set by ${StatModifier.getEffectName(effect)}`
                        )
                    );
                    break;
            }
        });

        let overridingPowerModifiers = basePowerModifiers.filter((mod) => mod.overrides);
        if (overridingPowerModifiers.length > 0) {
            let lastModifier = _.last(overridingPowerModifiers);
            basePowerModifiers = [lastModifier];
            basePower = lastModifier.amount;
        }
        let overridingHpModifiers = baseHpModifiers.filter((mod) => mod.overrides);
        if (overridingHpModifiers.length > 0) {
            let lastModifier = _.last(overridingHpModifiers);
            baseHpModifiers = [lastModifier];
            baseHp = lastModifier.amount;
        }

        return {
            basePowerModifiers: basePowerModifiers,
            basePower: basePower,
            baseHpModifiers: baseHpModifiers,
            BaseHp: baseHp
        };
    }

    getStatusTokenSkill() {
        let modifiers = this.getStatusTokenModifiers();
        let skill = modifiers.reduce((total, modifier) => total + modifier.amount, 0);
        if (isNaN(skill)) {
            return 0;
        }
        return skill;
    }

    // getStatusTokenModifiers() {
    //     let modifiers = [];
    //     let modifierEffects = this.getRawEffects().filter((effect) => effect.type === EffectNames.ModifyBothSkills);

    //     // skill modifiers
    //     modifierEffects.forEach((modifierEffect) => {
    //         const value = modifierEffect.getValue(this);
    //         modifiers.push(StatModifier.fromEffect(value, modifierEffect));
    //     });
    //     modifiers = modifiers.filter((modifier) => modifier.type === 'token');

    //     // adjust honor status effects
    //     this.adjustHonorStatusModifiers(modifiers);
    //     return modifiers;
    // }

    // getMilitaryModifiers(exclusions) {
    //     let baseSkillModifiers = this.getBaseSkillModifiers();
    //     if (isNaN(baseSkillModifiers.baseMilitarySkill)) {
    //         return baseSkillModifiers.baseMilitaryModifiers;
    //     }

    //     if (!exclusions) {
    //         exclusions = [];
    //     }

    //     let rawEffects;
    //     if (typeof exclusions === 'function') {
    //         rawEffects = this.getRawEffects().filter((effect) => !exclusions(effect));
    //     } else {
    //         rawEffects = this.getRawEffects().filter((effect) => !exclusions.includes(effect.type));
    //     }

    //     // set effects
    //     let setEffects = rawEffects.filter(
    //         (effect) => effect.type === EffectNames.SetMilitarySkill || effect.type === EffectNames.SetDash
    //     );
    //     if (setEffects.length > 0) {
    //         let latestSetEffect = _.last(setEffects);
    //         let setAmount = latestSetEffect.type === EffectNames.SetDash ? undefined : latestSetEffect.getValue(this);
    //         return [
    //             StatModifier.fromEffect(
    //                 setAmount,
    //                 latestSetEffect,
    //                 true,
    //                 `Set by ${StatModifier.getEffectName(latestSetEffect)}`
    //             )
    //         ];
    //     }

    //     let modifiers = baseSkillModifiers.baseMilitaryModifiers;

    //     // skill modifiers
    //     let modifierEffects = rawEffects.filter(
    //         (effect) =>
    //             effect.type === EffectNames.AttachmentMilitarySkillModifier ||
    //             effect.type === EffectNames.ModifyMilitarySkill ||
    //             effect.type === EffectNames.ModifyBothSkills
    //     );
    //     modifierEffects.forEach((modifierEffect) => {
    //         const value = modifierEffect.getValue(this);
    //         modifiers.push(StatModifier.fromEffect(value, modifierEffect));
    //     });

    //     // adjust honor status effects
    //     this.adjustHonorStatusModifiers(modifiers);

    //     // multipliers
    //     let multiplierEffects = rawEffects.filter(
    //         (effect) => effect.type === EffectNames.ModifyMilitarySkillMultiplier
    //     );
    //     multiplierEffects.forEach((multiplierEffect) => {
    //         let multiplier = multiplierEffect.getValue(this);
    //         let currentTotal = modifiers.reduce((total, modifier) => total + modifier.amount, 0);
    //         let amount = (multiplier - 1) * currentTotal;
    //         modifiers.push(StatModifier.fromEffect(amount, multiplierEffect));
    //     });

    //     return modifiers;
    // }

    // getPoliticalModifiers(exclusions) {
    //     let baseSkillModifiers = this.getBaseSkillModifiers();
    //     if (isNaN(baseSkillModifiers.basePoliticalSkill)) {
    //         return baseSkillModifiers.basePoliticalModifiers;
    //     }

    //     if (!exclusions) {
    //         exclusions = [];
    //     }

    //     let rawEffects;
    //     if (typeof exclusions === 'function') {
    //         rawEffects = this.getRawEffects().filter((effect) => !exclusions(effect));
    //     } else {
    //         rawEffects = this.getRawEffects().filter((effect) => !exclusions.includes(effect.type));
    //     }

    //     // set effects
    //     let setEffects = rawEffects.filter((effect) => effect.type === EffectNames.SetPoliticalSkill);
    //     if (setEffects.length > 0) {
    //         let latestSetEffect = _.last(setEffects);
    //         let setAmount = latestSetEffect.getValue(this);
    //         return [
    //             StatModifier.fromEffect(
    //                 setAmount,
    //                 latestSetEffect,
    //                 true,
    //                 `Set by ${StatModifier.getEffectName(latestSetEffect)}`
    //             )
    //         ];
    //     }

    //     let modifiers = baseSkillModifiers.basePoliticalModifiers;

    //     // skill modifiers
    //     let modifierEffects = rawEffects.filter(
    //         (effect) =>
    //             effect.type === EffectNames.AttachmentPoliticalSkillModifier ||
    //             effect.type === EffectNames.ModifyPoliticalSkill ||
    //             effect.type === EffectNames.ModifyBothSkills
    //     );
    //     modifierEffects.forEach((modifierEffect) => {
    //         const value = modifierEffect.getValue(this);
    //         modifiers.push(StatModifier.fromEffect(value, modifierEffect));
    //     });

    //     // adjust honor status effects
    //     this.adjustHonorStatusModifiers(modifiers);

    //     // multipliers
    //     let multiplierEffects = rawEffects.filter(
    //         (effect) => effect.type === EffectNames.ModifyPoliticalSkillMultiplier
    //     );
    //     multiplierEffects.forEach((multiplierEffect) => {
    //         let multiplier = multiplierEffect.getValue(this);
    //         let currentTotal = modifiers.reduce((total, modifier) => total + modifier.amount, 0);
    //         let amount = (multiplier - 1) * currentTotal;
    //         modifiers.push(StatModifier.fromEffect(amount, multiplierEffect));
    //     });

    //     return modifiers;
    // }

    get showStats() {
        return isArena(this.location) && this.type === CardTypes.Unit;
    }

    get militarySkillSummary() {
        if (!this.showStats) {
            return {};
        }
        let modifiers = this.getPowerModifiers().map((modifier) => Object.assign({}, modifier));
        let skill = modifiers.reduce((total, modifier) => total + modifier.amount, 0);
        return {
            stat: isNaN(skill) ? '-' : Math.max(skill, 0).toString(),
            modifiers: modifiers
        };
    }

    get politicalSkillSummary() {
        if (!this.showStats) {
            return {};
        }
        let modifiers = this.getPoliticalModifiers().map((modifier) => Object.assign({}, modifier));
        modifiers.forEach((modifier) => (modifier = Object.assign({}, modifier)));
        let skill = modifiers.reduce((total, modifier) => total + modifier.amount, 0);
        return {
            stat: isNaN(skill) ? '-' : Math.max(skill, 0).toString(),
            modifiers: modifiers
        };
    }

    get power() {
        return this.getPower();
    }

    getPower(floor = true, excludeModifiers = []) {
        let modifiers = this.getPowerModifiers(excludeModifiers);
        let skill = modifiers.reduce((total, modifier) => total + modifier.amount, 0);
        if (isNaN(skill)) {
            return 0;
        }
        return floor ? Math.max(0, skill) : skill;
    }

    get basePower() {
        return this.getBasePower();
    }

    getBasePower() {
        let skill = this.getBaseStatModifiers().basePower;
        if (isNaN(skill)) {
            return 0;
        }
        return Math.max(0, skill);
    }

    getPowerModifiers(exclusions) {
        let baseStatModifiers = this.getBaseStatModifiers();
        if (isNaN(baseStatModifiers.basePower)) {
            return baseStatModifiers.basePowerModifiers;
        }

        if (!exclusions) {
            exclusions = [];
        }

        let rawEffects;
        if (typeof exclusions === 'function') {
            rawEffects = this.getRawEffects().filter((effect) => !exclusions(effect));
        } else {
            rawEffects = this.getRawEffects().filter((effect) => !exclusions.includes(effect.type));
        }

        // set effects (i.e., "set power to X")
        let setEffects = rawEffects.filter(
            (effect) => effect.type === EffectNames.SetPower
        );
        if (setEffects.length > 0) {
            let latestSetEffect = _.last(setEffects);
            let setAmount = latestSetEffect.getValue(this);
            return [
                StatModifier.fromEffect(
                    setAmount,
                    latestSetEffect,
                    true,
                    `Set by ${StatModifier.getEffectName(latestSetEffect)}`
                )
            ];
        }

        let modifiers = baseStatModifiers.basePowerModifiers;

        // power modifiers
        // TODO: remove status tokens completely, upgrades completely cover that category
        // TODO: does this work for resolving effects like Raid that depend on whether we're the attacker or not?
        let modifierEffects = rawEffects.filter(
            (effect) =>
                effect.type === EffectNames.UpgradePowerModifier ||
                effect.type === EffectNames.ModifyPower ||
                effect.type === EffectNames.ModifyStats
        );
        modifierEffects.forEach((modifierEffect) => {
            const value = modifierEffect.getValue(this);
            modifiers.push(StatModifier.fromEffect(value, modifierEffect));
        });

        return modifiers;
    }

    get hp() {
        return this.getHp();
    }

    getHp(floor = true, excludeModifiers = []) {
        let modifiers = this.getPowerModifiers(excludeModifiers);
        let skill = modifiers.reduce((total, modifier) => total + modifier.amount, 0);
        if (isNaN(skill)) {
            return 0;
        }
        return floor ? Math.max(0, skill) : skill;
    }

    get baseHp() {
        return this.getBaseHp();
    }

    getBaseHp() {
        let skill = this.getBaseStatModifiers().basePoliticalSkill;
        if (isNaN(skill)) {
            return 0;
        }
        return Math.max(0, skill);
    }

    getHpModifiers(exclusions) {
        let baseStatModifiers = this.getBaseStatModifiers();
        if (isNaN(baseStatModifiers.baseHp)) {
            return baseStatModifiers.baseHpModifiers;
        }

        if (!exclusions) {
            exclusions = [];
        }

        let rawEffects;
        if (typeof exclusions === 'function') {
            rawEffects = this.getRawEffects().filter((effect) => !exclusions(effect));
        } else {
            rawEffects = this.getRawEffects().filter((effect) => !exclusions.includes(effect.type));
        }

        let modifiers = baseStatModifiers.baseHpModifiers;

        // hp modifiers
        // TODO: remove status tokens completely, upgrades completely cover that category
        let modifierEffects = rawEffects.filter(
            (effect) =>
                effect.type === EffectNames.UpgradeHpModifier ||
                effect.type === EffectNames.ModifyHp
        );
        modifierEffects.forEach((modifierEffect) => {
            const value = modifierEffect.getValue(this);
            modifiers.push(StatModifier.fromEffect(value, modifierEffect));
        });

        return modifiers;
    }

    exhaust() {
        this.exhausted = true;
    }

    ready() {
        this.exhausted = false;
    }

    canPlay(context, type) {
        return (
            this.checkRestrictions(type, context) &&
            context.player.checkRestrictions(type, context) &&
            this.checkRestrictions('play', context) &&
            context.player.checkRestrictions('play', context) &&
            (!this.hasPrintedKeyword('peaceful') || !this.game.currentConflict)
        );
    }

    getActions(location = this.location) {
        // if card is already in play or is an event, return the default actions
        if (location === Locations.SpaceArena || location === Locations.GroundArena || this.type === CardTypes.Event) {
            return super.getActions();
        }

        // TODO: add base / leader actions if this doesn't already cover them

        // otherwise (i.e. card is in hand), return play card action(s) + other available card actions
        return this.getPlayActions().concat(super.getActions());
    }

    /**
     * Deals with the engine effects of leaving play, making sure all statuses are removed. Anything which changes
     * the state of the card should be here. This is also called in some strange corner cases e.g. for attachments
     * which aren't actually in play themselves when their parent (which is in play) leaves play.
     */
    leavesPlay() {
        // If this is an attachment and is attached to another card, we need to remove all links between them
        if (this.parent && this.parent.attachments) {
            this.parent.removeAttachment(this);
            this.parent = null;
        }

        // Remove any cards underneath from the game
        const cardsUnderneath = this.controller.getSourceListForPile(this.uuid).map((a) => a);
        if (cardsUnderneath.length > 0) {
            cardsUnderneath.forEach((card) => {
                this.controller.moveCard(card, Locations.RemovedFromGame);
            });
            this.game.addMessage(
                '{0} {1} removed from the game due to {2} leaving play',
                cardsUnderneath,
                cardsUnderneath.length === 1 ? 'is' : 'are',
                this
            );
        }

        if (this.isParticipating()) {
            this.game.currentConflict.removeFromConflict(this);
        }

        this.exhausted = false;
        this.new = false;
        super.leavesPlay();
    }

    resetForConflict() {
        this.covert = false;
        this.inConflict = false;
    }

    // canDeclareAsAttacker(conflictType, ring, province, incomingAttackers = undefined) {
    //     // eslint-disable-line no-unused-vars
    //     if (!province) {
    //         let provinces =
    //             this.game.currentConflict && this.game.currentConflict.defendingPlayer
    //                 ? this.game.currentConflict.defendingPlayer.getProvinces()
    //                 : null;
    //         if (provinces) {
    //             return provinces.some(
    //                 (a) =>
    //                     a.canDeclare(conflictType, ring) &&
    //                     this.canDeclareAsAttacker(conflictType, ring, a, incomingAttackers)
    //             );
    //         }
    //     }

    //     let attackers = this.game.isDuringConflict() ? this.game.currentConflict.attackers : [];
    //     if (incomingAttackers) {
    //         attackers = incomingAttackers;
    //     }
    //     if (!attackers.includes(this)) {
    //         attackers = attackers.concat(this);
    //     }

    //     // Check if I add an element that I can\'t attack with
    //     const elementsAdded = this.upgrades.reduce(
    //         (array, attachment) => array.concat(attachment.getEffects(EffectNames.AddElementAsAttacker)),
    //         this.getEffects(EffectNames.AddElementAsAttacker)
    //     );

    //     if (
    //         elementsAdded.some((element) =>
    //             this.game.rings[element]
    //                 .getEffects(EffectNames.CannotDeclareRing)
    //                 .some((match) => match(this.controller))
    //         )
    //     ) {
    //         return false;
    //     }

    //     if (
    //         conflictType === ConflictTypes.Military &&
    //         attackers.reduce((total, card) => total + card.sumEffects(EffectNames.CardCostToAttackMilitary), 0) >
    //             this.controller.hand.size()
    //     ) {
    //         return false;
    //     }

    //     let fateCostToAttackProvince = province ? province.getFateCostToAttack() : 0;
    //     if (
    //         attackers.reduce((total, card) => total + card.sumEffects(EffectNames.FateCostToAttack), 0) +
    //             fateCostToAttackProvince >
    //         this.controller.fate
    //     ) {
    //         return false;
    //     }
    //     if (this.anyEffect(EffectNames.CanOnlyBeDeclaredAsAttackerWithElement)) {
    //         for (let element of this.getEffects(EffectNames.CanOnlyBeDeclaredAsAttackerWithElement)) {
    //             if (!ring.hasElement(element) && !elementsAdded.includes(element)) {
    //                 return false;
    //             }
    //         }
    //     }

    //     if (this.controller.anyEffect(EffectNames.LimitLegalAttackers)) {
    //         const checks = this.controller.getEffects(EffectNames.LimitLegalAttackers);
    //         let valid = true;
    //         checks.forEach((check) => {
    //             if (typeof check === 'function') {
    //                 valid = valid && check(this);
    //             }
    //         });
    //         if (!valid) {
    //             return false;
    //         }
    //     }

    //     return (
    //         this.checkRestrictions('declareAsAttacker', this.game.getFrameworkContext()) &&
    //         this.canParticipateAsAttacker(conflictType) &&
    //         this.location === Locations.PlayArea &&
    //         !this.exhausted
    //     );
    // }

    // canDeclareAsDefender(conflictType = this.game.currentConflict.conflictType) {
    //     return (
    //         this.checkRestrictions('declareAsDefender', this.game.getFrameworkContext()) &&
    //         this.canParticipateAsDefender(conflictType) &&
    //         this.location === Locations.PlayArea &&
    //         !this.exhausted &&
    //         !this.covert
    //     );
    // }

    // canParticipateAsAttacker(conflictType = this.game.currentConflict.conflictType) {
    //     let effects = this.getEffects(EffectNames.CannotParticipateAsAttacker);
    //     return !effects.some((value) => value === 'both' || value === conflictType) && !this.hasDash(conflictType);
    // }

    // canParticipateAsDefender(conflictType = this.game.currentConflict.conflictType) {
    //     let effects = this.getEffects(EffectNames.CannotParticipateAsDefender);
    //     let hasDash = conflictType ? this.hasDash(conflictType) : false;

    //     return !effects.some((value) => value === 'both' || value === conflictType) && !hasDash;
    // }

    // bowsOnReturnHome() {
    //     return !this.anyEffect(EffectNames.DoesNotBow);
    // }

    setDefaultController(player) {
        this.defaultController = player;
    }

    // getModifiedController() {
    //     if (
    //         this.location === Locations.PlayArea ||
    //         (this.type === CardTypes.Holding && this.location.includes('province'))
    //     ) {
    //         return this.mostRecentEffect(EffectNames.TakeControl) || this.defaultController;
    //     }
    //     return this.owner;
    // }

    // canDisguise(card, context, intoConflictOnly) {
    //     return (
    //         this.disguisedKeywordTraits.some((trait) => card.hasTrait(trait)) &&
    //         card.allowGameAction('discardFromPlay', context) &&
    //         !card.isUnique() &&
    //         (!intoConflictOnly || card.isParticipating())
    //     );
    // }

    // play() {
    //     //empty function so playcardaction doesn't crash the game
    // }

    // getSummary(activePlayer, hideWhenFaceup) {
    //     let baseSummary = super.getSummary(activePlayer, hideWhenFaceup);

    //     return _.extend(baseSummary, {
    //         attached: !!this.parent,
    //         attachments: this.upgrades.map((attachment) => {
    //             return attachment.getSummary(activePlayer, hideWhenFaceup);
    //         }),
    //         childCards: this.childCards.map((card) => {
    //             return card.getSummary(activePlayer, hideWhenFaceup);
    //         }),
    //         inConflict: this.inConflict,
    //         isConflict: this.isConflict,
    //         isDynasty: this.isDynasty,
    //         isPlayableByMe: this.isConflict && this.controller.isCardInPlayableLocation(this, PlayTypes.PlayFromHand),
    //         isPlayableByOpponent:
    //             this.isConflict &&
    //             this.controller.opponent &&
    //             this.controller.opponent.isCardInPlayableLocation(this, PlayTypes.PlayFromHand),
    //         bowed: this.exhausted,
    //         fate: this.fate,
    //         new: this.new,
    //         covert: this.covert,
    //         showStats: this.showStats,
    //         militarySkillSummary: this.militarySkillSummary,
    //         politicalSkillSummary: this.politicalSkillSummary,
    //         glorySummary: this.glorySummary,
    //         controller: this.controller.getShortSummary()
    //     });
    // }
}

module.exports = DeckCard;