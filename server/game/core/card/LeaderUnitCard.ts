import Player from '../Player';
import { Hp } from './propertyMixins/Hp';
import { Power } from './propertyMixins/Power';
import { LeaderCardNew } from './LeaderCardNew';
import { InitiateAttackAction } from '../../actions/InitiateAttackAction';
import Contract from '../utils/Contract';
import { CardType } from '../Constants';

const LeaderUnitCardParent = Power(Hp(LeaderCardNew));

export class LeaderUnitCard extends LeaderUnitCardParent {
    public readonly isDeployed: boolean = false;

    public constructor(
        owner: Player,
        cardData: any
    ) {
        super(owner, cardData);
        Contract.assertTrue(this.printedTypes.has(CardType.Unit));

        this._actions.push(new InitiateAttackAction(this.generateOriginalCard()));
    }

    public override isUnit() {
        return this.isDeployed;
    }

    public override isLeaderUnit() {
        return this.isDeployed;
    }

    // TODO: where to put code that handles defeat for leader vs token vs normal card?
}