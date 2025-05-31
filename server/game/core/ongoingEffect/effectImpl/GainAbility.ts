import type { IAbilityPropsWithType } from '../../../Interfaces';
import type { InPlayCard } from '../../card/baseClasses/InPlayCard';
import type { Card } from '../../card/Card';
import type { FormatMessage } from '../../chat/GameChat';
import { AbilityType } from '../../Constants';
import type Game from '../../Game';
import type { GameObjectRef, IGameObjectBaseState } from '../../GameObjectBase';
import * as Contract from '../../utils/Contract';
import { OngoingEffectValueWrapper } from './OngoingEffectValueWrapper';

export interface IGainAbilityState extends IGameObjectBaseState {
    abilityIdentifier: string;
    abilityUuidByTargetCard: Map<string, string>;
    gainAbilitySource: GameObjectRef<Card>;
    source: GameObjectRef<Card>;
}

export class GainAbility extends OngoingEffectValueWrapper<IAbilityPropsWithType, IGainAbilityState> {
    public readonly abilityType: AbilityType;
    public readonly properties: IAbilityPropsWithType;

    private abilityIdentifier: string;
    private abilityUuidByTargetCard = new Map<InPlayCard, string>();
    private gainAbilitySource: Card;
    private source: Card;

    private static abilityDescription?(props: IAbilityPropsWithType): string {
        if (props.type === AbilityType.Triggered && 'when' in props) {
            const triggers: string[] = [];
            if (props.when.whenPlayed) {
                triggers.push('When Played');
            }
            if (props.when.whenPlayedUsingSmuggle) {
                triggers.push('When Played using Smuggle');
            }
            if (props.when.onAttack) {
                triggers.push('On Attack');
            }
            if (props.when.whenDefeated) {
                triggers.push('When Defeated');
            }
            if (triggers.length === 0) {
                return undefined;
            }
            return `“${triggers.join('/')}: ${props.title}”`;
        }
        return undefined;
    }

    public constructor(game: Game, gainedAbilityProps: IAbilityPropsWithType) {
        const abilityDescription = GainAbility.abilityDescription(gainedAbilityProps);
        let effectDescription: FormatMessage | undefined;
        if (abilityDescription) {
            effectDescription = {
                format: 'give {0}',
                args: [abilityDescription]
            };
        }

        super(game, Object.assign(gainedAbilityProps, { printedAbility: false }), effectDescription);

        this.abilityType = gainedAbilityProps.type;
    }

    protected override setupDefaultState() {
        this.state.abilityUuidByTargetCard = new Map();
    }

    public override setContext(context) {
        Contract.assertNotNullLike(context.source);

        if (context.ongoingEffect?.abilityIdentifier) {
            this.state.abilityIdentifier = `gained_from_${context.ongoingEffect.abilityIdentifier}`;
        } else if (context.ongoingEffect?.isLastingEffect) {
            // TODO: currently all gained ability identifiers are the same, find a way to make these unique in case a card gains two
            this.state.abilityIdentifier = 'gained_from_lasting_effect';
        } else if (!this.state.abilityIdentifier) {
            Contract.fail('GainAbility.setContext() called without a valid context');
        }

        super.setContext(context);

        this.state.source = this.context.source.getRef();
        this.state.gainAbilitySource = this.source.getRef();
    }

    public override apply(target: InPlayCard) {
        Contract.assertNotNullLike(this.gainAbilitySource, 'gainAbility.apply() called before gainAbility.setContext()');
        Contract.assertDoesNotHaveKey(this.state.abilityUuidByTargetCard, target.uuid, `Attempting to apply gain ability effect '${this.state.abilityIdentifier}' to card ${target.internalName} twice`);

        const properties = Object.assign(this.getValue(), { gainAbilitySource: this.gainAbilitySource, abilityIdentifier: this.state.abilityIdentifier });

        let gainedAbilityUuid: string;
        switch (properties.type) {
            case AbilityType.Action:
                gainedAbilityUuid = target.addGainedActionAbility(properties);
                break;

            case AbilityType.Constant:
                gainedAbilityUuid = target.addGainedConstantAbility(properties);
                break;

            case AbilityType.Triggered:
                gainedAbilityUuid = target.addGainedTriggeredAbility(properties);
                break;

            case AbilityType.ReplacementEffect:
                gainedAbilityUuid = target.addGainedReplacementEffectAbility(properties);
                break;

            default:
                Contract.fail(`Unknown ability type: ${this.abilityType}`);
        }

        this.state.abilityUuidByTargetCard.set(target.uuid, gainedAbilityUuid);
    }

    public override unapply(target: InPlayCard) {
        Contract.assertMapHasKey(this.state.abilityUuidByTargetCard, target.uuid, `Attempting to unapply gain ability effect "${this.state.abilityIdentifier}" from card ${target.internalName} but it is not applied`);

        switch (this.abilityType) {
            case AbilityType.Action:
                target.removeGainedActionAbility(this.state.abilityUuidByTargetCard.get(target.uuid));
                break;

            case AbilityType.Constant:
                target.removeGainedConstantAbility(this.state.abilityUuidByTargetCard.get(target.uuid));
                break;

            case AbilityType.Triggered:
                target.removeGainedTriggeredAbility(this.state.abilityUuidByTargetCard.get(target.uuid));
                break;

            case AbilityType.ReplacementEffect:
                target.removeGainedReplacementEffectAbility(this.state.abilityUuidByTargetCard.get(target.uuid));
                break;

            default:
                Contract.fail(`Unknown ability type: ${this.abilityType}`);
        }

        this.state.abilityUuidByTargetCard.delete(target.uuid);
    }
}
