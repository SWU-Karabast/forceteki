import Player from '../Player';
import { LeaderCard } from './LeaderCard';
import { InitiateAttackAction } from '../../actions/InitiateAttackAction';
import { Location } from '../Constants';
import { Cost } from './propertyMixins/Cost';
import { UnitProperties } from './propertyMixins/UnitProperties';

const LeaderUnitCardParent = UnitProperties(Cost(LeaderCard));

export class LeaderUnitCard extends LeaderUnitCardParent {
    private _isDeployed = false;

    public get isDeployed() {
        return this._isDeployed;
    }

    public constructor(owner: Player, cardData: any) {
        super(owner, cardData);

        this.defaultActions.push(new InitiateAttackAction(this));

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