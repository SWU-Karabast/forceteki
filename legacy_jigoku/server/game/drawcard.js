const _ = require('underscore');

const BaseCard = require('./basecard');
const DuplicateUniqueAction = require('./duplicateuniqueaction.js');
const CourtesyAbility = require('./KeywordAbilities/CourtesyAbility');
const PrideAbility = require('./KeywordAbilities/PrideAbility');
const SincerityAbility = require('./KeywordAbilities/SincerityAbility');
const { RallyAbility } = require('./KeywordAbilities/RallyAbility.js');
const StatModifier = require('./StatModifier');

const { Locations, EffectNames, CardTypes, PlayTypes, ConflictTypes, EventNames } = require('./Constants');
const { GameModes } = require('../GameModes');
const { EventRegistrar } = require('./EventRegistrar');

class DrawCard extends BaseCard {
    // fromOutOfPlaySource ?: Array < DrawCard >;
    menu = [
        { command: 'bow', text: 'Bow/Ready' },
        { command: 'honor', text: 'Honor' },
        { command: 'dishonor', text: 'Dishonor' },
        { command: 'taint', text: 'Taint/Cleanse' },
        { command: 'addfate', text: 'Add 1 fate' },
        { command: 'remfate', text: 'Remove 1 fate' },
        { command: 'move', text: 'Move into/out of conflict' },
        { command: 'control', text: 'Give control' }
    ];

    constructor(owner, cardData) {
        super(owner, cardData);

        this.defaultController = owner;
        this.parent = null;

        this.printedMilitarySkill = this.getPrintedSkill('military');
        this.printedPoliticalSkill = this.getPrintedSkill('political');
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
        this.bowed = false;
        this.covert = false;
        this.isConflict = cardData.side === 'conflict';
        this.isDynasty = cardData.side === 'dynasty';
        this.allowDuplicatesOfAttachment = !!cardData.attachment_allow_duplicates;

        if (cardData.type === CardTypes.Character) {
            this.abilities.reactions.push(new CourtesyAbility(this.game, this));
            this.abilities.reactions.push(new PrideAbility(this.game, this));
            this.abilities.reactions.push(new SincerityAbility(this.game, this));
        }
        if (cardData.type === CardTypes.Attachment) {
            this.abilities.reactions.push(new CourtesyAbility(this.game, this));
            this.abilities.reactions.push(new SincerityAbility(this.game, this));
        }
        if (cardData.type === CardTypes.Event && this.hasEphemeral()) {
            this.eventRegistrarForEphemeral = new EventRegistrar(this.game, this);
            this.eventRegistrarForEphemeral.register([{ [EventNames.OnCardPlayed]: 'handleEphemeral' }]);
        }
        if (this.isDynasty) {
            this.abilities.reactions.push(new RallyAbility(this.game, this));
        }
    }

    handleEphemeral(event) {
        if (event.card === this) {
            if (this.location !== Locations.RemovedFromGame) {
                this.owner.moveCard(this, Locations.RemovedFromGame);
            }
            this.fromOutOfPlaySource = undefined;
        }
    }

    getPrintedSkill(type) {
        if (type === 'military') {
            return this.cardData.military === null || this.cardData.military === undefined
                ? NaN
                : isNaN(parseInt(this.cardData.military))
                ? 0
                : parseInt(this.cardData.military);
        } else if (type === 'political') {
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

    getFate() {
        let rawEffects = this.getRawEffects().filter((effect) => effect.type === EffectNames.SetApparentFate);
        let apparentFate = this.mostRecentEffect(EffectNames.SetApparentFate);
        return rawEffects.length > 0 ? apparentFate : this.fate;
    }

    isInConflictProvince() {
        return this.game.currentConflict.isCardInConflictProvince(this);
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
                    card.printedName === this.printedName &&
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
                    card.printedName === this.printedName &&
                    card !== this &&
                    card.controller === player
            )
        );
    }

    createSnapshot() {
        let clone = new DrawCard(this.owner, this.cardData);

        clone.attachments = _(this.attachments.map((attachment) => attachment.createSnapshot()));
        clone.childCards = this.childCards.map((card) => card.createSnapshot());
        clone.effects = _.clone(this.effects);
        clone.controller = this.controller;
        clone.bowed = this.bowed;
        clone.statusTokens = [...this.statusTokens];
        clone.location = this.location;
        clone.parent = this.parent;
        clone.fate = this.fate;
        clone.inConflict = this.inConflict;
        clone.traits = Array.from(this.getTraits());
        clone.uuid = this.uuid;
        return clone;
    }

