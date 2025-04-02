import type { Player } from '../Player';
import { WithPrintedHp } from './propertyMixins/PrintedHp';
import { InPlayCard } from './baseClasses/InPlayCard';
import { WithPrintedPower } from './propertyMixins/PrintedPower';
import * as Contract from '../utils/Contract';
import type { MoveZoneDestination } from '../Constants';
import { AbilityType, CardType, ZoneName, WildcardRelativePlayer, StandardTriggeredAbilityType } from '../Constants';
import { PlayUpgradeAction } from '../../actions/PlayUpgradeAction';
import type { IActionAbilityPropsWithGainCondition, IConstantAbilityProps, IConstantAbilityPropsWithGainCondition, IKeywordPropertiesWithGainCondition, ITriggeredAbilityBasePropsWithGainCondition, ITriggeredAbilityPropsWithGainCondition, WhenTypeOrStandard } from '../../Interfaces';
import type { Card } from './Card';
import OngoingEffectLibrary from '../../ongoingEffects/OngoingEffectLibrary';
import { WithStandardAbilitySetup } from './propertyMixins/StandardAbilitySetup';
import type { IPlayCardActionProperties } from '../ability/PlayCardAction';
import type { IUnitCard } from './propertyMixins/UnitProperties';
import type { IPlayableCard } from './baseClasses/PlayableOrDeployableCard';
import type { ICardCanChangeControllers, IUpgradeCard } from './CardInterfaces';

const UpgradeCardParent = WithPrintedPower(WithPrintedHp(WithStandardAbilitySetup(InPlayCard)));

export class UpgradeCard extends UpgradeCardParent implements IUpgradeCard, IPlayableCard {
    public constructor(owner: Player, cardData: any) {
        super(owner, cardData);
        Contract.assertTrue([CardType.BasicUpgrade, CardType.TokenUpgrade].includes(this.printedType));
    }

    public override isUpgrade(): this is IUpgradeCard {
        return true;
    }

    public override isPlayable(): this is IPlayableCard {
        return true;
    }

    public override canChangeController(): this is ICardCanChangeControllers {
        return true;
    }

    public override getHp(): number {
        return this.printedUpgradeHp;
    }

