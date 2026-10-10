import type { IAnimationDescriptor } from './AnimationTypes';
import { damageAnimation } from './descriptors/DamageAnimation';
import { defeatAnimation } from './descriptors/DefeatAnimation';

/**
 * The registered animation descriptors.
 *
 * To add an animation: write a descriptor in `descriptors/` and list it here. Game systems are not
 * touched — they already emit the engine events descriptors listen to. Shared event lookups live
 * in `AnimationHelpers.ts`.
 */
export function buildAnimationDescriptors(): IAnimationDescriptor[] {
    return [damageAnimation, defeatAnimation];
}