    hasDash(type = '') {
        if (type === 'glory' || this.printedType !== CardTypes.Character) {
            return false;
        }

        let baseSkillModifiers = this.getBaseSkillModifiers();

        if (type === 'military') {
            return isNaN(baseSkillModifiers.baseMilitarySkill);
        } else if (type === 'political') {
            return isNaN(baseSkillModifiers.basePoliticalSkill);
        }

        return isNaN(baseSkillModifiers.baseMilitarySkill) || isNaN(baseSkillModifiers.basePoliticalSkill);
    }

    getContributionToConflict(type) {
        let skillFunction = this.mostRecentEffect(EffectNames.ChangeContributionFunction);
        if (skillFunction) {
            return skillFunction(this);
        }
        return this.getSkill(type);
    }

    /**
     * Direct the skill query to the correct sub function.
     * @param  {string} type - The type of the skill; military or political
     * @return {number} The chosen skill value
     */
    getSkill(type) {
        if (type === 'military') {
            return this.getMilitarySkill();
        } else if (type === 'political') {
            return this.getPoliticalSkill();
        }
    }

    getBaseSkillModifiers() {
        const baseModifierEffects = [
            EffectNames.CopyCharacter,
            EffectNames.CalculatePrintedMilitarySkill,
            EffectNames.ModifyBaseMilitarySkillMultiplier,
            EffectNames.ModifyBasePoliticalSkillMultiplier,
            EffectNames.SetBaseMilitarySkill,
            EffectNames.SetBasePoliticalSkill,
            EffectNames.SetBaseDash,
            EffectNames.SwitchBaseSkills,
            EffectNames.SetBaseGlory
        ];

        let baseEffects = this.getRawEffects().filter((effect) => baseModifierEffects.includes(effect.type));
        let baseMilitaryModifiers = [StatModifier.fromCard(this.printedMilitarySkill, this, 'Printed skill', false)];
        let basePoliticalModifiers = [StatModifier.fromCard(this.printedPoliticalSkill, this, 'Printed skill', false)];
        let baseMilitarySkill = this.printedMilitarySkill;
        let basePoliticalSkill = this.printedPoliticalSkill;

        baseEffects.forEach((effect) => {
            switch (effect.type) {
                case EffectNames.CalculatePrintedMilitarySkill: {
                    let skillFunction = effect.getValue(this);
                    let calculatedSkillValue = skillFunction(this);
                    baseMilitarySkill = calculatedSkillValue;
                    baseMilitaryModifiers = baseMilitaryModifiers.filter(
                        (mod) => !mod.name.startsWith('Printed skill')
                    );
                    baseMilitaryModifiers.push(
                        StatModifier.fromEffect(
                            baseMilitarySkill,
                            effect,
                            false,
                            `Printed skill due to ${StatModifier.getEffectName(effect)}`
                        )
                    );
                    break;
                }
                case EffectNames.CopyCharacter: {
                    let copiedCard = effect.getValue(this);
                    baseMilitarySkill = copiedCard.getPrintedSkill('military');
                    basePoliticalSkill = copiedCard.getPrintedSkill('political');
                    // replace existing base or copied modifier
                    baseMilitaryModifiers = baseMilitaryModifiers.filter(
                        (mod) => !mod.name.startsWith('Printed skill')
                    );
                    basePoliticalModifiers = basePoliticalModifiers.filter(
                        (mod) => !mod.name.startsWith('Printed skill')
                    );
                    baseMilitaryModifiers.push(
                        StatModifier.fromEffect(
                            baseMilitarySkill,
                            effect,
                            false,
                            `Printed skill from ${copiedCard.name} due to ${StatModifier.getEffectName(effect)}`
                        )
                    );
                    basePoliticalModifiers.push(
                        StatModifier.fromEffect(
                            basePoliticalSkill,
                            effect,
                            false,
                            `Printed skill from ${copiedCard.name} due to ${StatModifier.getEffectName(effect)}`
                        )
                    );
                    break;
                }
                case EffectNames.SetBaseDash:
                    if (effect.getValue(this) === 'military') {
                        baseMilitaryModifiers.push(
                            StatModifier.fromEffect(undefined, effect, true, StatModifier.getEffectName(effect))
                        );
                        baseMilitarySkill = NaN;
                    }
                    if (effect.getValue(this) === 'political') {
                        basePoliticalModifiers.push(
                            StatModifier.fromEffect(undefined, effect, true, StatModifier.getEffectName(effect))
                        );
                        basePoliticalSkill = NaN;
                    }
                    break;
                case EffectNames.SetBaseMilitarySkill:
                    baseMilitarySkill = effect.getValue(this);
                    baseMilitaryModifiers.push(
                        StatModifier.fromEffect(
                            baseMilitarySkill,
                            effect,
                            true,
                            `Base set by ${StatModifier.getEffectName(effect)}`
                        )
                    );
                    break;
                case EffectNames.SetBasePoliticalSkill:
                    basePoliticalSkill = effect.getValue(this);
                    basePoliticalModifiers.push(
                        StatModifier.fromEffect(
                            basePoliticalSkill,
                            effect,
                            true,
                            `Base set by ${StatModifier.getEffectName(effect)}`
                        )
                    );
                    break;
                case EffectNames.SwitchBaseSkills: {
                    const milChange = Math.max(basePoliticalSkill, 0) - Math.max(baseMilitarySkill, 0);
                    const polChange = Math.max(baseMilitarySkill, 0) - Math.max(basePoliticalSkill, 0);
                    baseMilitarySkill += milChange;
                    basePoliticalSkill += polChange;
                    baseMilitaryModifiers.push(
                        StatModifier.fromEffect(
                            milChange,
                            effect,
                            false,
                            `Base due to ${StatModifier.getEffectName(effect)}`
                        )
                    );
                    basePoliticalModifiers.push(
                        StatModifier.fromEffect(
                            polChange,
                            effect,
                            false,
                            `Base due to ${StatModifier.getEffectName(effect)}`
                        )
                    );
                    break;
                }
                case EffectNames.ModifyBaseMilitarySkillMultiplier: {
                    const milChange = (effect.getValue(this) - 1) * baseMilitarySkill;
                    baseMilitarySkill += milChange;
                    baseMilitaryModifiers.push(
                        StatModifier.fromEffect(
                            milChange,
                            effect,
                            false,
                            `Base due to ${StatModifier.getEffectName(effect)}`
                        )
                    );
                    break;
                }
                case EffectNames.ModifyBasePoliticalSkillMultiplier: {
                    const polChange = (effect.getValue(this) - 1) * basePoliticalSkill;
                    basePoliticalSkill += polChange;
                    basePoliticalModifiers.push(
                        StatModifier.fromEffect(
                            polChange,
                            effect,
                            false,
                            `Base due to ${StatModifier.getEffectName(effect)}`
                        )
                    );
                    break;
                }
            }
        });

        let overridingMilModifiers = baseMilitaryModifiers.filter((mod) => mod.overrides);
        if (overridingMilModifiers.length > 0) {
            let lastModifier = _.last(overridingMilModifiers);
            baseMilitaryModifiers = [lastModifier];
            baseMilitarySkill = lastModifier.amount;
        }
        let overridingPolModifiers = basePoliticalModifiers.filter((mod) => mod.overrides);
        if (overridingPolModifiers.length > 0) {
            let lastModifier = _.last(overridingPolModifiers);
            basePoliticalModifiers = [lastModifier];
            basePoliticalSkill = lastModifier.amount;
        }

        return {
            baseMilitaryModifiers: baseMilitaryModifiers,
            baseMilitarySkill: baseMilitarySkill,
            basePoliticalModifiers: basePoliticalModifiers,
            basePoliticalSkill: basePoliticalSkill
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

    getStatusTokenModifiers() {
        let modifiers = [];
        let modifierEffects = this.getRawEffects().filter((effect) => effect.type === EffectNames.ModifyBothSkills);

        // skill modifiers
        modifierEffects.forEach((modifierEffect) => {
            const value = modifierEffect.getValue(this);
            modifiers.push(StatModifier.fromEffect(value, modifierEffect));
        });
        modifiers = modifiers.filter((modifier) => modifier.type === 'token');

        // adjust honor status effects
        this.adjustHonorStatusModifiers(modifiers);
        return modifiers;
    }

    getMilitaryModifiers(exclusions) {
        let baseSkillModifiers = this.getBaseSkillModifiers();
        if (isNaN(baseSkillModifiers.baseMilitarySkill)) {
            return baseSkillModifiers.baseMilitaryModifiers;
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

        // set effects
        let setEffects = rawEffects.filter(
            (effect) => effect.type === EffectNames.SetMilitarySkill || effect.type === EffectNames.SetDash
        );
        if (setEffects.length > 0) {
            let latestSetEffect = _.last(setEffects);
            let setAmount = latestSetEffect.type === EffectNames.SetDash ? undefined : latestSetEffect.getValue(this);
            return [
                StatModifier.fromEffect(
                    setAmount,
                    latestSetEffect,
                    true,
                    `Set by ${StatModifier.getEffectName(latestSetEffect)}`
                )
            ];
        }

        let modifiers = baseSkillModifiers.baseMilitaryModifiers;

        // skill modifiers
        let modifierEffects = rawEffects.filter(
            (effect) =>
                effect.type === EffectNames.AttachmentMilitarySkillModifier ||
                effect.type === EffectNames.ModifyMilitarySkill ||
                effect.type === EffectNames.ModifyBothSkills
        );
        modifierEffects.forEach((modifierEffect) => {
            const value = modifierEffect.getValue(this);
            modifiers.push(StatModifier.fromEffect(value, modifierEffect));
        });

        // adjust honor status effects
        this.adjustHonorStatusModifiers(modifiers);

        // multipliers
        let multiplierEffects = rawEffects.filter(
            (effect) => effect.type === EffectNames.ModifyMilitarySkillMultiplier
        );
        multiplierEffects.forEach((multiplierEffect) => {
            let multiplier = multiplierEffect.getValue(this);
            let currentTotal = modifiers.reduce((total, modifier) => total + modifier.amount, 0);
            let amount = (multiplier - 1) * currentTotal;
            modifiers.push(StatModifier.fromEffect(amount, multiplierEffect));
        });

        return modifiers;
    }

    getPoliticalModifiers(exclusions) {
        let baseSkillModifiers = this.getBaseSkillModifiers();
        if (isNaN(baseSkillModifiers.basePoliticalSkill)) {
            return baseSkillModifiers.basePoliticalModifiers;
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

        // set effects
        let setEffects = rawEffects.filter((effect) => effect.type === EffectNames.SetPoliticalSkill);
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

        let modifiers = baseSkillModifiers.basePoliticalModifiers;

        // skill modifiers
        let modifierEffects = rawEffects.filter(
            (effect) =>
                effect.type === EffectNames.AttachmentPoliticalSkillModifier ||
                effect.type === EffectNames.ModifyPoliticalSkill ||
                effect.type === EffectNames.ModifyBothSkills
        );
        modifierEffects.forEach((modifierEffect) => {
            const value = modifierEffect.getValue(this);
            modifiers.push(StatModifier.fromEffect(value, modifierEffect));
        });

        // adjust honor status effects
        this.adjustHonorStatusModifiers(modifiers);

        // multipliers
        let multiplierEffects = rawEffects.filter(
            (effect) => effect.type === EffectNames.ModifyPoliticalSkillMultiplier
        );
        multiplierEffects.forEach((multiplierEffect) => {
            let multiplier = multiplierEffect.getValue(this);
            let currentTotal = modifiers.reduce((total, modifier) => total + modifier.amount, 0);
            let amount = (multiplier - 1) * currentTotal;
            modifiers.push(StatModifier.fromEffect(amount, multiplierEffect));
        });

        return modifiers;
    }

    adjustHonorStatusModifiers(modifiers) {
        // This is Yojiro's ability
        let doesNotModifyEffects = this.getRawEffects().filter(
            (effect) => effect.type === EffectNames.HonorStatusDoesNotModifySkill
        );
        let doesNotModifyConflictEffects = false;
        if (this.game.currentConflict && this.isParticipating()) {
            doesNotModifyConflictEffects = this.game.currentConflict.anyEffect(EffectNames.ConflictIgnoreStatusTokens);
        }
        if (doesNotModifyEffects.length > 0 || doesNotModifyConflictEffects) {
            modifiers.forEach((modifier) => {
                if (modifier.type === 'token' && modifier.amount !== 0) {
                    modifier.amount = 0;
                    modifier.name += ` (${StatModifier.getEffectName(doesNotModifyEffects[0])})`;
                }
            });
        }
        // This is Sadako's ability
        let reverseEffects = this.getRawEffects().filter(
            (effect) => effect.type === EffectNames.HonorStatusReverseModifySkill
        );
        if (reverseEffects.length > 0) {
            modifiers.forEach((modifier) => {
                if (modifier.type === 'token' && modifier.amount !== 0 && modifier.name === 'Dishonored Token') {
                    modifier.amount = 0 - modifier.amount;
                    modifier.name += ` (${StatModifier.getEffectName(reverseEffects[0])})`;
                }
            });
        }
    }

    get showStats() {
        return this.location === Locations.PlayArea && this.type === CardTypes.Character;
    }

    get militarySkillSummary() {
        if (!this.showStats) {
            return {};
        }
        let modifiers = this.getMilitaryModifiers().map((modifier) => Object.assign({}, modifier));
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

    get glorySummary() {
        if (!this.showStats) {
            return {};
        }
        let modifiers = this.getGloryModifiers().map((modifier) => Object.assign({}, modifier));
        modifiers.forEach((modifier) => (modifier = Object.assign({}, modifier)));
        let stat = modifiers.reduce((total, modifier) => total + modifier.amount, 0);
        return {
            stat: Math.max(stat, 0).toString(),
            modifiers: modifiers
        };
    }

    get glory() {
        return this.getGlory();
    }

    getGlory() {
        let gloryModifiers = this.getGloryModifiers();
        let glory = gloryModifiers.reduce((total, modifier) => total + modifier.amount, 0);
        if (isNaN(glory)) {
            return 0;
        }
        return Math.max(0, glory);
    }

    getGloryModifiers() {
        const gloryModifierEffects = [
            EffectNames.CopyCharacter,
            EffectNames.SetGlory,
            EffectNames.ModifyGlory,
            EffectNames.SetBaseGlory
        ];

        // glory undefined (Holding etc.)
        if (this.printedGlory === undefined) {
            return [];
        }

        let gloryEffects = this.getRawEffects().filter((effect) => gloryModifierEffects.includes(effect.type));

        let gloryModifiers = [];

        // set effects
        let setEffects = gloryEffects.filter((effect) => effect.type === EffectNames.SetGlory);
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

        // base effects/copy effects/printed glory
        let baseEffects = gloryEffects.filter((effect) => effect.type === EffectNames.SetBaseGlory);
        let copyEffects = gloryEffects.filter((effect) => effect.type === EffectNames.CopyCharacter);
        if (baseEffects.length > 0) {
            let latestBaseEffect = _.last(baseEffects);
            let baseAmount = latestBaseEffect.getValue(this);
            gloryModifiers.push(
                StatModifier.fromEffect(
                    baseAmount,
                    latestBaseEffect,
                    true,
                    `Base set by ${StatModifier.getEffectName(latestBaseEffect)}`
                )
            );
        } else if (copyEffects.length > 0) {
            let latestCopyEffect = _.last(copyEffects);
            let copiedCard = latestCopyEffect.getValue(this);
            gloryModifiers.push(
                StatModifier.fromEffect(
                    copiedCard.printedGlory,
                    latestCopyEffect,
                    false,
                    `Printed glory from ${copiedCard.name} due to ${StatModifier.getEffectName(latestCopyEffect)}`
                )
            );
        } else {
            gloryModifiers.push(StatModifier.fromCard(this.printedGlory, this, 'Printed glory', false));
        }

        // skill modifiers
        let modifierEffects = gloryEffects.filter((effect) => effect.type === EffectNames.ModifyGlory);
        modifierEffects.forEach((modifierEffect) => {
            const value = modifierEffect.getValue(this);
            gloryModifiers.push(StatModifier.fromEffect(value, modifierEffect));
        });

        return gloryModifiers;
    }

    getProvinceStrengthBonus() {
        let modifiers = this.getProvinceStrengthBonusModifiers();
        let bonus = modifiers.reduce((total, modifier) => total + modifier.amount, 0);
        if (bonus && this.isFaceup()) {
            return bonus;
        }
        return 0;
    }

    getProvinceStrengthBonusModifiers() {
        const strengthModifierEffects = [EffectNames.SetProvinceStrengthBonus, EffectNames.ModifyProvinceStrengthBonus];

        // strength bonus undefined (not a holding)
        if (this.printedStrengthBonus === undefined) {
            return [];
        }

        let strengthEffects = this.getRawEffects().filter((effect) => strengthModifierEffects.includes(effect.type));

        let strengthModifiers = [];

        // set effects
        let setEffects = strengthEffects.filter((effect) => effect.type === EffectNames.SetProvinceStrengthBonus);
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

        // skill modifiers
        strengthModifiers.push(
            StatModifier.fromCard(this.printedStrengthBonus, this, 'Printed province strength bonus', false)
        );
        let modifierEffects = strengthEffects.filter(
            (effect) => effect.type === EffectNames.ModifyProvinceStrengthBonus
        );
        modifierEffects.forEach((modifierEffect) => {
            const value = modifierEffect.getValue(this);
            strengthModifiers.push(StatModifier.fromEffect(value, modifierEffect));
        });

        return strengthModifiers;
    }

    get militarySkill() {
        return this.getMilitarySkill();
    }

    getMilitarySkill(floor = true) {
        let modifiers = this.getMilitaryModifiers();
        let skill = modifiers.reduce((total, modifier) => total + modifier.amount, 0);
        if (isNaN(skill)) {
            return 0;
        }
        return floor ? Math.max(0, skill) : skill;
    }

    getMilitarySkillExcludingModifiers(exclusions, floor = true) {
        if (!Array.isArray(exclusions) && typeof exclusions !== 'function') {
            exclusions = [exclusions];
        }
        let modifiers = this.getMilitaryModifiers(exclusions);
        let skill = modifiers.reduce((total, modifier) => total + modifier.amount, 0);
        if (isNaN(skill)) {
            return 0;
        }
        return floor ? Math.max(0, skill) : skill;
    }

    get politicalSkill() {
        return this.getPoliticalSkill();
    }

    getPoliticalSkill(floor = true) {
        let modifiers = this.getPoliticalModifiers();
        let skill = modifiers.reduce((total, modifier) => total + modifier.amount, 0);
        if (isNaN(skill)) {
            return 0;
        }
        return floor ? Math.max(0, skill) : skill;
    }

    getPoliticalSkillExcludingModifiers(exclusions, floor = true) {
        if (!Array.isArray(exclusions) && typeof exclusions !== 'function') {
            exclusions = [exclusions];
        }
        let modifiers = this.getPoliticalModifiers(exclusions);
        let skill = modifiers.reduce((total, modifier) => total + modifier.amount, 0);
        if (isNaN(skill)) {
            return 0;
        }
        return floor ? Math.max(0, skill) : skill;
    }

    get baseMilitarySkill() {
        return this.getBaseMilitarySkill();
    }

    getBaseMilitarySkill() {
        let skill = this.getBaseSkillModifiers().baseMilitarySkill;
        if (isNaN(skill)) {
            return 0;
        }
        return Math.max(0, skill);
    }

    get basePoliticalSkill() {
        return this.getBasePoliticalSkill();
    }

    getBasePoliticalSkill() {
        let skill = this.getBaseSkillModifiers().basePoliticalSkill;
        if (isNaN(skill)) {
            return 0;
        }
        return Math.max(0, skill);
    }

    getContributionToImperialFavor() {
        const canConributeWhileBowed = this.anyEffect(EffectNames.CanContributeGloryWhileBowed);
        const contributesGlory = canConributeWhileBowed || !this.bowed;
        return contributesGlory ? this.glory : 0;
    }

    modifyFate(amount) {
        /**
         * @param  {Number} amount - the amount of fate to modify this card's fate total by
         */
        this.fate = Math.max(0, this.fate + amount);
    }

    bow() {
        this.bowed = true;
    }

    ready() {
        this.bowed = false;
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
        if (location === Locations.PlayArea || this.type === CardTypes.Event) {
            return super.getActions();
        }
        const actions = this.type === CardTypes.Character ? [new DuplicateUniqueAction(this)] : [];
        return actions.concat(this.getPlayActions(), super.getActions());
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
        const cardsUnderneath = this.controller.getSourceList(this.uuid).map((a) => a);
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

        const cacheParticipating = this.isParticipating();

        if (this.isParticipating()) {
            this.game.currentConflict.removeFromConflict(this);
        }

        let honorStatusDoesNotAffectLeavePlayEffects = this.anyEffect(EffectNames.HonorStatusDoesNotModifySkill);
        let honorStatusDoesNotAffectLeavePlayConflictEffects = false;
        if (this.game.currentConflict) {
            honorStatusDoesNotAffectLeavePlayConflictEffects =
                cacheParticipating && this.game.currentConflict.anyEffect(EffectNames.ConflictIgnoreStatusTokens);
        }
        const ignoreHonorStatus =
            honorStatusDoesNotAffectLeavePlayEffects || honorStatusDoesNotAffectLeavePlayConflictEffects;

        if (this.isDishonored && !ignoreHonorStatus) {
            const frameworkContext = this.game.getFrameworkContext();
            const honorLossAction = this.game.actions.loseHonor();

            if (honorLossAction.canAffect(this.controller, frameworkContext)) {
                this.game.addMessage("{0} loses 1 honor due to {1}'s personal honor", this.controller, this);
            }
            this.game.openThenEventWindow(honorLossAction.getEvent(this.controller, frameworkContext));
        } else if (this.isHonored && !ignoreHonorStatus) {
            const frameworkContext = this.game.getFrameworkContext();
            const honorGainAction = this.game.actions.gainHonor();
            if (honorGainAction.canAffect(this.controller, frameworkContext)) {
                this.game.addMessage("{0} gains 1 honor due to {1}'s personal honor", this.controller, this);
            }
            this.game.openThenEventWindow(honorGainAction.getEvent(this.controller, frameworkContext));
        }

        this.untaint();
        this.makeOrdinary();
        this.bowed = false;
        this.covert = false;
        this.new = false;
        this.fate = 0;
        super.leavesPlay();
    }

    resetForConflict() {
        this.covert = false;
        this.inConflict = false;
    }

    canBeBypassedByCovert(context) {
        return !this.isCovert() && this.checkRestrictions('applyCovert', context);
    }

    canDeclareAsAttacker(conflictType, ring, province, incomingAttackers = undefined) {
        // eslint-disable-line no-unused-vars
        if (!province) {
            let provinces =
                this.game.currentConflict && this.game.currentConflict.defendingPlayer
                    ? this.game.currentConflict.defendingPlayer.getProvinces()
                    : null;
            if (provinces) {
                return provinces.some(
                    (a) =>
                        a.canDeclare(conflictType, ring) &&
                        this.canDeclareAsAttacker(conflictType, ring, a, incomingAttackers)
                );
            }
        }

        let attackers = this.game.isDuringConflict() ? this.game.currentConflict.attackers : [];
        if (incomingAttackers) {
            attackers = incomingAttackers;
        }
        if (!attackers.includes(this)) {
            attackers = attackers.concat(this);
        }

        // Check if I add an element that I can\'t attack with
        const elementsAdded = this.attachments.reduce(
            (array, attachment) => array.concat(attachment.getEffects(EffectNames.AddElementAsAttacker)),
            this.getEffects(EffectNames.AddElementAsAttacker)
        );

        if (
            elementsAdded.some((element) =>
                this.game.rings[element]
                    .getEffects(EffectNames.CannotDeclareRing)
                    .some((match) => match(this.controller))
            )
        ) {
            return false;
        }

        if (
            conflictType === ConflictTypes.Military &&
            attackers.reduce((total, card) => total + card.sumEffects(EffectNames.CardCostToAttackMilitary), 0) >
                this.controller.hand.size()
        ) {
            return false;
        }

        let fateCostToAttackProvince = province ? province.getFateCostToAttack() : 0;
        if (
            attackers.reduce((total, card) => total + card.sumEffects(EffectNames.FateCostToAttack), 0) +
                fateCostToAttackProvince >
            this.controller.fate
        ) {
            return false;
        }
        if (this.anyEffect(EffectNames.CanOnlyBeDeclaredAsAttackerWithElement)) {
            for (let element of this.getEffects(EffectNames.CanOnlyBeDeclaredAsAttackerWithElement)) {
                if (!ring.hasElement(element) && !elementsAdded.includes(element)) {
                    return false;
                }
            }
        }

        if (this.controller.anyEffect(EffectNames.LimitLegalAttackers)) {
            const checks = this.controller.getEffects(EffectNames.LimitLegalAttackers);
            let valid = true;
            checks.forEach((check) => {
                if (typeof check === 'function') {
                    valid = valid && check(this);
                }
            });
            if (!valid) {
                return false;
            }
        }

        return (
            this.checkRestrictions('declareAsAttacker', this.game.getFrameworkContext()) &&
            this.canParticipateAsAttacker(conflictType) &&
            this.location === Locations.PlayArea &&
            !this.bowed
        );
    }

    canDeclareAsDefender(conflictType = this.game.currentConflict.conflictType) {
        return (
            this.checkRestrictions('declareAsDefender', this.game.getFrameworkContext()) &&
            this.canParticipateAsDefender(conflictType) &&
            this.location === Locations.PlayArea &&
            !this.bowed &&
            !this.covert
        );
    }

    canParticipateAsAttacker(conflictType = this.game.currentConflict.conflictType) {
        let effects = this.getEffects(EffectNames.CannotParticipateAsAttacker);
        return !effects.some((value) => value === 'both' || value === conflictType) && !this.hasDash(conflictType);
    }

    canParticipateAsDefender(conflictType = this.game.currentConflict.conflictType) {
        let effects = this.getEffects(EffectNames.CannotParticipateAsDefender);
        let hasDash = conflictType ? this.hasDash(conflictType) : false;

        return !effects.some((value) => value === 'both' || value === conflictType) && !hasDash;
    }

    bowsOnReturnHome() {
        return !this.anyEffect(EffectNames.DoesNotBow);
    }

    setDefaultController(player) {
        this.defaultController = player;
    }

    getModifiedController() {
        if (
            this.location === Locations.PlayArea ||
            (this.type === CardTypes.Holding && this.location.includes('province'))
        ) {
            return this.mostRecentEffect(EffectNames.TakeControl) || this.defaultController;
        }
        return this.owner;
    }

    canDisguise(card, context, intoConflictOnly) {
        return (
            this.disguisedKeywordTraits.some((trait) => card.hasTrait(trait)) &&
            card.allowGameAction('discardFromPlay', context) &&
            !card.isUnique() &&
            (!intoConflictOnly || card.isParticipating())
        );
    }

    play() {
        //empty function so playcardaction doesn't crash the game
    }

    allowAttachment(attachment) {
        const frameworkLimitsAttachmentsWithRepeatedNames =
            this.game.gameMode === GameModes.Emerald || this.game.gameMode === GameModes.Obsidian;
        if (frameworkLimitsAttachmentsWithRepeatedNames && this.type === CardTypes.Character) {
            if (
                this.attachments
                    .filter((a) => !a.allowDuplicatesOfAttachment)
                    .some((a) => a.id === attachment.id && a.controller === attachment.controller && a !== attachment)
            ) {
                return false;
            }
        }
        return super.allowAttachment(attachment);
    }

    getSummary(activePlayer, hideWhenFaceup) {
        let baseSummary = super.getSummary(activePlayer, hideWhenFaceup);

        return _.extend(baseSummary, {
            attached: !!this.parent,
            attachments: this.attachments.map((attachment) => {
                return attachment.getSummary(activePlayer, hideWhenFaceup);
            }),
            childCards: this.childCards.map((card) => {
                return card.getSummary(activePlayer, hideWhenFaceup);
            }),
            inConflict: this.inConflict,
            isConflict: this.isConflict,
            isDynasty: this.isDynasty,
            isPlayableByMe: this.isConflict && this.controller.isCardInPlayableLocation(this, PlayTypes.PlayFromHand),
            isPlayableByOpponent:
                this.isConflict &&
                this.controller.opponent &&
                this.controller.opponent.isCardInPlayableLocation(this, PlayTypes.PlayFromHand),
            bowed: this.bowed,
            fate: this.fate,
            new: this.new,
            covert: this.covert,
            showStats: this.showStats,
            militarySkillSummary: this.militarySkillSummary,
            politicalSkillSummary: this.politicalSkillSummary,
            glorySummary: this.glorySummary,
            controller: this.controller.getShortSummary()
        });
    }
}

module.exports = DrawCard;