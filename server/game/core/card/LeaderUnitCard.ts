import Player from '../Player';
import { Hp } from './propertyMixins/Hp';
import { Power } from './propertyMixins/Power';
import { LeaderCardNew } from './LeaderCardNew';
import { InitiateAttackAction } from '../../actions/InitiateAttackAction';
import Contract from '../utils/Contract';
import { CardType, Location } from '../Constants';

const LeaderUnitCardParent = Power(Hp(LeaderCardNew));

export class LeaderUnitCard extends LeaderUnitCardParent {
    public readonly isDeployed: boolean = false;

    public constructor(
        owner: Player,
        cardData: any
    ) {
        super(owner, cardData);
        Contract.assertTrue(this.printedTypes.has(CardType.Unit));

        this.defaultActions.push(new InitiateAttackAction(this.generateOriginalCard()));
    }

    public override isUnit() {
        return this.isDeployed;
    }

    public override isLeaderUnit() {
        return this.isDeployed;
    }

    protected override initializeForCurrentLocation(prevLocation: Location): void {
        super.initializeForCurrentLocation(prevLocation);

        switch (this.location) {
            case Location.GroundArena || Location.SpaceArena:
                this.enableDamage(true);
                this.enableExhaust(true);
                break;

            case Location.Base:
                this.enableDamage(false);
                this.enableExhaust(true);
                break;
        }
    }

    // TODO: where to put code that handles defeat for leader vs token vs normal card?
}