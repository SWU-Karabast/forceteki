import type Player from '../Player';
import { PlayUnitAction } from '../../actions/PlayUnitAction';
import * as Contract from '../utils/Contract';
import { CardType, KeywordName, PlayType, ZoneName } from '../Constants';
import type { IUnitCard } from './propertyMixins/UnitProperties';
import { WithUnitProperties } from './propertyMixins/UnitProperties';
import { InPlayCard } from './baseClasses/InPlayCard';
import { WithStandardAbilitySetup } from './propertyMixins/StandardAbilitySetup';
import type { IPlayCardActionProperties } from '../ability/PlayCardAction';
import type { IPlayableCard } from './baseClasses/PlayableOrDeployableCard';
import type { ICardCanChangeControllers } from './CardInterfaces';
import { PlayUpgradeAction } from '../../actions/PlayUpgradeAction';
import type { ActionAbility } from '../ability/ActionAbility';
import type TriggeredAbility from '../ability/TriggeredAbility';
import type { IConstantAbility } from '../ongoingEffect/IConstantAbility';

const NonLeaderUnitCardParent = WithUnitProperties(WithStandardAbilitySetup(InPlayCard));

export interface INonLeaderUnitCard extends IUnitCard, IPlayableCard {}

export class NonLeaderUnitCard extends NonLeaderUnitCardParent implements INonLeaderUnitCard, ICardCanChangeControllers {
    public constructor(owner: Player, cardData: any) {
        super(owner, cardData);

        // superclasses check that we are a unit, check here that we are a non-leader unit
        Contract.assertFalse(this.printedType === CardType.Leader);
    }

    public override isNonLeaderUnit(): this is INonLeaderUnitCard {
        return !this.isLeaderAttachedToThis();
    }

    public override canChangeController(): this is ICardCanChangeControllers {
        return true;
    }

    public override buildPlayCardAction(properties: IPlayCardActionProperties) {
        if (properties.playType === PlayType.Piloting) {
            return new PlayUpgradeAction(this.game, this, properties);
        }
        return new PlayUnitAction(this.game, this, properties);
    }

    public override isPlayable(): this is IPlayableCard {
        return true;
    }

    protected override initializeForCurrentZone(prevZone?: ZoneName): void {
        super.initializeForCurrentZone(prevZone);

        switch (this.zoneName) {
            case ZoneName.GroundArena:
            case ZoneName.SpaceArena:
                this.setActiveAttackEnabled(true);
                this.setDamageEnabled(true);
                this.setExhaustEnabled(true);
                this.setUpgradesEnabled(true);
                this.setCaptureZoneEnabled(true);
                break;

            case ZoneName.Resource:
                this.setActiveAttackEnabled(false);
                this.setDamageEnabled(false);
                this.setExhaustEnabled(true);
                this.setUpgradesEnabled(false);
                this.setCaptureZoneEnabled(false);
                break;

            default:
                this.setActiveAttackEnabled(false);
                this.setDamageEnabled(false);
                this.setExhaustEnabled(false);
                this.setUpgradesEnabled(false);
                this.setCaptureZoneEnabled(false);
                break;
        }
    }

    public override checkIsAttachable(): void {
        Contract.assertTrue(this.hasSomeKeyword(KeywordName.Piloting));
    }

    public override getActionAbilities(): ActionAbility[] {
        return this.isBlank() ? [] : this.actionAbilities;
    }

    public override getTriggeredAbilities(): TriggeredAbility[] {
        return this.isBlank() ? [] : this.triggeredAbilities;
    }

    public override getConstantAbilities(): IConstantAbility[] {
        return this.isBlank() ? [] : this.constantAbilities;
    }
}
