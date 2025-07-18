import type { IAbilityHelper } from '../../../AbilityHelper';
import type { ILeaderUnitAbilityRegistrar, ILeaderUnitLeaderSideAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { RelativePlayer, ZoneName } from '../../../core/Constants';
import type { ICardTargetResolver } from '../../../TargetInterfaces';
import type { TriggeredAbilityContext } from '../../../core/ability/TriggeredAbilityContext';

export default class HunterOutcastSergeant extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '8709191884',
            internalName: 'hunter#outcast-sergeant',
        };
    }

    protected override setupLeaderSideAbilities(registrar: ILeaderUnitLeaderSideAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addActionAbility({
            title: 'Reveal a resource you control. If it shares a name with a friendly unique unit, return the resource to its owner’s hand and put the top card of your deck into play as a resource',
            cost: [AbilityHelper.costs.exhaustSelf(), AbilityHelper.costs.abilityActivationResourceCost(1)],
            targetResolver: this.hunterAbility(AbilityHelper)
        });
    }

    protected override setupLeaderUnitSideAbilities(registrar: ILeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addOnAttackAbility({
            title: 'Reveal a resource you control. If it shares a name with a friendly unique unit, return the resource to its owner’s hand and put the top card of your deck into play as a resource',
            optional: true,
            targetResolver: this.hunterAbility(AbilityHelper)
        });
    }

    private hunterAbility(AbilityHelper: IAbilityHelper): ICardTargetResolver<TriggeredAbilityContext<this>> {
        return {
            zoneFilter: ZoneName.Resource,
            controller: RelativePlayer.Self,
            immediateEffect: AbilityHelper.immediateEffects.sequential([
                AbilityHelper.immediateEffects.reveal({
                    promptedPlayer: RelativePlayer.Opponent,
                    useDisplayPrompt: true
                }),
                AbilityHelper.immediateEffects.conditional({
                    condition: (context) =>
                        context.player.getArenaUnits({ condition: (card) => card.unique })
                            .map((unit) => unit.title)
                            .includes(context.target?.title),
                    onTrue: AbilityHelper.immediateEffects.simultaneous([
                        AbilityHelper.immediateEffects.returnToHand(),
                        AbilityHelper.immediateEffects.resourceCard((context) => ({ target: context.player.getTopCardOfDeck() }))
                    ])
                })
            ])
        };
    }
}
