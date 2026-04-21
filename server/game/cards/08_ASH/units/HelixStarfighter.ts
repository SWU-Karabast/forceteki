import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { ZoneName } from '../../../core/Constants';

export default class HelixStarfighter extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'helix-starfighter-id',
            internalName: 'helix-starfighter',
        };
    }

    public override setupCardAbilities (registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'If an opponent controls a space unit, give a Shield token to this unit. Otherwise, give 2 Advantage tokens to this unit',
            immediateEffect: abilityHelper.immediateEffects.conditional({
                condition: (context) => context.player.opponent.hasSomeArenaUnit({ arena: ZoneName.SpaceArena }),
                onTrue: abilityHelper.immediateEffects.giveShield((context) => ({
                    target: context.source
                })),
                onFalse: abilityHelper.immediateEffects.giveAdvantage((context) => ({
                    target: context.source,
                    amount: 2
                }))
            })
        });
    }
}