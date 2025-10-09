import type { IAbilityPropsWithType, IActionAbilityPropsWithGainCondition, IAttachCardContext, IConstantAbilityProps, IConstantAbilityPropsWithGainCondition, IDamagePreventionEffectAbilityPropsWithGainCondition, IEpicActionProps, IEventAbilityProps, IKeywordPropertiesWithGainCondition, IPlayRestrictionAbilityProps, IReplacementEffectAbilityPropsWithGainCondition, ITriggeredAbilityBaseProps, ITriggeredAbilityBasePropsWithGainCondition, ITriggeredAbilityPropsWithGainCondition } from '../../Interfaces';
import type { BaseCard } from './BaseCard';
import type { IDecreaseCostAbilityProps, IIgnoreAllAspectPenaltiesProps, IIgnoreSpecificAspectPenaltyProps } from './baseClasses/PlayableOrDeployableCard';
import type { Card } from './Card';
import type { DoubleSidedLeaderCard } from './DoubleSidedLeaderCard';
import type { EventCard } from './EventCard';
import type { LeaderUnitCard, LeaderUnitCardInternal } from './LeaderUnitCard';
import type { NonLeaderUnitCard } from './NonLeaderUnitCard';
import type { IActionAbilityRegistrar } from './propertyMixins/ActionAbilityRegistration';
import type { IConstantAbilityRegistrar } from './propertyMixins/ConstantAbilityRegistration';
import type { ILeaderCard } from './propertyMixins/LeaderProperties';
import type { IPreEnterPlayAbilityRegistrar } from './propertyMixins/PreEnterPlayAbilityRegistration';
import type { ITriggeredAbilityRegistrar } from './propertyMixins/TriggeredAbilityRegistration';
import type { IUnitAbilityRegistrar, IUnitCard } from './propertyMixins/UnitProperties';
import type { UpgradeCard } from './UpgradeCard';

export type IBasicAbilityRegistrar<T extends Card> =
  ITriggeredAbilityRegistrar<T> &
  IConstantAbilityRegistrar<T> &
  IActionAbilityRegistrar<T> &
  IPreEnterPlayAbilityRegistrar<T>;

export interface IInPlayCardAbilityRegistrar<T extends Card> extends IBasicAbilityRegistrar<T> {
    addDecreaseCostAbility(properties: IDecreaseCostAbilityProps<T>): void;
    addWhenPlayedAbility(properties: ITriggeredAbilityBaseProps<T>): void;
    addWhenDefeatedAbility(properties: ITriggeredAbilityBaseProps<T>): void;
    addIgnoreAllAspectPenaltiesAbility(properties: IIgnoreAllAspectPenaltiesProps<T>): void;
    addIgnoreSpecificAspectPenaltyAbility(properties: IIgnoreSpecificAspectPenaltyProps<T>): void;
}

export type ILeaderAbilityRegistrar<T extends ILeaderCard> = IBasicAbilityRegistrar<T>;

export type INonLeaderUnitAbilityRegistrar = IBasicAbilityRegistrar<NonLeaderUnitCard> & IUnitAbilityRegistrar<NonLeaderUnitCard>;

export type ILeaderUnitLeaderSideAbilityRegistrar = ILeaderAbilityRegistrar<LeaderUnitCard> & {
    addCoordinateAbility(properties: IAbilityPropsWithType<LeaderUnitCard>): void;
    addPilotDeploy(): void;
};

export type ILeaderUnitAbilityRegistrar = ILeaderAbilityRegistrar<LeaderUnitCardInternal> & IUnitAbilityRegistrar<LeaderUnitCardInternal>;

export type IDoubleSidedLeaderAbilityRegistrar = ILeaderAbilityRegistrar<DoubleSidedLeaderCard>;

export type IUpgradeAbilityRegistrar = IBasicAbilityRegistrar<UpgradeCard> &
  IInPlayCardAbilityRegistrar<UpgradeCard> & {
      addConstantAbilityTargetingAttached(properties: Pick<IConstantAbilityProps<UpgradeCard>, 'title' | 'condition' | 'matchTarget' | 'ongoingEffect'>): void;
      addGainConstantAbilityTargetingAttached(properties: IConstantAbilityPropsWithGainCondition<UpgradeCard, IUnitCard>): void;
      addGainTriggeredAbilityTargetingAttached(properties: ITriggeredAbilityPropsWithGainCondition<UpgradeCard, IUnitCard>): void;
      addReplacementEffectAbilityTargetingAttached(properties: IReplacementEffectAbilityPropsWithGainCondition<UpgradeCard, IUnitCard>): void;
      addDamagePreventionAbilityTargetingAttached(properties: IDamagePreventionEffectAbilityPropsWithGainCondition<UpgradeCard, IUnitCard>): void;
      addGainActionAbilityTargetingAttached(properties: IActionAbilityPropsWithGainCondition<UpgradeCard, IUnitCard>): void;
      addGainOnAttackAbilityTargetingAttached(properties: ITriggeredAbilityBasePropsWithGainCondition<UpgradeCard, IUnitCard>): void;
      addGainWhenDefeatedAbilityTargetingAttached(properties: ITriggeredAbilityBasePropsWithGainCondition<UpgradeCard, IUnitCard>): void;
      addGainKeywordTargetingAttached(properties: IKeywordPropertiesWithGainCondition<UpgradeCard>): void;
      setAttachCondition(attachCondition: (context: IAttachCardContext<UpgradeCard>) => boolean): void;
  };

export type IBaseAbilityRegistrar = IBasicAbilityRegistrar<BaseCard> & {
    setEpicActionAbility(properties: IEpicActionProps<BaseCard>): void;
};

export type IEventAbilityRegistrar = IBasicAbilityRegistrar<EventCard> & {
    setEventAbility(properties: IEventAbilityProps): void;
    addDecreaseCostAbility(properties: IDecreaseCostAbilityProps<EventCard>): void;
    addPlayRestrictionAbility(properties: IPlayRestrictionAbilityProps): void;
};