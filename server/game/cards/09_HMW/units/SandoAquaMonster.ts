import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { EventName, TargetMode, Trait, WildcardCardType, ZoneName } from '../../../core/Constants';
import { EventResolutionStatus } from '../../../core/event/GameEvent';
import type { IUnitCard } from '../../../core/card/propertyMixins/UnitProperties';

export default class SandoAquaMonster extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'sando-aqua-monster-id',
            internalName: 'sando-aqua-monster',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Defeat any number of ground units with combined power equal to or less than this unit\'s power. Deal damage to this unit equal to the combined power of the defeated units',
            optional: true,
            targetResolver: {
                activePromptTitle: (context) => `Choose any number of ground units with combined power equal to or less than ${context.source.getPower()}`,
                zoneFilter: ZoneName.GroundArena,
                cardTypeFilter: WildcardCardType.Unit,
                mode: TargetMode.Unlimited,
                canChooseNoCards: true,
                multiSelectCardCondition: (card, selectedCards, context) => {
                    const selectedPower = selectedCards.reduce((total, selectedCard) => total + (selectedCard as IUnitCard).getPower(), 0);
                    return selectedPower + (card as IUnitCard).getPower() <= context.source.getPower();
                },
                immediateEffect: abilityHelper.immediateEffects.conditional({
                    condition: (c) => c.player.base.hasSomeTrait(Trait.Naboo),
                    onTrue: abilityHelper.immediateEffects.defeat(),
                })
            },
            ifYouDo: (ifYouDoContext) => {
                const defeatedPower = ifYouDoContext.events
                    .filter((event) => event.name === EventName.OnCardDefeated && event.resolutionStatus === EventResolutionStatus.RESOLVED)
                    .reduce((total, event) => total + (event.lastKnownInformation?.power ?? 0), 0);
                return {
                    title: `Deal ${defeatedPower} damage to this unit`,
                    immediateEffect: abilityHelper.immediateEffects.damage({
                        target: ifYouDoContext.source,
                        amount: defeatedPower
                    })
                };
            }
        });
    }
}