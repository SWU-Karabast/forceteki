import { type AbilityTypes, EffectNames } from '../../Constants';
import type {
    ActionProps,
    PersistentEffectProps,
    TriggeredAbilityProps,
    TriggeredAbilityWhenProps
} from '../../Interfaces';
import type CardEffect from '../CardEffect';
import { EffectBuilder } from '../EffectBuilder';
import GainAbility from '../GainAbility';

type Res = (game: any, source: any, props: any) => CardEffect;
export function gainAbility(abilityType: AbilityTypes.Action, properties: ActionProps): Res;
export function gainAbility(abilityType: AbilityTypes.DuelReaction, properties: TriggeredAbilityWhenProps): Res;
export function gainAbility(abilityType: AbilityTypes.Persistent, properties: PersistentEffectProps): Res;
export function gainAbility(abilityType: AbilityTypes.Reaction, properties: TriggeredAbilityProps): Res;
export function gainAbility(abilityType: AbilityTypes.WouldInterrupt, properties: TriggeredAbilityProps): Res;
export function gainAbility(abilityType: AbilityTypes.Interrupt, properties: TriggeredAbilityProps): Res;
export function gainAbility(abilityType: AbilityTypes.ForcedReaction, properties: TriggeredAbilityProps): Res;
export function gainAbility(abilityType: AbilityTypes.ForcedInterrupt, properties: TriggeredAbilityProps): Res;
export function gainAbility(
    abilityType: AbilityTypes,
    properties: ActionProps | TriggeredAbilityWhenProps | TriggeredAbilityProps | PersistentEffectProps
) {
    return EffectBuilder.card.static(EffectNames.GainAbility, new GainAbility(abilityType, properties));
}