import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, Trait } from '../../../core/Constants';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class SidonIthanoTheCrimsonCorsair extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '0979322247',
            internalName: 'sidon-ithano#the-crimson-corsair',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: `Attach this unit as an upgrade to an enemy ${TextHelper.Trait.Vehicle} unit without a ${TextHelper.Trait.Pilot} on it`,
            contextTitle: (context) => `Attach ${context.source.title} as an upgrade to an enemy ${TextHelper.Trait.Vehicle} unit without a ${TextHelper.Trait.Pilot} on it`,
            optional: true,
            targetResolver: {
                controller: RelativePlayer.Opponent,
                cardCondition: (card) => card.isUnit() && card.hasSomeTrait(Trait.Vehicle) && !card.upgrades.some((upgrade) => upgrade.hasSomeTrait(Trait.Pilot)),
                immediateEffect: AbilityHelper.immediateEffects.attachUpgrade((context) => ({
                    upgrade: context.source,
                })),
            }
        });
    }
}