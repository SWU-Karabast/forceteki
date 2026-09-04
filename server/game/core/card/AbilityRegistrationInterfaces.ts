import type { IAbilityPropsWithType, IActionAbilityPropsWithGainCondition, IAttachCardContext, IConstantAbilityProps, IConstantAbilityPropsWithGainCondition, IDamageModificationEffectAbilityPropsWithGainCondition, IEpicActionProps, IEventAbilityProps, IKeywordPropertiesWithGainCondition, IPlayCostProperties, IPlayRestrictionAbilityProps, IReplacementEffectAbilityPropsWithGainCondition, ITriggeredAbilityBaseProps, ITriggeredAbilityBasePropsWithGainCondition, ITriggeredAbilityPropsWithGainCondition } from '../../Interfaces';
import type { BaseCard } from './BaseCard';
import type { ICardWithUpgrades } from './CardInterfaces';
import type { IDecreaseCostAbilityProps, IIgnoreAllAspectPenaltiesProps, IIgnoreSpecificAspectPenaltyProps } from './baseClasses/PlayableOrDeployableCard';
import type { Card } from './Card';
import type { DoubleSidedLeaderCard } from './DoubleSidedLeaderCard';
import type { EventCard } from './EventCard';
import type { LeaderUnitCard } from './LeaderUnitCard';
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
    addAdditionalPlayCost(properties: IPlayCostProperties<T>): void;
    addAlternatePlayCost(properties: IPlayCostProperties<T>): void;
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

export type ILeaderUnitAbilityRegistrar = ILeaderAbilityRegistrar<LeaderUnitCard> & IUnitAbilityRegistrar<LeaderUnitCard>;

export type IDoubleSidedLeaderAbilityRegistrar = ILeaderAbilityRegistrar<DoubleSidedLeaderCard>;

export type IUpgradeAbilityRegistrar = IBasicAbilityRegistrar<UpgradeCard> &
  IInPlayCardAbilityRegistrar<UpgradeCard> & {
      addConstantAbilityTargetingAttached(properties: Pick<IConstantAbilityProps<UpgradeCard>, 'title' | 'condition' | 'matchTarget' | 'ongoingEffect'>): void;
      addGainConstantAbilityTargetingAttached(properties: IConstantAbilityPropsWithGainCondition<UpgradeCard, IUnitCard>): void;
      addGainConstantAbilityTargetingAttached<TTarget extends ICardWithUpgrades>(properties: IConstantAbilityPropsWithGainCondition<UpgradeCard, TTarget>): void;
      addGainTriggeredAbilityTargetingAttached(properties: ITriggeredAbilityPropsWithGainCondition<UpgradeCard, IUnitCard>): void;
      addGainTriggeredAbilityTargetingAttached<TTarget extends ICardWithUpgrades>(properties: ITriggeredAbilityPropsWithGainCondition<UpgradeCard, TTarget>): void;
      addReplacementEffectAbilityTargetingAttached(properties: IReplacementEffectAbilityPropsWithGainCondition<UpgradeCard, IUnitCard>): void;
      addReplacementEffectAbilityTargetingAttached<TTarget extends ICardWithUpgrades>(properties: IReplacementEffectAbilityPropsWithGainCondition<UpgradeCard, TTarget>): void;
      addDamageModificationAbilityTargetingAttached(properties: IDamageModificationEffectAbilityPropsWithGainCondition<UpgradeCard, IUnitCard>): void;
      addDamageModificationAbilityTargetingAttached<TTarget extends ICardWithUpgrades>(properties: IDamageModificationEffectAbilityPropsWithGainCondition<UpgradeCard, TTarget>): void;
      addGainActionAbilityTargetingAttached(properties: IActionAbilityPropsWithGainCondition<UpgradeCard, IUnitCard>): void;
      addGainActionAbilityTargetingAttached<TTarget extends ICardWithUpgrades>(properties: IActionAbilityPropsWithGainCondition<UpgradeCard, TTarget>): void;
      addGainOnAttackAbilityTargetingAttached(properties: ITriggeredAbilityBasePropsWithGainCondition<UpgradeCard, IUnitCard>): void;
      addGainOnDefenseAbilityTargetingAttached(properties: ITriggeredAbilityBasePropsWithGainCondition<UpgradeCard, IUnitCard>): void;
      addGainWhenDefeatedAbilityTargetingAttached(properties: ITriggeredAbilityBasePropsWithGainCondition<UpgradeCard, IUnitCard>): void;
      addGainWhenAttackEndsAbilityTargetingAttached(properties: ITriggeredAbilityBasePropsWithGainCondition<UpgradeCard, IUnitCard>): void;
      addGainKeywordTargetingAttached(properties: IKeywordPropertiesWithGainCondition<UpgradeCard>): void;
      setAttachCondition(attachCondition: (context: IAttachCardContext<UpgradeCard>) => boolean): void;
  };

export type IBaseAbilityRegistrar = IBasicAbilityRegistrar<BaseCard> & {
    setEpicActionAbility(properties: IEpicActionProps<BaseCard>): void;
};

export type IEventAbilityRegistrar = IBasicAbilityRegistrar<EventCard> & {
    setEventAbility(properties: IEventAbilityProps): void;
    addAdditionalPlayCost(properties: IPlayCostProperties<EventCard>): void;
    addAlternatePlayCost(properties: IPlayCostProperties<EventCard>): void;
    addDecreaseCostAbility(properties: IDecreaseCostAbilityProps<EventCard>): void;
    addPlayRestrictionAbility(properties: IPlayRestrictionAbilityProps): void;
};