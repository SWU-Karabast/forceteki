import Player from '../Player';
import { WithCost } from './propertyMixins/Cost';
import { PlayUnitAction } from '../../actions/PlayUnitAction';
import * as Contract from '../utils/Contract';
import { CardType, KeywordName, ZoneName, PlayType } from '../Constants';
import { WithUnitProperties } from './propertyMixins/UnitProperties';
import { InPlayCard } from './baseClasses/InPlayCard';
import { WithStandardAbilitySetup } from './propertyMixins/StandardAbilitySetup';
import PlayerOrCardAbility from '../ability/PlayerOrCardAbility';
import { TokenOrPlayableCard } from './CardTypes';
import { IPlayCardActionProperties, PlayCardAction } from '../ability/PlayCardAction';

const NonLeaderUnitCardParent = WithUnitProperties(WithCost(WithStandardAbilitySetup(InPlayCard)));

export class NonLeaderUnitCard extends NonLeaderUnitCardParent {
    public constructor(owner: Player, cardData: any) {
        super(owner, cardData);

        // superclasses check that we are a unit, check here that we are a non-leader unit
        Contract.assertFalse(this.printedType === CardType.Leader);
    }

    public override isNonLeaderUnit(): this is NonLeaderUnitCard {
        return true;
    }

    protected override buildPlayCardAction(properties: Omit<IPlayCardActionProperties, 'card'>) {
        return new PlayUnitAction({ card: this, ...properties });
    }

    public override isTokenOrPlayable(): this is TokenOrPlayableCard {
        return true;
    }

    protected override initializeForCurrentZone(prevZone?: ZoneName): void {
        super.initializeForCurrentZone(prevZone);

        switch (this.zoneName) {
            case ZoneName.GroundArena:
            case ZoneName.SpaceArena:
                this.setActiveAttackEnabled(true);
                this.setDamageEnabled(true);
                this.setExhaustEnabled(true);
                this.setUpgradesEnabled(true);
                this.setCaptureZoneEnabled(true);
                break;

            case ZoneName.Resource:
                this.setActiveAttackEnabled(false);
                this.setDamageEnabled(false);
                this.setExhaustEnabled(true);
                this.setUpgradesEnabled(false);
                this.setCaptureZoneEnabled(false);
                break;

            default:
                this.setActiveAttackEnabled(false);
                this.setDamageEnabled(false);
                this.setExhaustEnabled(false);
                this.setUpgradesEnabled(false);
                this.setCaptureZoneEnabled(false);
                break;
        }
    }
}
