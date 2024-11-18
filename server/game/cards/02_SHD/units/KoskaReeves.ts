import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { ZoneName, WildcardCardType } from '../../../core/Constants';

export default class KoskaReeves extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '9951020952',
            internalName: 'koska-reeves#loyal-nite-owl'
        };
    }

    public override setupCardAbilities () {
        this.addOnAttackAbility({
            title: 'Deal 2 damage to a ground unit if Koska Reeves is upgraded',
            targetResolver: {
                optional: true,
                zoneFilter: ZoneName.GroundArena,
                immediateEffect: AbilityHelper.immediateEffects.conditional({
                    condition: (context) => context.source.isUpgraded(),
                    onTrue: AbilityHelper.immediateEffects.damage({ amount: 2 }),
                    onFalse: AbilityHelper.immediateEffects.noAction()
                })
            },
        });
    }
}

KoskaReeves.implemented = true;
