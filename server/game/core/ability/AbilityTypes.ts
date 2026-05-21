import type { AbilityType } from '../Constants';
import type { IConstantAbility } from '../ongoingEffect/IConstantAbility';
import type { ActionAbilityBase } from './ActionAbility';
import type { TriggeredAbilityBase } from './TriggeredAbility';

interface IAbilityWithTypeBase {
    type: AbilityType;
    ability: ActionAbilityBase | IConstantAbility | TriggeredAbilityBase;
}

export interface IActionAbilityWithType extends IAbilityWithTypeBase {
    type: AbilityType.Action;
    ability: ActionAbilityBase;
}

export interface IConstantAbilityWithType extends IAbilityWithTypeBase {
    type: AbilityType.Constant;
    ability: IConstantAbility;
}

export interface ITriggeredAbilityWithType extends IAbilityWithTypeBase {
    type: AbilityType.Triggered;
    ability: TriggeredAbilityBase;
}

export type IAbilityWithType =
  | IActionAbilityWithType
  | IConstantAbilityWithType
  | ITriggeredAbilityWithType;
