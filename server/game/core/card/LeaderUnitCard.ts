import Player from '../Player';
import { LeaderCard } from './LeaderCard';
import { InitiateAttackAction } from '../../actions/InitiateAttackAction';
import { CardType, Location } from '../Constants';
import { WithCost } from './propertyMixins/Cost';
import { WithUnitProperties } from './propertyMixins/UnitProperties';
import type { UnitCard } from './CardTypes';

const LeaderUnitCardParent = WithUnitProperties(WithCost(LeaderCard));

// TODO LEADERS: add custom defeat logic
export class LeaderUnitCard extends LeaderUnitCardParent {
    private _isDeployed = false;

    public get isDeployed() {
        return this._isDeployed;
    }

    public override get type() {
        return this._isDeployed ? CardType.LeaderUnit : CardType.Leader;
    }

    public constructor(owner: Player, cardData: any) {
        super(owner, cardData);

        this.defaultActions.push(new InitiateAttackAction(this));

        // leaders are always in a zone where they are allowed to be exhausted
        this.enableExhaust(true);
    }

    public override isUnit(): this is UnitCard {
        return this._isDeployed;
    }

    public override isLeaderUnit(): this is LeaderUnitCard {
        return this._isDeployed;
    }

    protected override initializeForCurrentLocation(prevLocation: Location): void {
        super.initializeForCurrentLocation(prevLocation);

        switch (this.location) {
            case Location.GroundArena:
            case Location.SpaceArena:
                this._isDeployed = true;
                this.enableDamage(true);
                break;

            case Location.Base:
                this._isDeployed = false;
                this.enableDamage(false);
                break;
        }
    }
}