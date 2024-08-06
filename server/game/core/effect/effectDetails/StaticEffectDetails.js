const _ = require('underscore');
const { EffectValue } = require('./EffectValue');
const { CardType, EffectName, Duration, AbilityType } = require('../../Constants');
const GainAbility = require('./GainAbility');

const binaryCardEffects = [
    EffectName.Blank,
    // EffectName.CanBeSeenWhenFacedown,
    // EffectName.CannotParticipateAsAttacker,
    // EffectName.CannotParticipateAsDefender,
    EffectName.AbilityRestrictions,
    // EffectName.DoesNotBow,
    EffectName.DoesNotReady,
    // EffectName.ShowTopConflictCard,
    // EffectName.ShowTopDynastyCard
];

// const MilitaryModifiers = [
//     EffectName.ModifyBaseMilitarySkillMultiplier,
//     EffectName.ModifyMilitarySkill,
//     EffectName.ModifyMilitarySkillMultiplier,
//     EffectName.ModifyBothSkills,
//     EffectName.AttachmentMilitarySkillModifier
// ];

// const PoliticalModifiers = [
//     EffectName.ModifyBasePoliticalSkillMultiplier,
//     EffectName.ModifyPoliticalSkill,
//     EffectName.ModifyPoliticalSkillMultiplier,
//     EffectName.ModifyBothSkills,
//     EffectName.AttachmentPoliticalSkillModifier
// ];

// const ProvinceStrengthModifiers = [
//     EffectName.ModifyProvinceStrength,
//     EffectName.ModifyProvinceStrengthMultiplier,
//     EffectName.SetBaseProvinceStrength
// ];

// const conflictingEffects = {
//     modifyBaseMilitarySkillMultiplier: (card) =>
//         card.effects.filter((effect) => effect.type === EffectName.SetBaseMilitarySkill),
//     modifyBasePoliticalSkillMultiplier: (card) =>
//         card.effects.filter((effect) => effect.type === EffectName.SetBasePoliticalSkill),
//     modifyGlory: (card) => card.effects.filter((effect) => effect.type === EffectName.SetGlory),
//     modifyMilitarySkill: (card) => card.effects.filter((effect) => effect.type === EffectName.SetMilitarySkill),
//     modifyMilitarySkillMultiplier: (card) =>
//         card.effects.filter((effect) => effect.type === EffectName.SetMilitarySkill),
//     modifyPoliticalSkill: (card) => card.effects.filter((effect) => effect.type === EffectName.SetPoliticalSkill),
//     modifyPoliticalSkillMultiplier: (card) =>
//         card.effects.filter((effect) => effect.type === EffectName.SetPoliticalSkill),
//     setBaseMilitarySkill: (card) => card.effects.filter((effect) => effect.type === EffectName.SetMilitarySkill),
//     setBasePoliticalSkill: (card) => card.effects.filter((effect) => effect.type === EffectName.SetPoliticalSkill),
//     setMaxConflicts: (player, value) =>
//         player.mostRecentEffect(EffectName.SetMaxConflicts) === value
//             ? [_.last(player.effects.filter((effect) => effect.type === EffectName.SetMaxConflicts))]
//             : [],
//     takeControl: (card, player) =>
//         card.mostRecentEffect(EffectName.TakeControl) === player
//             ? [_.last(card.effects.filter((effect) => effect.type === EffectName.TakeControl))]
//             : []
// };

class StaticEffectDetails {
    constructor(type, value) {
        this.type = type;
        if (value instanceof EffectValue) {
            this.value = value;
        } else {
            this.value = new EffectValue(value);
        }
        this.value.reset();
        this.context = null;
        this.duration = null;
        this.copies = [];
    }

    apply(target) {
        target.addEffect(this);
        if (this.value instanceof GainAbility && this.value.abilityType === AbilityType.Persistent) {
            const copy = this.value.getCopy();
            copy.apply(target);
            this.copies.push(copy);
        } else {
            this.value.apply(target);
        }
    }

    unapply(target) {
        target.removeEffect(this);
        this.value.unapply(target);
        this.copies.forEach((a) => a.unapply(target));
        this.copies = [];
    }

    getValue() {
        return this.value.getValue();
    }

    recalculate() {
        return this.value.recalculate();
    }

    setContext(context) {
        this.context = context;
        this.value.setContext(context);
    }

    // canBeApplied(target) {
    //     if (target.facedown && target.type !== CardType.Province) {
    //         return false;
    //     }
    //     return !hasDash[this.type] || !hasDash[this.type](target, this.value);
    // }

    // isMilitaryModifier() {
    //     return MilitaryModifiers.includes(this.type);
    // }

    // isPoliticalModifier() {
    //     return PoliticalModifiers.includes(this.type);
    // }

    // isSkillModifier() {
    //     return this.isMilitaryModifier() || this.isPoliticalModifier();
    // }

    // isProvinceStrengthModifier() {
    //     return ProvinceStrengthModifiers.includes(this.type);
    // }

    // checkConflictingEffects(type, target) {
    //     if (binaryCardEffects.includes(type)) {
    //         let matchingEffects = target.effects.filter((effect) => effect.type === type);
    //         return matchingEffects.every((effect) => this.hasLongerDuration(effect) || effect.isConditional);
    //     }
    //     if (conflictingEffects[type]) {
    //         let matchingEffects = conflictingEffects[type](target, this.getValue());
    //         return matchingEffects.every((effect) => this.hasLongerDuration(effect) || effect.isConditional);
    //     }
    //     if (type === EffectName.ModifyBothSkills) {
    //         return (
    //             this.checkConflictingEffects(EffectName.ModifyMilitarySkill, target) ||
    //             this.checkConflictingEffects(EffectName.ModifyPoliticalSkill, target)
    //         );
    //     }
    //     if (type === EffectName.HonorStatusDoesNotModifySkill) {
    //         return (
    //             this.checkConflictingEffects(EffectName.ModifyMilitarySkill, target) ||
    //             this.checkConflictingEffects(EffectName.ModifyPoliticalSkill, target)
    //         );
    //     }
    //     if (type === EffectName.HonorStatusReverseModifySkill) {
    //         return (
    //             this.checkConflictingEffects(EffectName.ModifyMilitarySkill, target) ||
    //             this.checkConflictingEffects(EffectName.ModifyPoliticalSkill, target)
    //         );
    //     }
    //     return true;
    // }

    // hasLongerDuration(effect) {
    //     let durations = [
    //         Duration.UntilEndOfDuel,
    //         Duration.UntilEndOfConflict,
    //         Duration.UntilEndOfPhase,
    //         Duration.UntilEndOfRound
    //     ];
    //     return durations.indexOf(this.duration) > durations.indexOf(effect.duration);
    // }

    getDebugInfo() {
        return {
            type: this.type,
            value: this.value
        };
    }
}

module.exports = StaticEffectDetails;
