import type { AbilityContext } from '../../core/ability/AbilityContext';
import type { FormatMessage } from '../../core/chat/GameChat';
import { Duration, EffectName } from '../../core/Constants';
import type { ILastingEffectPropertiesBase } from '../../core/gameSystem/LastingEffectPropertiesBase';
import type { IOngoingCardOrPlayerEffect, IOngoingCardOrPlayerEffectGenerator, IOngoingCardOrPlayerEffectProps } from '../../Interfaces';
import * as ChatHelpers from '../../core/chat/ChatHelpers';
import * as Contract from '../../core/utils/Contract';
import * as Helpers from '../../core/utils/Helpers';
import type { GameSystem, IGameSystemProperties } from '../../core/gameSystem/GameSystem';

type Flatten<A> = A extends readonly (infer T)[] ? T : A;
type TargetOf<T extends IGameSystemProperties> = T['target'];

export function getEffectMessage<TContext extends AbilityContext, TProperties extends ILastingEffectPropertiesBase>(
    gameSystem: GameSystem<TContext, TProperties>,
    context: TContext,
    properties: TProperties,
    additionalProperties: Partial<TProperties> = {},
    getEffectFactoriesAndProperties: (target: TargetOf<TProperties>, context: TContext, additionalProperties?: Partial<TProperties>) => { effectFactories: IOngoingCardOrPlayerEffectGenerator<Flatten<TargetOf<TProperties>>>[]; effectProperties: IOngoingCardOrPlayerEffectProps<Flatten<TargetOf<TProperties>>> | IOngoingCardOrPlayerEffectProps<Flatten<TargetOf<TProperties>>>[] },
    filterApplicableEffects: (target: Flatten<TargetOf<TProperties>>, effects: IOngoingCardOrPlayerEffect<Flatten<TargetOf<TProperties>>>[], context: TContext) => IOngoingCardOrPlayerEffect<Flatten<TargetOf<TProperties>>>[] = (_target, effects) => effects,
): [string, any[]] {
    const targetDescription = properties.ongoingEffectTargetDescription ?? gameSystem.getTargetMessage(properties.target, context);

    let description: FormatMessage = { format: 'apply a lasting effect to {0}', args: [targetDescription] };
    if (properties.ongoingEffectDescription) {
        description.format = `${properties.ongoingEffectDescription} {0}`;
    } else if (properties.target && Array.isArray(properties.target)) {
        const { effectFactories, effectProperties } = getEffectFactoriesAndProperties(properties.target, context, additionalProperties);
        const abilityRestrictions: FormatMessage[] = [];
        const cloneEffects: FormatMessage[] = [];
        const otherEffects: FormatMessage[] = [];
        for (const factory of effectFactories) {
            for (const [i, props] of Helpers.asArray(effectProperties).entries()) {
                const effect = factory(context.game, context.source, props);
                if (effect.impl.effectDescription && filterApplicableEffects(properties.target[i] as any, [effect], context).length > 0) {
                    if (effect.impl.type === EffectName.AbilityRestrictions) {
                        abilityRestrictions.push(effect.impl.effectDescription);
                    } else if (effect.impl.type === EffectName.CloneUnit) {
                        cloneEffects.push(effect.impl.effectDescription);
                    } else {
                        otherEffects.push(effect.impl.effectDescription);
                    }
                    break;
                }
            }
        }

        const effectDescriptions: FormatMessage[] = [];
        if (cloneEffects.length > 0) {
            effectDescriptions.push({
                format: '{0}',
                args: [
                    { format: ChatHelpers.formatWithLength(cloneEffects.length, 'to '), args: cloneEffects },
                ]
            });
        }

        if (otherEffects.length > 0) {
            effectDescriptions.push({
                format: '{0} to {1}',
                args: [
                    { format: ChatHelpers.formatWithLength(otherEffects.length, 'to '), args: otherEffects },
                    targetDescription,
                ]
            });
        }
        if (abilityRestrictions.length > 0) {
            effectDescriptions.push({
                format: 'prevent {1} from {0}',
                args: [
                    { format: ChatHelpers.formatWithLength(abilityRestrictions.length), args: abilityRestrictions },
                    targetDescription,
                ]
            });
        }

        if (effectDescriptions.length > 0) {
            description = { format: ChatHelpers.formatWithLength(effectDescriptions.length, 'to '), args: effectDescriptions };
        }
    }

    let durationStr: string;
    switch (properties.duration) {
        case Duration.UntilEndOfAttack:
            durationStr = ' for this attack';
            break;
        case Duration.UntilEndOfPhase:
            durationStr = ' for this phase';
            break;
        case Duration.UntilEndOfRound:
            durationStr = ' for the rest of the round';
            break;
        case Duration.WhileSourceInPlay:
            durationStr = ' while in play';
            break;
        case Duration.Persistent:
        case Duration.Custom:
            durationStr = '';
            break;
        default:
            Contract.fail(`Unknown duration: ${(properties as any).duration}`);
    }

    return ['{0}{1}', [description, durationStr]];
}