import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class JabbaTheHuttCunningDaimyo extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '5035052619',
            internalName: 'jabba-the-hutt#cunning-daimyo',
        };
    }

    public override setupCardAbilities() {
        this.addConstantAbility()

        this.addWhenPlayedAbility();
    }
}

JabbaTheHuttCunningDaimyo.implemented = true;
