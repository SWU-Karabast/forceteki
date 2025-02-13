import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import { TargetMode } from '../../../core/Constants';

export default class TheCloneWars extends EventCard {
    protected override getImplementationId() {
        return {
            id: '2267524398',
            internalName: 'the-clone-wars'
        };
    }

    private _readyResourcesCount(context): number {
        return context.source.controller.resources.filter((card) => !card.exhausted).length;
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'Pay any number of resources.',
            targetResolver: {
                mode: TargetMode.DropdownList,
                options: (context) => Array.from({ length: this._readyResourcesCount(context) + 1 }, (x, i) => `${i}`),
                condition: (context) => this._readyResourcesCount(context) > 0   // skip ability if there is no resources available
            },
            then: (thenContext) => ({
                title: 'Create that many Clone Trooper tokens. Each opponent creates that many Battle Droid tokens.',
                immediateEffect: AbilityHelper.immediateEffects.sequential([
                    AbilityHelper.immediateEffects.payResourceCost({
                        amount: parseInt(thenContext.select),
                        target: thenContext.source.controller,
                    }),
                    AbilityHelper.immediateEffects.createCloneTrooper({
                        amount: parseInt(thenContext.select),
                        target: thenContext.source.controller
                    }),
                    AbilityHelper.immediateEffects.createBattleDroid({
                        amount: parseInt(thenContext.select),
                        target: thenContext.source.controller.opponent
                    })
                ])
            })
        });
    }
}
