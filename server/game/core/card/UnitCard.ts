import Player from '../Player';
import { PrintedHp } from './propertyMixins/PrintedHp';
import { NewCard } from './NewCard';
import { Cost } from './propertyMixins/Cost';
import { PrintedPower } from './propertyMixins/PrintedPower';
import { InitiateAttackAction } from '../../actions/InitiateAttackAction';
import { PlayUnitAction } from '../../actions/PlayUnitAction';
import Contract from '../utils/Contract';
import { CardType, Location } from '../Constants';
import { Damage } from './propertyMixins/Damage';
import { PlayableOrDeployableCard } from './baseClasses/PlayableOrDeployableCard';
import { UnitProperties } from './propertyMixins/UnitProperties';
import { InPlayCard } from './baseClasses/InPlayCard';

const UnitCardParent = UnitProperties(Cost(InPlayCard));

export class UnitCard extends UnitCardParent {
    public constructor(owner: Player, cardData: any) {
        super(owner, cardData);

        // superclasses check that we are a unit, check here that we are a non-leader unit
        Contract.assertFalse(this.printedTypes.has(CardType.Leader));

        this.defaultActions.push(new PlayUnitAction(this.generateOriginalCard()));
    }

    public override isNonLeaderUnit() {
        return true;
    }

    protected override initializeForCurrentLocation(prevLocation: Location): void {
        super.initializeForCurrentLocation(prevLocation);

        switch (this.location) {
            case Location.GroundArena || Location.SpaceArena:
                this.enableDamage(true);
                this.enableExhaust(true);
                break;

            case Location.Resource:
                this.enableDamage(false);
                this.enableExhaust(true);
                break;

            default:
                this.enableDamage(false);
                this.enableExhaust(false);
                break;
        }
    }
}
