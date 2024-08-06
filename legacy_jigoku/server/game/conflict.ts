import * as Settings from '../settings';
import { CardTypes, ConflictTypes, EffectNames, Elements, EventNames, Locations } from './Constants';
import { GameObject } from './GameObject';
import { ProvinceCard } from './ProvinceCard';
import BaseCard from './basecard';
import Game = require('./game');
import Player = require('./player');
import type Ring = require('./ring');
import DrawCard = require('./drawcard');

type Predicate = (card: DrawCard) => boolean;

export class Conflict extends GameObject {
    #attackerCardsPlayed = new Set<DrawCard>();
    #attackers = new Set<DrawCard>();
    #declarationComplete = false;
    #defenderCardsPlayed = new Set<DrawCard>();
    #defenders = new Set<DrawCard>();
    attackerSkill = 0;
    conflictFailedToInitiate = false;
    conflictPassed = false;
    conflictTypeSwitched = false;
    conflictUnopposed = false;
    declaredProvince = null;
    declaredRing?: Ring;
    declaredType = null;
    defendersChosen = false;
    defenderSkill = 0;
    defendingPlayer: Player;
    isSinglePlayer: boolean;
    loser?: Player;
    loserSkill?: number;
    provinceStrengthsAtResolution: Array<{ province: ProvinceCard; strength: number }>;
    skillDifference?: number;
    winner?: Player;
    winnerDetermined = false;
    winnerSkill?: number;

    constructor(
        game: Game,
        private attackingPlayer: Player,
        defendingPlayer: Player,
        private ring?: Ring,
        public conflictProvince?: ProvinceCard,
        private forcedDeclaredType?: ConflictTypes
    ) {
        super(game, 'Conflict');
        this.isSinglePlayer = !defendingPlayer;
        this.defendingPlayer = defendingPlayer || this.singlePlayerDefender();
        this.declaredRing = ring;
        this.declaredProvince = conflictProvince;
    }

