import type { AbilityType } from '../Constants';
import type { IConstantAbility } from '../ongoingEffect/IConstantAbility';
import type { ActionAbility } from './ActionAbility';
import type TriggeredAbility from './TriggeredAbility';

interface IAbilityWithTypeBase {
    type: AbilityType;
    ability: ActionAbility | IConstantAbility | TriggeredAbility;
}

export interface IActionAbilityWithType extends IAbilityWithTypeBase {
    type: AbilityType.Action;
    ability: ActionAbility;
}

export interface IConstantAbilityWithType extends IAbilityWithTypeBase {
    type: AbilityType.Constant;
    ability: IConstantAbility;
}

export interface ITriggeredAbilityWithType extends IAbilityWithTypeBase {
    type: AbilityType.Triggered;
    ability: TriggeredAbility;
}

export type IAbilityWithType =
  | IActionAbilityWithType
  | IConstantAbilityWithType
  | ITriggeredAbilityWithType;
