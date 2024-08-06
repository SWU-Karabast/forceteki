const _ = require('underscore');
const { UiPrompt } = require('../UiPrompt.js');
const { Locations, CardTypes } = require('../../Constants');
const AttackersMatrix = require('./attackersMatrix.js');
const { AbilityContext } = require('../../AbilityContext');
const CovertAbility = require('../../KeywordAbilities/CovertAbility');
const { GameModes } = require('../../../GameModes.js');

const capitalize = {
    military: 'Military',
    political: 'Political',
    air: 'Air',
    water: 'Water',
    earth: 'Earth',
    fire: 'Fire',
    void: 'Void'
};

class InitiateConflictPrompt extends UiPrompt {
    constructor(game, conflict, choosingPlayer, attackerChoosesRing = true, canPass = attackerChoosesRing, attackerMatrix = null) {
        super(game);
        this.conflict = conflict;
        this.choosingPlayer = choosingPlayer;
        this.attackerChoosesRing = attackerChoosesRing;
        this.canPass = canPass;
        this.selectedDefenders = [];
        this.covertRemaining = false;
        this.attackerMatrix = attackerMatrix;

        if(attackerMatrix === null) {
            this.attackerMatrix = new AttackersMatrix(this.choosingPlayer, this.choosingPlayer.cardsInPlay, this.game);
            if(!this.attackerMatrix.canPass) {
                this.canPass = false;
            }
        }

        this.checkForMustSelect();
    }

    continue() {
        if(!this.isComplete()) {
            this.highlightSelectableRings();
        }

        return super.continue();
    }

    checkForMustSelect() {
        if(this.attackerMatrix.forcedNumberOfAttackers > 0) {
            this.conflict.ring = this.attackerMatrix.defaultRing;
            this.conflict.ring.resetRing();
            this.conflict.ring.contested = true;
            if(this.conflict.ring.conflictType !== this.attackerMatrix.defaultType) {
                this.conflict.ring.flipConflictType();
            }
            for(const card of this.attackerMatrix.getForcedAttackers(this.conflict.ring, this.conflict.conflictType, this.conflict.conflictProvince)) {
                if(this.checkCardCondition(card) && !this.conflict.attackers.includes(card)) {
                    this.selectCard(card);
                }
            }
        }
    }

    highlightSelectableRings() {
        let selectableRings = _.filter(this.game.rings, ring => {
            return this.checkRingCondition(ring);
        });
        this.choosingPlayer.setSelectableRings(selectableRings);
    }

    activeCondition(player) {
        return player === this.choosingPlayer;
    }

    activePrompt() {
        let buttons = [];
        let menuTitle = '';
        let promptTitle = '';

        if(this.canPass) {
            buttons.push({ text: 'Pass Conflict', arg: 'pass' });
        }

        if(!this.conflict.ring) {
            menuTitle = this.conflict.forcedDeclaredType ? 'Choose an elemental ring' : 'Choose an elemental ring\n(click the ring again to change conflict type)';
            promptTitle = 'Initiate Conflict';
        } else {
            promptTitle = capitalize[this.conflict.conflictType] + ' ' + capitalize[this.conflict.element] + ' Conflict';
            if(!this.conflict.conflictProvince && !this.conflict.isSinglePlayer) {
                menuTitle = 'Choose province to attack';
            } else if(this.conflict.attackers.length === 0) {
                menuTitle = 'Choose attackers';
            } else {
                if(this.covertRemaining && this.game.gameMode !== GameModes.Emerald) {
                    menuTitle = 'Choose defenders to Covert';
                } else {
                    menuTitle = capitalize[this.conflict.conflictType] + ' skill: '.concat(this.conflict.attackerSkill);
                }
                if(this.conflict.attackers.length === this.attackerMatrix.requiredNumberOfAttackers || this.attackerMatrix.requiredNumberOfAttackers <= 0) {
                    buttons.unshift({ text: 'Initiate Conflict', arg: 'done' });
                }
            }
        }

        return {
            selectRing: true,
            menuTitle: menuTitle,
            buttons: buttons,
            promptTitle: promptTitle
        };
    }

