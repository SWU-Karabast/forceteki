import type { IBaseCard } from '../card/BaseCard';
import type { ILeaderCard } from '../card/propertyMixins/LeaderProperties';
import type { ITokenCard } from '../card/propertyMixins/Token';
import { ZoneName } from '../Constants';
import type { Game } from '../Game';
import { registerState, stateRefArray, stateRef } from '../GameObjectUtils';
import type { Player } from '../Player';
import { Contract } from '../utils/Contract';
import { ZoneAbstract } from './ZoneAbstract';

type IBaseZoneCard = ILeaderCard | IBaseCard | ITokenCard;

/**
 * Base zone which holds the player's base and leader
 */
@registerState()
export class BaseZone extends ZoneAbstract<IBaseZoneCard> {
    public readonly base: IBaseCard;
    public override readonly hiddenForPlayers: null;
    public declare readonly owner: Player;
    public override readonly name: ZoneName.Base;

    @stateRefArray()
    private accessor _leaders: readonly ILeaderCard[] = [];

    @stateRef()
    private accessor _forceToken: ITokenCard | null = null;

    @stateRefArray()
    private accessor _credits: readonly ITokenCard[] = [];

    public override get cards(): (IBaseZoneCard)[] {
        return [this.base, this.forceToken, ...this.leaders, ...this.credits]
            .filter((card) => card !== null);
    }

    public override get count() {
        return 1 + this._leaders.length;
    }

    public get leader(): ILeaderCard {
        return this._leaders[0];
    }

    public get leaders(): ILeaderCard[] {
        return this._leaders as ILeaderCard[];
    }

    public get forceToken(): ITokenCard | null {
        return this._forceToken;
    }

    public hasForceToken(): boolean {
        return this.forceToken != null;
    }

    public get credits(): ITokenCard[] {
        return this._credits as ITokenCard[];
    }

    public constructor(game: Game, owner: Player, base: IBaseCard, leaders: ILeaderCard[]) {
        super(game, owner);

        this.hiddenForPlayers = null;
        this.name = ZoneName.Base;

        this.base = base;
        this._leaders = leaders;
    }

    protected override onInitialize(): void {
        super.onInitialize();

        Contract.assertTrue(this._leaders.length > 0, `Attempting to initialize ${this} with no leaders`);
        this.base.initializeZone(this);
        for (const leader of this._leaders) {
            leader.initializeZone(this);
        }
    }

    public setLeader(leader: ILeaderCard) {
        Contract.assertEqual(leader.controller, this.owner, `Attempting to add card ${leader.internalName} to ${this} as leader but its controller is ${leader.controller}`);

        this._leaders = [...this._leaders, leader];
    }

    public removeLeader(leader: ILeaderCard) {
        Contract.assertArrayIncludes(this._leaders, leader, `Attempting to remove leader ${leader.internalName} from ${this} but it is not present`);

        this._leaders = this._leaders.filter((l) => l !== leader);
    }

    public setForceToken(forceToken: ITokenCard) {
        Contract.assertEqual(forceToken.controller, this.owner, `Attempting to add a force token to ${this} but its controller is ${forceToken.controller}`);
        Contract.assertIsNullLike(this.forceToken, `Attempting to add a force token to ${this} but a force token is already there`);

        this._forceToken = forceToken;
    }

    public removeForceToken() {
        Contract.assertNotNullLike(this.forceToken, `Attempting to remove force token from ${this} but none exists`);

        this._forceToken = null;
    }

    public addCreditToken(credit: ITokenCard) {
        Contract.assertEqual(credit.controller, this.owner, `Attempting to add a credit token to ${this} but its controller is ${credit.controller}`);

        this._credits = [...this._credits, credit];

        if (this.credits.length === 1) {
            this.owner.updateCreditTokenCostAdjuster();
        }
    }

    public removeCreditToken(credit: ITokenCard) {
        Contract.assertArrayIncludes(this._credits, credit, `Attempting to remove credit token ${credit} from ${this} but it is not present`);

        this._credits = this._credits.filter((c) => c !== credit);

        if (this.credits.length === 0) {
            this.owner.updateCreditTokenCostAdjuster();
        }
    }
}

