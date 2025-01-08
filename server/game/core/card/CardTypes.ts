import type { BaseCard } from './BaseCard';
import type { InPlayCard } from './baseClasses/InPlayCard';
import type { EventCard } from './EventCard';
import type { LeaderCard } from './LeaderCard';
import type { LeaderUnitCard } from './LeaderUnitCard';
import type { NonLeaderUnitCard } from './NonLeaderUnitCard';
import type { TokenUnitCard, TokenUpgradeCard } from './TokenCards';
import type { UpgradeCard } from './UpgradeCard';

export type UnitCard =
  NonLeaderUnitCard |
  LeaderUnitCard |
  TokenUnitCard;

export type TokenCard =
  TokenUpgradeCard |
  TokenUnitCard;

export type CardWithDamageProperty =
  NonLeaderUnitCard |
  LeaderUnitCard |
  TokenUnitCard |
  BaseCard;

export type CardWithPrintedHp =
  NonLeaderUnitCard |
  LeaderUnitCard |
  TokenUnitCard |
  BaseCard |
  UpgradeCard |
  TokenUpgradeCard;

export type CardWithPrintedPower =
  NonLeaderUnitCard |
  LeaderUnitCard |
  TokenUnitCard |
  UpgradeCard |
  TokenUpgradeCard;

export type CardWithCost =
  NonLeaderUnitCard |
  LeaderUnitCard |
  TokenUnitCard |
  UpgradeCard |
  TokenUpgradeCard |
  EventCard;

export type CardWithTriggeredAbilities = InPlayCard;
export type CardWithConstantAbilities = InPlayCard;

export type CardWithExhaustProperty = PlayableOrDeployableCardTypes;

export type AnyCard =
  BaseCard |
  EventCard |
  UpgradeCard |
  TokenUpgradeCard |
  LeaderCard |
  NonLeaderUnitCard |
  LeaderUnitCard |
  TokenUnitCard;

// TODO TYPE REFACTOR: tokens should be separable from playable cards in the type hierarchy
/** Type union for any card type that can be played or created (not deployed) */
export type TokenOrPlayableCard =
  EventCard |
  UpgradeCard |
  NonLeaderUnitCard;

// Base is the only type of card that isn't in the PlayableOrDeployable subclass
type PlayableOrDeployableCardTypes = Exclude<AnyCard, BaseCard>;
