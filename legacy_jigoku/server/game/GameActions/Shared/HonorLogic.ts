import { EffectNames } from "../../Constants";

export function CalculateHonorLimit(player, round, phase, plannedHonorAmount): [boolean, number] {
    if(!player || !player.getEffects)
        return [false, plannedHonorAmount];

    const honorGainLimitPerPhase = Math.min(player.getEffects(EffectNames.LimitHonorGainPerPhase));
    const honorGainedThisPhase = player.honorGained(round, phase, true);

    const maxAmountToChange = Math.max(honorGainLimitPerPhase - honorGainedThisPhase, 0);
    const amountToChange = Math.min(plannedHonorAmount, maxAmountToChange);
    if(!honorGainLimitPerPhase)
        return [false, plannedHonorAmount];
    else
        return [true, amountToChange]
}