import Player from '../Player';
import { PrintedPower } from './propertyMixins/PrintedPower';
import { LeaderCardNew } from './LeaderCardNew';
import { InitiateAttackAction } from '../../actions/InitiateAttackAction';
import Contract from '../utils/Contract';
import { CardType, Location } from '../Constants';
import { Damage } from './propertyMixins/Damage';
import { Cost } from './propertyMixins/Cost';
import { UnitProperties } from './propertyMixins/UnitProperties';

const LeaderUnitCardParent = UnitProperties(Cost(LeaderCardNew));

export class LeaderUnitCard extends LeaderUnitCardParent {
    private _isDeployed = false;

    public get isDeployed() {
        return this._isDeployed;
    }

    public constructor(owner: Player, cardData: any) {
        super(owner, cardData);

        this.defaultActions.push(new InitiateAttackAction(this.generateOriginalCard()));

        // leaders are always in a zone where they are allowed to be exhausted
        this.enableExhaust(true);
    }

    public override isUnit() {
        return this._isDeployed;
    }

    public override isLeaderUnit() {
        return this._isDeployed;
    }

    protected override initializeForCurrentLocation(prevLocation: Location): void {
        super.initializeForCurrentLocation(prevLocation);

        switch (this.location) {
            case Location.GroundArena || Location.SpaceArena:
                this._isDeployed = true;
                this.enableDamage(true);
                break;

            case Location.Base:
                this._isDeployed = false;
                this.enableDamage(false);
                break;
        }
    }

    // TODO: where to put code that handles defeat for leader vs token vs normal card?
}