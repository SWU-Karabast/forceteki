import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { IAbilityHelper } from '../../../AbilityHelper';

export default class JarJarBinksBumblingRepresentative extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'jar-jar-binks#bumbling-representative-id',
            internalName: 'jar-jar-binks#bumbling-representative',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addOnAttackAbility({
            title: 'Discard a card from your deck. If it costs 6 or more, this unit gets +4/+0 for this attack',
            immediateEffect: abilityHelper.immediateEffects.discardFromDeck((c) => ({
                amount: 1,
                target: c.player,
            })),
            ifYouDo: (ifYouDoContext) => ({
                title: 'This unit gets +4/+0 for this attack',
                ifYouDoCondition: () => (ifYouDoContext.events.length < 2 ? false : ifYouDoContext.events[0].card.cost >= 6),
                immediateEffect: abilityHelper.immediateEffects.forThisAttackCardEffect({
                    effect: abilityHelper.ongoingEffects.modifyStats({ power: 4, hp: 0 })
                })
            })
        });
    }
}