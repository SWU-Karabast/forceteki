import { BaseCard } from './BaseCard';
import { EventCard } from './EventCard';
import { LeaderCard } from './LeaderCard';
import { LeaderUnitCard } from './LeaderUnitCard';
import { NonLeaderUnitCard } from './NonLeaderUnitCard';
import { TokenBasicUnitCard, TokenUpgradeCard } from './TokenCards';
import { UpgradeCard } from './UpgradeCard';

export type UnitCard =
    NonLeaderUnitCard |
    LeaderUnitCard |
    TokenBasicUnitCard;

export type CardWithDamageProperty =
    NonLeaderUnitCard |
    LeaderUnitCard |
    TokenBasicUnitCard |
    BaseCard;

export type CardWithPrintedHp =
    NonLeaderUnitCard |
    LeaderUnitCard |
    TokenBasicUnitCard |
    BaseCard |
    UpgradeCard |
    TokenUpgradeCard;

export type CardWithPrintedPower =
    NonLeaderUnitCard |
    LeaderUnitCard |
    TokenBasicUnitCard |
    UpgradeCard |
    TokenUpgradeCard;

export type CardWithTriggeredAbilities = InPlayCard;
export type CardWithConstantAbilities = InPlayCard;

export type CardWithExhaustProperty = PlayableOrDeployableCard;

export type AnyCard =
    BaseCard |
    EventCard |
    UpgradeCard |
    TokenUpgradeCard |
    LeaderCard |
    NonLeaderUnitCard |
    LeaderUnitCard |
    TokenBasicUnitCard;

// Base is the only type of card that isn't in the PlayableOrDeployable subclass
type PlayableOrDeployableCard = Exclude<AnyCard, BaseCard>;

type InPlayCard = Exclude<AnyCard, BaseCard | EventCard>;