    waitingPrompt() {
        return { menuTitle: 'Waiting for opponent to declare conflict' };
    }

    onCardClicked(player, card) {
        return player === this.choosingPlayer && this.checkCardCondition(card) && this.selectCard(card);
    }

    onRingClicked(player, ring) {
        return player === this.choosingPlayer && this.checkRingCondition(ring) && this.selectRing(ring);
    }

    selectRing(ring) {
        let player = this.choosingPlayer;

        if(this.conflict.ring === ring) {
            ring.flipConflictType();
        } else {
            const type = ring.conflictType;

            let polValid = this.attackerMatrix.isCombinationValid(ring, 'political', this.conflict.conflictProvince);
            let milValid = this.attackerMatrix.isCombinationValid(ring, 'military', this.conflict.conflictProvince);

            if(!player.hasLegalConflictDeclaration({ type, ring, province: this.conflict.conflictProvince })) {
                ring.flipConflictType();
            } else if(polValid && !milValid && type === 'military') {
                ring.flipConflictType();
            } else if(milValid && !polValid && type === 'political') {
                ring.flipConflictType();
            } else if(this.conflict.attackers.some(card => !card.canDeclareAsAttacker(type, ring))) {
                ring.flipConflictType();
            }
            if(this.conflict.ring) {
                this.conflict.ring.resetRing();
            }
            this.conflict.ring = ring;
            ring.contested = true;
        }

        _.each(this.conflict.attackers, card => {
            if(!card.canDeclareAsAttacker(ring.conflictType, ring)) {
                this.removeFromConflict(card);
            }
        });

        _.each(this.attackerMatrix.getForcedAttackers(ring, ring.conflictType, this.conflict.conflictProvince), card => {
            if(!this.conflict.attackers.includes(card)) {
                this.selectCard(card);
            }
        });

        this.conflict.calculateSkill(true);
        this.recalculateCovert();

        return true;
    }

    checkRingCondition(ring) {
        const player = this.choosingPlayer;
        const province = this.conflict.conflictProvince;
        let attackers = this.conflict.attackers;
        this.conflict.attackers = [];
        if(this.conflict.ring === ring) {
            const newType = ring.conflictType === 'military' ? 'political' : 'military';
            if(!player.hasLegalConflictDeclaration({ type: newType, ring, province })) {
                this.conflict.attackers = attackers;
                return false;
            }

            if(!this.attackerMatrix.isCombinationValid(ring, newType, this.conflict.conflictProvince)) {
                this.conflict.attackers = attackers;
                return false;
            }

            this.conflict.attackers = attackers;
            return true;
        }
        let result = this.attackerChoosesRing && player.hasLegalConflictDeclaration({ ring, province }) && (this.attackerMatrix.isCombinationValid(ring, 'political') || this.attackerMatrix.isCombinationValid(ring, 'military'));
        this.conflict.attackers = attackers;
        return result;
    }

