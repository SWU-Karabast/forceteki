import type { IEpicActionProps, IEventAbilityProps } from '../../Interfaces';
import type { BaseCard } from './BaseCard';
import type { IDecreaseCostAbilityProps } from './baseClasses/PlayableOrDeployableCard';
import type { Card } from './Card';
import type { EventCard } from './EventCard';
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

export type IEventAbilityRegistrar = IBasicAbilityRegistrar<EventCard> & {
    setEventAbility(properties: IEventAbilityProps): void;
    addDecreaseCostAbility(properties: IDecreaseCostAbilityProps<EventCard>): void;
};