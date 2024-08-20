import { BaseCard } from './BaseCard';
import { EventCard } from './EventCard';
import { LeaderCard } from './LeaderCard';
import { LeaderUnitCard } from './LeaderUnitCard';
import { NonLeaderUnitCard } from './NonLeaderUnitCard';
import { TokenNonLeaderUnitCard, TokenUpgradeCard } from './TokenCards';
import { UpgradeCard } from './UpgradeCard';

export type UnitCard =
    NonLeaderUnitCard |
    LeaderUnitCard |
    TokenNonLeaderUnitCard;

export type CardWithHp =
    NonLeaderUnitCard |
    LeaderUnitCard |
    TokenNonLeaderUnitCard |
    BaseCard;

export type CardWithExhaustProperty = PlayableOrDeployableCard;

export type AnyCard =
    BaseCard |
    EventCard |
    UpgradeCard |
    TokenUpgradeCard |
    LeaderCard |
    NonLeaderUnitCard |
    LeaderUnitCard |
    TokenNonLeaderUnitCard;

// Base is the only type of card that isn't in the PlayableOrDeployable subclass
type PlayableOrDeployableCard = Exclude<AnyCard, BaseCard>;