import type {
    ILeaderUnitAbilityRegistrar,
    ILeaderUnitLeaderSideAbilityRegistrar
} from '../../../core/card/AbilityRegistrationInterfaces';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import type { IAbilityHelper } from '../../../AbilityHelper';
import { WildcardCardType } from '../../../core/Constants';
import * as ChatHelpers from '../../../core/chat/ChatHelpers';


export default class LeiaOrganaSomeoneWhoLovesYou extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'leia-organa#someone-who-loves-you-id',
            internalName: 'leia-organa#someone-who-loves-you',
        };
    }

    protected override setupLeaderSideAbilities(registrar: ILeaderUnitLeaderSideAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addActionAbility({
            title: 'For this phase, give a unit +1/+1 for each different aspect it has',
            cost: [abilityHelper.costs.abilityActivationResourceCost(2), abilityHelper.costs.exhaustSelf()],
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: abilityHelper.immediateEffects.forThisPhaseCardEffect({
                    effect: abilityHelper.ongoingEffects.modifyStats((target) => {
                        const differentAspectCount = new Set(target.aspects).size;

                        return {
                            power: differentAspectCount,
                            hp: differentAspectCount
                        };
                    })
                })
            },
        });
    }

    protected override setupLeaderUnitSideAbilities(registrar: ILeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'Choose a unit. Give an Experience token to that unit for each different aspect among units you control',
            when: {
                onLeaderDeployed: (event, context) => event.card === context.source
            },
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                activePromptTitle: (context) => {
                    const aspectCount = new Set(context.player.getArenaUnits().flatMap((u) => u.aspects)).size;
                    const stringFormat = ChatHelpers.pluralize(aspectCount, 'an Experience token', 'Experience tokens');
                    const tokensString = typeof stringFormat === 'string' ? stringFormat : `${stringFormat.args[0]} ${stringFormat.args[1]}`;
                    return `Give ${tokensString} to a unit`;
                },
                immediateEffect: abilityHelper.immediateEffects.giveExperience((context) => ({
                    amount: new Set(context.player.getArenaUnits().flatMap((unit) => unit.aspects)).size
                }))
            },
        });
    }
}