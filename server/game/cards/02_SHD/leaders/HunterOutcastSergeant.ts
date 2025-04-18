import AbilityHelper from '../../../AbilityHelper';
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

    protected override setupLeaderSideAbilities() {
        this.addActionAbility({
            title: 'Reveal a resource you control. If it shares a name with a friendly unique unit, return the resource to its owner’s hand and put the top card of your deck into play as a resource',
            cost: [AbilityHelper.costs.exhaustSelf(), AbilityHelper.costs.abilityActivationResourceCost(1)],
            targetResolver: this.hunterAbility()
        });
    }

    protected override setupLeaderUnitSideAbilities() {
        this.addOnAttackAbility({
            title: 'Reveal a resource you control. If it shares a name with a friendly unique unit, return the resource to its owner’s hand and put the top card of your deck into play as a resource',
            optional: true,
            targetResolver: this.hunterAbility()
        });
    }

    private hunterAbility(): ICardTargetResolver<TriggeredAbilityContext<this>> {
        return {
            zoneFilter: ZoneName.Resource,
            controller: RelativePlayer.Self,
            immediateEffect: AbilityHelper.immediateEffects.conditional({
                condition: (context) =>
                    context.player.getArenaUnits({ condition: (card) => card.unique })
                        .map((unit) => unit.title)
                        .includes(context.target?.title),
                onTrue: AbilityHelper.immediateEffects.simultaneous([
                    AbilityHelper.immediateEffects.returnToHand(),
                    AbilityHelper.immediateEffects.resourceCard((context) => ({ target: context.player.getTopCardOfDeck() }))
                ])
            }),
        };
    }
}
