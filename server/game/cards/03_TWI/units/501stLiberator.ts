import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Trait, ZoneName } from '../../../core/Constants';

export default class _501stLiberator extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '7252148824',
            internalName: '501st-liberator',
        };
    }

    public override setupCardAbilities () {
        this.addWhenPlayedAbility({
            title: 'Heal 3 damage from a base.',
            optional: true,
            targetResolver: {
                zoneFilter: ZoneName.Base,
                immediateEffect: AbilityHelper.immediateEffects.conditional({
                    condition: (context) => context.source.controller.isTraitInPlay(Trait.Republic, context.source),
                    onTrue: AbilityHelper.immediateEffects.heal({ amount: 3 }),
                    onFalse: AbilityHelper.immediateEffects.noAction()
                }),
            }
        });
    }
}
