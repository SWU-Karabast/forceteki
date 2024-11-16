import Player from '../Player';
import { WithCost } from './propertyMixins/Cost';
import { PlayUnitAction } from '../../actions/PlayUnitAction';
import * as Contract from '../utils/Contract';
import { CardType, KeywordName, Location, PlayType } from '../Constants';
import { WithUnitProperties } from './propertyMixins/UnitProperties';
import { InPlayCard } from './baseClasses/InPlayCard';
import { WithStandardAbilitySetup } from './propertyMixins/StandardAbilitySetup';
import PlayerOrCardAbility from '../ability/PlayerOrCardAbility';

const NonLeaderUnitCardParent = WithUnitProperties(WithCost(WithStandardAbilitySetup(InPlayCard)));

export class NonLeaderUnitCard extends NonLeaderUnitCardParent {
    public constructor(owner: Player, cardData: any) {
        super(owner, cardData);

        // superclasses check that we are a unit, check here that we are a non-leader unit
        Contract.assertFalse(this.printedType === CardType.Leader);

        this.defaultActions.push(new PlayUnitAction(this, PlayType.PlayFromHand, cardData.entersReady));
    }

    public override isNonLeaderUnit(): this is NonLeaderUnitCard {
        return true;
    }

    public override getActions(): PlayerOrCardAbility[] {
        const actions = super.getActions();

        if (this.location === Location.Resource && this.hasSomeKeyword(KeywordName.Smuggle)) {
            actions.push(new PlayUnitAction(this, PlayType.Smuggle));
        }
        return actions;
    }

    protected override initializeForCurrentLocation(prevLocation: Location): void {
        super.initializeForCurrentLocation(prevLocation);

        switch (this.location) {
            case Location.GroundArena:
            case Location.SpaceArena:
                this.setActiveAttackEnabled(true);
                this.setDamageEnabled(true);
                this.setExhaustEnabled(true);
                this.setUpgradesEnabled(true);
                break;

            case Location.Resource:
                this.setActiveAttackEnabled(false);
                this.setDamageEnabled(false);
                this.setExhaustEnabled(true);
                this.setUpgradesEnabled(false);
                break;

            default:
                this.setActiveAttackEnabled(false);
                this.setDamageEnabled(false);
                this.setExhaustEnabled(false);
                this.setUpgradesEnabled(false);
                break;
        }
    }
}
