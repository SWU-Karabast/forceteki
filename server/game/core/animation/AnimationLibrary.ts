import type { IAnimationDescriptor } from './AnimationTypes';
import { damageAnimation } from './descriptors/DamageAnimation';
import { defeatAnimation } from './descriptors/DefeatAnimation';

/** Returns every registered animation descriptor. */
export function buildAnimationDescriptors(): IAnimationDescriptor[] {
    return [damageAnimation, defeatAnimation];
}