    checkCardCondition(card) {
        if(card.isProvince && card.controller !== this.choosingPlayer) {
            return card === this.conflict.conflictProvince || this.choosingPlayer.hasLegalConflictDeclaration({
                type: this.conflict.conflictType,
                ring: this.conflict.ring,
                province: card
            });
        } else if(card.type === CardTypes.Character && card.location === Locations.PlayArea) {
            if(card.controller === this.choosingPlayer) {
                if(this.conflict.attackers.includes(card)) {
                    let forced = this.attackerMatrix.getForcedAttackers(this.conflict.ring, this.conflict.conflictType, this.conflict.conflictProvince).includes(card);
                    let extraAttackers = this.attackerMatrix.requiredNumberOfAttackers > 0 ? this.conflict.attackers.length > this.attackerMatrix.requiredNumberOfAttackers : false;
                    let enoughForcedRemaining = true;

                    if(forced && extraAttackers) {
                        let forcedRemainingCount = this.conflict.attackers.filter(a =>
                            this.attackerMatrix.getForcedAttackers(this.conflict.ring, this.conflict.conflictType, this.conflict.conflictProvince).includes(a)).length - 1; //-1 because we're trying to remove a character from the list
                        if(forcedRemainingCount < this.attackerMatrix.requiredNumberOfAttackers) {
                            enoughForcedRemaining = false;
                        }
                    }

                    return !forced || (extraAttackers && enoughForcedRemaining);
                }
                return this.choosingPlayer.hasLegalConflictDeclaration({
                    type: this.conflict.conflictType,
                    ring: this.conflict.ring,
                    province: this.conflict.conflictProvince,
                    attacker: card
                });
            }

            if(this.selectedDefenders.includes(card)) {
                return true;
            }
            if(card.isCovert() || !this.covertRemaining || this.game.gameMode === GameModes.Emerald) {
                return false;
            }

            //Make sure the covert is legal
            let attackersWithCovert = _.filter(this.conflict.attackers, card => card.isCovert());
            let covertContexts = attackersWithCovert.map(card => new AbilityContext({
                game: this.game,
                player: this.conflict.attackingPlayer,
                source: card,
                ability: new CovertAbility()
            }));

            let targetable = false;

            for(const context of covertContexts) {
                if(context.player.checkRestrictions('initiateKeywords', context)) {
                    if(card.canBeBypassedByCovert(context) && card.checkRestrictions('target', context)) {
                        targetable = true;
                    }
                }
            }

            return this.covertRemaining && targetable;

        }
        return false;
    }

    recalculateCovert() {
        let attackersWithCovert = _.size(_.filter(this.conflict.attackers, card => card.isCovert()));
        this.covertRemaining = attackersWithCovert > _.size(this.selectedDefenders);
    }

    selectCard(card) {
        if(card.isProvince) {
            if(this.conflict.conflictProvince) {
                this.conflict.conflictProvince.inConflict = false;
                this.conflict.conflictProvince = null;
            } else {
                this.conflict.conflictProvince = card;
                this.conflict.conflictProvince.inConflict = true;
            }
        } else if(card.type === CardTypes.Character) {
            if(card.controller === this.choosingPlayer) {
                if(!this.conflict.attackers.includes(card)) {
                    this.conflict.addAttacker(card);
                } else {
                    this.removeFromConflict(card);
                }
            } else {
                if(!this.selectedDefenders.includes(card)) {
                    this.selectedDefenders.push(card);
                    card.covert = true;
                } else {
                    this.selectedDefenders = _.reject(this.selectedDefenders, c => c === card);
                    card.covert = false;
                }
            }
        }

        this.conflict.calculateSkill(true);
        this.recalculateCovert();

        return true;
    }

    removeFromConflict(card) {
        if(card.isCovert() && !this.covertRemaining) {
            this.selectedDefenders.pop().covert = false;
        }
        this.conflict.removeFromConflict(card);
    }

    menuCommand(player, arg) {
        if(arg === 'done') {
            if(!this.conflict.ring || this.game.rings[this.conflict.element] !== this.conflict.ring ||
                                (!this.conflict.isSinglePlayer && !this.conflict.conflictProvince) || this.conflict.attackers.length === 0) {
                return false;
            }
            this.conflict.setDeclarationComplete(true);
            this.complete();
            this.conflict.declaredRing = this.conflict.ring;
            this.conflict.declaredType = this.conflict.ring.conflictType;
            return true;
        } else if(arg === 'pass') {
            this.game.promptWithHandlerMenu(this.choosingPlayer, {
                activePromptTitle: 'Are you sure you want to pass your conflict opportunity?',
                source: 'Pass Conflict',
                choices: ['Yes', 'No'],
                handlers: [
                    () => {
                        this.complete();
                        this.conflict.passConflict();
                    },
                    () => true
                ]
            });
            return true;
        }
        return false;
    }
}

module.exports = InitiateConflictPrompt;
