import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { CardType, ZoneName } from '../../../core/Constants';

export default class JedhaAgitator extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '1746195484',
            internalName: 'jedha-agitator',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addOnAttackAbility({
            title: 'If you control a leader unit, deal 2 damage to a ground unit or base',
            targetResolver: {
                activePromptTitle: 'Deal 2 damage to a ground unit or base',
                cardCondition: (card) => (card.isUnit() && card.zoneName === ZoneName.GroundArena) || card.isBase(),
                immediateEffect: AbilityHelper.immediateEffects.conditional({
                    condition: (context) => context.player.hasSomeArenaCard({ type: CardType.LeaderUnit }),
                    onTrue: AbilityHelper.immediateEffects.damage({ amount: 2 }),
                })
            }
        });
    }
}
