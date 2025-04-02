import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Trait } from '../../../core/Constants';

export default class VanguardDroidBomber extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '3410014206',
            internalName: 'vanguard-droid-bomber'
        };
    }

    public override setupCardAbilities() {
        this.addWhenPlayedAbility({
            title: 'Deal 2 damage to an enemy base.',
            immediateEffect: AbilityHelper.immediateEffects.conditional((context) => ({
                condition: context.player.hasSomeArenaUnit({ otherThan: context.source, trait: Trait.Separatist }),
                onTrue: AbilityHelper.immediateEffects.damage({ amount: 2, target: context.player.opponent.base }),
            }))
        });
    }
}
