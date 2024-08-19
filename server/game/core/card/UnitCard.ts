import Player from '../Player';
import { PrintedHp } from './propertyMixins/PrintedHp';
import { NewCard } from './NewCard';
import { Cost } from './propertyMixins/Cost';
import { OngoingAbilities } from './propertyMixins/OngoingAbilities';
import { PrintedPower } from './propertyMixins/PrintedPower';
import { InitiateAttackAction } from '../../actions/InitiateAttackAction';
import { PlayUnitAction } from '../../actions/PlayUnitAction';
import Contract from '../utils/Contract';
import { CardType, Location } from '../Constants';
import { Damage } from './propertyMixins/Damage';
import { PlayableOrDeployableCard } from './PlayableOrDeployableCard';

const UnitCardParent = OngoingAbilities(PrintedPower(Damage(Cost(PlayableOrDeployableCard))));

export class UnitCard extends UnitCardParent {
    public constructor(
        owner: Player,
        cardData: any
    ) {
        super(owner, cardData);
        Contract.assertFalse(this.printedTypes.has(CardType.Unit));

        this.defaultActions.push(new InitiateAttackAction(this.generateOriginalCard()));
        this.defaultActions.push(new PlayUnitAction(this.generateOriginalCard()));
    }

    public override isUnit() {
        return true;
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