import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { TargetMode } from '../../../core/Constants';

export default class TheCloneWars extends EventCard {
    protected override getImplementationId() {
        return {
            id: '2267524398',
            internalName: 'the-clone-wars'
        };
    }

    private readyResourcesCount(context): number {
        return context.player.resources.filter((card) => !card.exhausted).length;
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Pay any number of resources.',
            cannotTargetFirst: true,
            targetResolver: {
                mode: TargetMode.DropdownList,
                options: (context) => Array.from({ length: this.readyResourcesCount(context) + 1 }, (x, i) => `${i}`),
                condition: (context) => this.readyResourcesCount(context) > 0   // skip ability if there is no resources available
            },
            then: (thenContext) => ({
                thenCondition: (context) => this.readyResourcesCount(context) > 0,
                title: 'Create that many Clone Trooper tokens. Each opponent creates that many Battle Droid tokens.',
                immediateEffect: AbilityHelper.immediateEffects.sequential([
                    AbilityHelper.immediateEffects.payResourceCost({
                        amount: parseInt(thenContext.select),
                        target: thenContext.player
                    }),
                    AbilityHelper.immediateEffects.createCloneTrooper({
                        amount: parseInt(thenContext.select),
                        target: thenContext.player
                    }),
                    AbilityHelper.immediateEffects.createBattleDroid({
                        amount: parseInt(thenContext.select),
                        target: thenContext.player.opponent
                    })
                ])
            })
        });
    }
}
