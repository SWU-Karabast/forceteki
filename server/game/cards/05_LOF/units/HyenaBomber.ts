import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Aspect, ZoneName } from '../../../core/Constants';

export default class HyenaBomber extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '1022691467',
            internalName: 'hyena-bomber'
        };
    }

    public override setupCardAbilities () {
        this.addWhenPlayedAbility({
            title: 'Deal 2 damage to a ground unit if you control another aggression unit',
            optional: true,
            targetResolver: {
                zoneFilter: ZoneName.GroundArena,
                immediateEffect: AbilityHelper.immediateEffects.conditional({
                    condition: (context) => context.player.isAspectInPlay(Aspect.Aggression, context.source),
                    onTrue: AbilityHelper.immediateEffects.damage({ amount: 2 }),
                })
            },
        });
    }
}