    public override getPower(): number {
        return this.printedUpgradePower;
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    public override checkIsAttachable(): void { }

    public override buildPlayCardAction(properties: IPlayCardActionProperties) {
        return new PlayUpgradeAction(this.game, this, properties);
    }

    public override getSummary(activePlayer: Player) {
        return {
            ...super.getSummary(activePlayer)
        };
    }

    public override moveTo(targetZoneName: MoveZoneDestination) {
        Contract.assertTrue(!this.state.parentCard || targetZoneName === this.parentCard.zoneName, `Attempting to move upgrade ${this.internalName} while it is still attached to ${this.state.parentCard ? this.parentCard.internalName : ''}`);

        super.moveTo(targetZoneName);
    }

    /**
     * Helper that adds an effect that applies to the attached unit. You can provide a match function
     * to narrow down whether the effect is applied (for cases where the effect has conditions).
     */
    protected addConstantAbilityTargetingAttached(properties: Pick<IConstantAbilityProps<this>, 'title' | 'condition' | 'matchTarget' | 'ongoingEffect'>) {
        this.addConstantAbility({
            title: properties.title,
            condition: properties.condition || (() => true),
            matchTarget: (card, context) => card === context.source.parentCard && (!properties.matchTarget || properties.matchTarget(card, context)),
            targetController: WildcardRelativePlayer.Any,   // this means that the effect continues to work even if the other player gains control of the upgrade
            ongoingEffect: properties.ongoingEffect
        });
    }

    /**
     * Adds an "attached card gains [X]" ability, where X is a triggered ability. You can provide a match function
     * to narrow down whether the effect is applied (for cases where the effect has conditions).
     */
    protected addGainConstantAbilityTargetingAttached(properties: IConstantAbilityPropsWithGainCondition<this, IUnitCard>) {
        const { gainCondition, ...gainedAbilityProperties } = properties;

        this.addConstantAbilityTargetingAttached({
            title: 'Give ability to the attached card',
            condition: this.addZoneCheckToGainCondition(gainCondition),
            ongoingEffect: OngoingEffectLibrary.gainAbility({ type: AbilityType.Constant, ...gainedAbilityProperties })
        });
    }

    /**
     * Adds an "attached card gains [X]" ability, where X is a triggered ability. You can provide a match function
     * to narrow down whether the effect is applied (for cases where the effect has conditions).
     */
    protected addGainTriggeredAbilityTargetingAttached(properties: ITriggeredAbilityPropsWithGainCondition<this, IUnitCard>) {
        const { gainCondition, ...gainedAbilityProperties } = properties;

        this.addConstantAbilityTargetingAttached({
            title: 'Give ability to the attached card',
            condition: this.addZoneCheckToGainCondition(gainCondition),
            ongoingEffect: OngoingEffectLibrary.gainAbility({ type: AbilityType.Triggered, ...gainedAbilityProperties })
        });
    }

    /**
     * Adds an "attached card gains [X]" ability, where X is an action ability. You can provide a match function
     * to narrow down whether the effect is applied (for cases where the effect has conditions).
     */
    protected addGainActionAbilityTargetingAttached(properties: IActionAbilityPropsWithGainCondition<this, IUnitCard>) {
        const { gainCondition, ...gainedAbilityProperties } = properties;

        this.addConstantAbilityTargetingAttached({
            title: 'Give ability to the attached card',
            condition: this.addZoneCheckToGainCondition(gainCondition),
            ongoingEffect: OngoingEffectLibrary.gainAbility({ type: AbilityType.Action, ...gainedAbilityProperties })
        });
    }

    /**
     * Adds an "attached card gains [X]" ability, where X is an "on attack" triggered ability. You can provide a match function
     * to narrow down whether the effect is applied (for cases where the effect has conditions).
     */
    protected addGainOnAttackAbilityTargetingAttached(properties: ITriggeredAbilityBasePropsWithGainCondition<this, IUnitCard>) {
        const { gainCondition, ...gainedAbilityProperties } = properties;
        const propsWithWhen = Object.assign(gainedAbilityProperties, { when: { onAttackDeclared: (event, context) => event.attack.attacker === context.source } });

        this.addConstantAbilityTargetingAttached({
            title: 'Give ability to the attached card',
            condition: this.addZoneCheckToGainCondition(gainCondition),
            ongoingEffect: OngoingEffectLibrary.gainAbility({ type: AbilityType.Triggered, ...propsWithWhen })
        });
    }

    // TODO THRAWN2: update the below to use the whenDefeated property

    /**
     * Adds an "attached card gains [X]" ability, where X is an "when defeated" triggered ability. You can provide a match function
     * to narrow down whether the effect is applied (for cases where the effect has conditions).
     */
    protected addGainWhenDefeatedAbilityTargetingAttached(properties: ITriggeredAbilityBasePropsWithGainCondition<this, IUnitCard>) {
        const { gainCondition, ...gainedAbilityProperties } = properties;
        const when: WhenTypeOrStandard = { [StandardTriggeredAbilityType.WhenDefeated]: true };
        const propsWithWhen = Object.assign(gainedAbilityProperties, { when });

        this.addConstantAbilityTargetingAttached({
            title: 'Give ability to the attached card',
            condition: this.addZoneCheckToGainCondition(gainCondition),
            ongoingEffect: OngoingEffectLibrary.gainAbility({ type: AbilityType.Triggered, ...propsWithWhen })
        });
    }

    /**
     * Adds an "attached card gains [X]" ability, where X is a keyword ability. You can provide a match function
     * to narrow down whether the effect is applied (for cases where the effect has conditions).
     */
    protected addGainKeywordTargetingAttached(properties: IKeywordPropertiesWithGainCondition<this>) {
        const { gainCondition, ...keywordProperties } = properties;

        this.addConstantAbilityTargetingAttached({
            title: 'Give keyword to the attached card',
            condition: this.addZoneCheckToGainCondition(gainCondition),
            ongoingEffect: OngoingEffectLibrary.gainKeyword(keywordProperties)
        });
    }

    /** Adds a condition that must return true for the upgrade to be allowed to attach to the passed card. */
    protected setAttachCondition(attachCondition: (card: Card) => boolean) {
        Contract.assertIsNullLike(this.attachCondition, 'Attach condition is already set');

        this.attachCondition = attachCondition;
    }

    protected override initializeForCurrentZone(prevZone?: ZoneName): void {
        super.initializeForCurrentZone(prevZone);

        switch (this.zoneName) {
            case ZoneName.Resource:
                this.setExhaustEnabled(true);
                break;

            default:
                this.setExhaustEnabled(false);
                break;
        }
    }
}