    get attackers() {
        return Array.from(this.#attackers);
    }

    set attackers(characters: DrawCard[]) {
        this.#attackers = new Set(characters);
    }

    get defenders() {
        return Array.from(this.#defenders);
    }

    set defenders(characters: DrawCard[]) {
        this.#defenders = new Set(characters);
    }

    getConflictProvinces(): ProvinceCard[] {
        if (!this.conflictProvince) {
            return [];
        }

        const additionalProvinces = this.getEffects<ProvinceCard>(EffectNames.AdditionalAttackedProvince);
        additionalProvinces.unshift(this.conflictProvince);
        return additionalProvinces;
    }

    isCardInConflictProvince(card: BaseCard): boolean {
        return this.getConflictProvinces().some(
            (a) => a.location === card.location && a.controller === card.controller
        );
    }

    get conflictType(): undefined | ConflictTypes {
        return this.ring?.conflictType;
    }

    get element(): undefined | Elements {
        return this.ring?.element;
    }

    get maxAllowedDefenders() {
        const defenderCountRestrictions = this.getEffects<number>(EffectNames.RestrictNumberOfDefenders);
        return defenderCountRestrictions.length === 0 ? -1 : Math.min(...defenderCountRestrictions);
    }

    getSummary() {
        let effects = this.getEffects(EffectNames.ForceConflictUnopposed);
        let forcedUnopposed = effects.length !== 0;
        return {
            attackingPlayerId: this.attackingPlayer.id,
            defendingPlayerId: this.defendingPlayer.id,
            attackerSkill: this.attackerSkill,
            defenderSkill: this.defenderSkill,
            type: this.conflictType,
            elements: this.elements,
            attackerWins: this.#attackers.size > 0 && this.attackerSkill >= this.defenderSkill,
            breaking:
                this.conflictProvince &&
                this.getConflictProvinces().some(
                    (p) => p.getStrength() - (this.attackerSkill - this.defenderSkill) <= 0
                ),
            unopposed: !(this.#defenders && this.#defenders.size > 0 && !forcedUnopposed),
            declarationComplete: this.#declarationComplete,
            defendersChosen: this.defendersChosen
        };
    }

    setDeclarationComplete(value: boolean) {
        this.#declarationComplete = value;
    }

    setDefendersChosen(value: boolean) {
        this.defendersChosen = value;
    }

    private singlePlayerDefender() {
        const dummyPlayer = new Player(
            '',
            Settings.getUserWithDefaultsSet({ username: 'Dummy Player' }),
            false,
            this.game
        );
        dummyPlayer.initialise();
        return dummyPlayer;
    }

    resetCards() {
        this.attackingPlayer.resetForConflict();
        this.defendingPlayer.resetForConflict();
        this.getConflictProvinces().forEach((a) => (a.inConflict = false));
    }

    addAttackers(attackers: DrawCard[]): void {
        for (const attacker of attackers) {
            this.addAttacker(attacker);
        }
    }

    addAttacker(attacker: DrawCard): void {
        attacker.inConflict = true;
        this.#attackers.add(attacker);
    }

    addDefenders(defenders: DrawCard[]): void {
        for (const defender of defenders) {
            this.addDefender(defender);
        }
    }

    addDefender(defender: DrawCard): void {
        defender.inConflict = true;
        this.#defenders.add(defender);
    }

    hasElement(element: Elements) {
        return this.elements.includes(element);
    }

    get elements(): Array<'air' | 'earth' | 'fire' | 'void' | 'water'> {
        return this.ring ? this.ring.getElements() : [];
    }

    get elementsToResolve() {
        return this.sumEffects(EffectNames.ModifyConflictElementsToResolve) + 1;
    }

    switchType() {
        this.ring.flipConflictType();
        this.conflictTypeSwitched = true;
    }

    switchElement(element: Elements) {
        let newRing = this.game.rings[element];
        if (!newRing) {
            throw new Error('switchElement called for non-existant element');
        }
        if (this.attackingPlayer.allowGameAction('takeFateFromRings') && newRing.fate > 0) {
            this.game.addMessage('{0} takes {1} fate from {2}', this.attackingPlayer, newRing.fate, newRing);
            let fate = newRing.fate;
            this.attackingPlayer.modifyFate(newRing.fate);
            newRing.fate = 0;
            if (fate > 0) {
                let context = this.game.getFrameworkContext(this.attackingPlayer);
                this.game.raiseEvent(EventNames.OnMoveFate, {
                    fate: fate,
                    origin: newRing,
                    context: context,
                    recipient: this.attackingPlayer
                });
            }
        }
        if (newRing.conflictType !== this.conflictType) {
            newRing.flipConflictType();
        }
        if (this.ring) {
            if (newRing.isClaimed()) {
                const claimedPlayer = this.game.getPlayers().find((player) => newRing.claimedBy === player.name);
                this.ring.claimRing(claimedPlayer);
                newRing.resetRing();
            } else {
                this.ring.resetRing();
            }
        }
        newRing.contested = true;
        this.ring = newRing;
    }

    checkForIllegalParticipants() {
        let illegal = this.getAttackers().filter((card) => !card.canParticipateAsAttacker(this.conflictType));
        illegal = illegal.concat(
            this.getDefenders().filter((card) => !card.canParticipateAsDefender(this.conflictType))
        );
        if (illegal.length > 0) {
            this.game.addMessage(
                '{0} cannot participate in the conflict any more and {1} sent home bowed',
                illegal,
                illegal.length > 1 ? 'are' : 'is'
            );
            this.game.applyGameAction(null, { sendHome: illegal, bow: illegal });
        }
    }

    removeFromConflict(card: DrawCard): void {
        card.inConflict = false;
        if (!this.#attackers.delete(card)) {
            this.#defenders.delete(card);
        }
    }

    isAttacking(card: DrawCard) {
        return this.getAttackers().includes(card);
    }

    isDefending(card: DrawCard) {
        return this.getDefenders().includes(card);
    }

    isParticipating(card: DrawCard): boolean {
        return (this.isAttacking(card) || this.isDefending(card)) && this.#declarationComplete;
    }

    getAttackers(predicate?: Predicate): DrawCard[] {
        const attackersArray: DrawCard[] = [];
        for (const attacker of this.#attackers) {
            if (!predicate || predicate(attacker)) {
                attackersArray.push(attacker);
            }
        }

        for (const card of this.attackingPlayer.cardsInPlay.toArray() as BaseCard[]) {
            if (
                card instanceof DrawCard &&
                card.anyEffect(EffectNames.ParticipatesFromHome) &&
                card.canParticipateAsAttacker(this.conflictType) &&
                card.isAtHome() &&
                (!predicate || predicate(card))
            ) {
                attackersArray.push(card);
            }
        }
        return attackersArray;
    }

    getDefenders(predicate?: Predicate): DrawCard[] {
        const defendersArray: DrawCard[] = [];
        for (const defender of this.#defenders) {
            if (!predicate || predicate(defender)) {
                defendersArray.push(defender);
            }
        }
        for (const card of this.defendingPlayer.cardsInPlay.toArray() as BaseCard[]) {
            if (
                card instanceof DrawCard &&
                card.anyEffect(EffectNames.ParticipatesFromHome) &&
                card.canParticipateAsDefender(this.conflictType) &&
                card.isAtHome() &&
                (!predicate || predicate(card))
            ) {
                defendersArray.push(card);
            }
        }
        return defendersArray;
    }

    anyParticipants(predicate: Predicate) {
        return this.getAttackers().concat(this.getDefenders()).some(predicate);
    }

    getParticipants(predicate?: Predicate) {
        const participants = this.getAttackers().concat(this.getDefenders());
        return typeof predicate === 'function' ? participants.filter(predicate) : participants;
    }

    getNumberOfParticipants(predicate: Predicate): number {
        return this.getParticipants().reduce((count, card) => (predicate(card) ? count + 1 : count), 0);
    }

    getNumberOfParticipantsFor(player?: Player | 'attacker' | 'defender', predicate?: Predicate) {
        let _player: undefined | Player;
        if (player === 'attacker' || player === this.attackingPlayer) {
            _player = this.attackingPlayer;
        } else if (player === 'defender' || player === this.defendingPlayer) {
            _player = this.defendingPlayer;
        }
        if (!_player) {
            return [];
        }

        let characters = this.getCharacters(_player);
        if (predicate) {
            return characters.filter(predicate).length;
        }
        return characters.length + _player.sumEffects(EffectNames.AdditionalCharactersInConflict);
    }

    hasMoreParticipants(player: Player, predicate: Predicate) {
        if (!player) {
            return false;
        }
        if (!player.opponent) {
            return !!this.getNumberOfParticipantsFor(player, predicate);
        }
        return this.getNumberOfParticipantsFor(player) > this.getNumberOfParticipantsFor(player.opponent);
    }

    addCardPlayed(player: Player, card: DrawCard) {
        if (player === this.attackingPlayer) {
            this.#attackerCardsPlayed.add(card.createSnapshot());
        } else {
            this.#defenderCardsPlayed.add(card.createSnapshot());
        }
    }

    getCardsPlayed(player: Player, predicate?: Predicate): DrawCard[] {
        const cardsPlayed: DrawCard[] = [];
        for (const card of player === this.attackingPlayer ? this.#attackerCardsPlayed : this.#defenderCardsPlayed) {
            if (typeof predicate !== 'function' || predicate(card)) {
                cardsPlayed.push(card);
            }
        }
        return cardsPlayed;
    }

    getNumberOfCardsPlayed(player: Player, predicate: Predicate) {
        if (!player) {
            return 0;
        }
        if (predicate) {
            return this.getCardsPlayed(player, predicate).length;
        }
        return player.sumEffects(EffectNames.AdditionalCardPlayed) + this.getCardsPlayed(player).length;
    }

    calculateSkill(prevStateChanged = false) {
        const stateChanged = this.game.effectEngine.checkEffects(prevStateChanged);

        if (this.winnerDetermined) {
            return stateChanged;
        }

        const contributingLocations = [
            Locations.PlayArea,
            Locations.ProvinceOne,
            Locations.ProvinceTwo,
            Locations.ProvinceThree,
            Locations.ProvinceFour,
            Locations.StrongholdProvince
        ];

        const additionalContributingCards = this.game.findAnyCardsInAnyList(
            (card: BaseCard) =>
                card.type === CardTypes.Character &&
                contributingLocations.includes(card.location) &&
                card.anyEffect(EffectNames.ContributeToConflict)
        );

        if (this.attackingPlayer.anyEffect(EffectNames.SetConflictTotalSkill)) {
            this.attackerSkill = this.attackingPlayer.mostRecentEffect(EffectNames.SetConflictTotalSkill);
        } else {
            const additionalAttackers = additionalContributingCards.filter((card) =>
                card.getEffects(EffectNames.ContributeToConflict).some((value) => value === this.attackingPlayer)
            );
            this.attackerSkill =
                this.calculateSkillFor(this.getAttackers().concat(additionalAttackers)) +
                this.attackingPlayer.skillModifier;
            if (
                (this.attackingPlayer.imperialFavor === this.conflictType ||
                    this.attackingPlayer.imperialFavor === 'both') &&
                this.#attackers.size > 0
            ) {
                this.attackerSkill++;
            }
        }

        if (this.defendingPlayer.anyEffect(EffectNames.SetConflictTotalSkill)) {
            this.defenderSkill = this.defendingPlayer.mostRecentEffect(EffectNames.SetConflictTotalSkill);
        } else {
            const additionalDefenders = additionalContributingCards.filter((card) =>
                card.getEffects(EffectNames.ContributeToConflict).some((value) => value === this.defendingPlayer)
            );
            this.defenderSkill =
                this.calculateSkillFor(this.getDefenders().concat(additionalDefenders)) +
                this.defendingPlayer.skillModifier;
            if (
                (this.defendingPlayer.imperialFavor === this.conflictType ||
                    this.defendingPlayer.imperialFavor === 'both') &&
                this.#defenders.size > 0
            ) {
                this.defenderSkill++;
            }
        }

        return stateChanged;
    }

    calculateSkillFor(cards: BaseCard[]) {
        let skillFunction =
            this.mostRecentEffect(EffectNames.ChangeConflictSkillFunction) ||
            ((card) => card.getContributionToConflict(this.conflictType));
        let cannotContributeFunctions = this.getEffects(EffectNames.CannotContribute);

        return cards.reduce((sum, card) => {
            let canContributeWhileBowed = card.anyEffect(EffectNames.CanContributeWhileBowed);
            let cannotContribute = card.bowed && !canContributeWhileBowed;
            let playerSkillFunction = card.controller.mostRecentEffect(EffectNames.ChangeConflictSkillFunction);
            if (playerSkillFunction) {
                skillFunction = playerSkillFunction;
            }
            if (!cannotContribute) {
                cannotContribute = cannotContributeFunctions.some((func) => func(card));
            }
            if (!cannotContribute) {
                cannotContribute = !card.checkRestrictions(
                    'contributeSkillToConflictResolution',
                    this.game.getFrameworkContext()
                );
            }
            if (cannotContribute) {
                return sum;
            }
            return sum + skillFunction(card, this);
        }, 0);
    }

    determineWinner() {
        this.calculateSkill();
        this.winnerDetermined = true;
        this.provinceStrengthsAtResolution = [];
        this.getConflictProvinces()
            .filter((a) => a)
            .forEach((a) => {
                this.provinceStrengthsAtResolution.push({
                    province: a,
                    strength: a.getStrength()
                });
            });

        if (this.attackerSkill === 0 && this.defenderSkill === 0) {
            this.loser = undefined;
            this.winner = undefined;
            this.loserSkill = this.winnerSkill = 0;
            this.skillDifference = 0;
            return;
        }
        if (this.attackerSkill >= this.defenderSkill) {
            this.loser = this.defendingPlayer;
            this.loserSkill = this.defenderSkill;
            this.winner = this.attackingPlayer;
            this.winnerSkill = this.attackerSkill;
        } else {
            this.loser = this.attackingPlayer;
            this.loserSkill = this.attackerSkill;
            this.winner = this.defendingPlayer;
            this.winnerSkill = this.defenderSkill;
        }

        this.skillDifference = this.winnerSkill - this.loserSkill;
    }

    isAttackerTheWinner() {
        return this.winner === this.attackingPlayer;
    }

    getCharacters(player?: Player) {
        if (!player) {
            return [];
        }
        return this.attackingPlayer === player ? this.getAttackers() : this.getDefenders();
    }

    passConflict(message = '{0} has chosen to pass their conflict opportunity') {
        this.game.addMessage(message, this.attackingPlayer);
        this.conflictPassed = true;
        if (this.ring) {
            this.ring.resetRing();
        }
        this.game.recordConflict(this);
        this.game.currentConflict = null;
        this.game.raiseEvent(EventNames.OnConflictPass, { conflict: this });
        this.resetCards();
    }

    isBreaking() {
        return (
            this.conflictProvince &&
            this.getConflictProvinces().some((p) => p.getStrength() - (this.attackerSkill - this.defenderSkill) <= 0)
        );
    }

    public isAtStrongholdProvince(): boolean {
        for (const province of this.getConflictProvinces()) {
            if (province.location === Locations.StrongholdProvince) {
                return true;
            }
        }
        return false;
    }
}