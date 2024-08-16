import { OngoingEffectValueWrapper } from './OngoingEffectValueWrapper';
import { CardType, EffectName, Duration, AbilityType } from '../../Constants';
import { AbilityContext } from '../../ability/AbilityContext';
import { OngoingEffectImpl } from './OngoingEffectImpl';

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

// UP NEXT: readonly pass on class properties throughout the repo
export default class StaticOngoingEffectImpl<TValue> extends OngoingEffectImpl<TValue> {
    readonly valueWrapper: OngoingEffectValueWrapper<TValue>;

    constructor(type: EffectName, value: OngoingEffectValueWrapper<TValue> | TValue) {
        super(type);

        if (value instanceof OngoingEffectValueWrapper) {
            this.valueWrapper = value;
        } else {
            this.valueWrapper = new OngoingEffectValueWrapper(value);
        }
        this.valueWrapper.reset();
    }

    apply(target) {
        target.addEffect(this);
        this.valueWrapper.apply(target);
    }

    unapply(target) {
        target.removeEffect(this);
        this.valueWrapper.unapply(target);
    }

    getValue(target) {
        return this.valueWrapper.getValue();
    }

    recalculate(target) {
        return this.valueWrapper.recalculate();
    }

    override setContext(context: AbilityContext) {
        super.setContext(context);
        this.valueWrapper.setContext(context);
    }

    // effects can't be applied to facedown cards
    // TODO: do we have any exceptions to that rule?
    canBeApplied(target) {
        return !target.facedown;
    }

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

    override getDebugInfo() {
        return Object.assign(super.getDebugInfo(), { value: this.valueWrapper });
    }
}

