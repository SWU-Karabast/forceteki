import type { IEpicActionProps } from '../../Interfaces';
import type { BaseCard } from './BaseCard';
import type { Card } from './Card';
import type { INonLeaderUnitCard } from './NonLeaderUnitCard';
import type { IActionAbilityRegistrar } from './propertyMixins/ActionAbilityRegistration';
import type { IConstantAbilityRegistrar } from './propertyMixins/ConstantAbilityRegistration';
import type { ITriggeredAbilityRegistrar } from './propertyMixins/TriggeredAbilityRegistration';
import type { UpgradeCard } from './UpgradeCard';

export type IBasicAbilityRegistrar<T extends Card> =
  ITriggeredAbilityRegistrar<T> &
  IConstantAbilityRegistrar<T> &
  IActionAbilityRegistrar<T>;

export type INonLeaderUnitAbilityRegistrar = IBasicAbilityRegistrar<INonLeaderUnitCard>;

export type IUpgradeAbilityRegistrar = IBasicAbilityRegistrar<UpgradeCard>;

export type IBaseAbilityRegistrar = IBasicAbilityRegistrar<BaseCard> & {
    setEpicActionAbility(properties: IEpicActionProps<BaseCard>): void;
};
