import { BaseCard } from './BaseCard';
import { Card } from './Card';
import { EventCard } from './EventCard';
import { LeaderCard } from './LeaderCard';
import { LeaderUnitCard } from './LeaderUnitCard';
import { NonLeaderUnitCard } from './NonLeaderUnitCard';
import { TokenUnitCard, TokenUpgradeCard } from './TokenCards';
import { UpgradeCard } from './UpgradeCard';

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

/** Type union for any card type that can be played (not deployed) */
export type PlayableCard =
  EventCard |
  UpgradeCard |
  NonLeaderUnitCard;

export function isPlayable(card: Card): card is PlayableCard {
    return card.isEvent() || card.isNonLeaderUnit() || card.isUpgrade();
}

// Base is the only type of card that isn't in the PlayableOrDeployable subclass
type PlayableOrDeployableCardTypes = Exclude<AnyCard, BaseCard>;

export type InPlayCard = Exclude<AnyCard, BaseCard | EventCard>;
