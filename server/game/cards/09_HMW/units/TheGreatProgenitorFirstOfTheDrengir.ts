import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { IAbilityHelper } from '../../../AbilityHelper';
import type { AbilityContext } from '../../../core/ability/AbilityContext';
import type { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import type { CardsLeftPlayThisPhaseWatcher } from '../../../stateWatchers/CardsLeftPlayThisPhaseWatcher';
import { Helpers } from '../../../core/utils/Helpers';

export default class TheGreatProgenitorFirstOfTheDrengir extends NonLeaderUnitCard {
    private cardsLeftPlayThisPhase: CardsLeftPlayThisPhaseWatcher;

    protected override getImplementationId() {
        return {
            id: '1666373167',
            internalName: 'the-great-progenitor#first-of-the-drengir',
        };
    }

    protected override setupStateWatchers(registrar: StateWatcherRegistrar, abilityHelper: IAbilityHelper): void {
        this.cardsLeftPlayThisPhase = abilityHelper.stateWatchers.cardsLeftPlayThisPhase();
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenAttackEndsAbility({
            title: 'Give a Weakness token to this unit. If you do, create a Beast token for each Weakness token on this unit',
            contextTitle: (context) => `Give a Weakness token to this unit. If you do, create ${Helpers.pluralize(this.weaknessTokenCount(context) + 1, '1 Beast token', 'Beast tokens')}`,
            attackerMustSurvive: true,
            optional: true,
            immediateEffect: abilityHelper.immediateEffects.giveWeakness((context) => ({ target: context.source })),
            ifYouDo: (ifYouDoContext) => {
                const weaknessCount = this.weaknessTokenCount(ifYouDoContext);
                return {
                    title: `Create ${weaknessCount} Beast tokens`,
                    immediateEffect: abilityHelper.immediateEffects.createBeast({
                        amount: weaknessCount,
                        target: ifYouDoContext.player
                    })
                };
            }
        });
    }

    private weaknessTokenCount(context: AbilityContext<NonLeaderUnitCard>): number {
        const upgrades = context.source.isInPlay()
            ? context.source.upgrades
            : (this.cardsLeftPlayThisPhase.getLeftPlayEntry(context.source)?.lastKnownInformation.upgrades ?? [])
                .map((upgradeId) => this.getObject(upgradeId));

        return upgrades.filter((upgrade) => upgrade.isWeakness()).length;
    }
}