const AbilityDsl = require('../../build/game/abilitydsl');

describe('Emerald Core Duels', function() {
    integration(function() {
        describe('Duel Challenge', function () {
            beforeEach(function() {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        fate: 20,
                        inPlay: ['doji-challenger'],
                        hand: ['a-fate-worse-than-death', 'desolation'],
                        dynastyDiscard: ['awakened-tsukumogami']
                    },
                    player2: {
                        inPlay: ['kakita-toshimoko'],
                        hand: ['embrace-the-void', 'policy-debate']
                    }
                });

                this.duelEffect = this.player1.findCardByName('a-fate-worse-than-death');
                this.duelEffect.duelChallenge({
                    title: 'Honor this character',
                    target: {
                        cardType: 'character',
                        controller: 'self',
                        cardCondition: (card, context) => context.event.duel.isInvolved(card),
                        gameAction: AbilityDsl.actions.honor()
                    }
                })

                this.duelEffect2 = this.player1.findCardByName('desolation');
                this.duelEffect2.duelChallenge({
                    title: 'Gain a fate',
                    gameAction: AbilityDsl.actions.gainFate(context => ({ target: context.player}))
                })

                for(const reaction of this.duelEffect.reactions) {
                    reaction.registerEvents();
                }
                for(const reaction of this.duelEffect2.reactions) {
                    reaction.registerEvents();
                }
                
                this.toshimoko = this.player2.findCardByName('kakita-toshimoko');
                this.challenger = this.player1.findCardByName('doji-challenger');
                this.pd = this.player2.findCardByName('policy-debate');
            });

            it('should react appropriately', function() {
                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.challenger],
                    defenders: [this.toshimoko]
                });

                this.player2.clickCard(this.pd);
                this.player2.clickCard(this.toshimoko);
                this.player2.clickCard(this.challenger);

                expect(this.player1).toHavePrompt('Triggered Abilities');
                expect(this.player1).toBeAbleToSelect(this.duelEffect);
                expect(this.player1).toBeAbleToSelect(this.duelEffect2);

                this.player1.clickCard(this.duelEffect);
                expect(this.player1).toBeAbleToSelect(this.challenger);
                this.player1.clickCard(this.challenger);
                expect(this.challenger.isHonored).toBe(true);
            });

            it('should only be able to react once', function() {
                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.challenger],
                    defenders: [this.toshimoko]
                });

                this.player2.clickCard(this.pd);
                this.player2.clickCard(this.toshimoko);
                this.player2.clickCard(this.challenger);

                expect(this.player1).toHavePrompt('Triggered Abilities');
                expect(this.player1).toBeAbleToSelect(this.duelEffect);
                expect(this.player1).toBeAbleToSelect(this.duelEffect2);

                this.player1.clickCard(this.duelEffect);
                expect(this.player1).toBeAbleToSelect(this.challenger);
                this.player1.clickCard(this.challenger);
                expect(this.challenger.isHonored).toBe(true);

                expect(this.player1).toHavePrompt('Honor Bid');
            });
        });

        describe('Duel Focus', function () {
            beforeEach(function() {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        fate: 20,
                        inPlay: ['doji-challenger'],
                        hand: ['a-fate-worse-than-death', 'desolation'],
                        dynastyDiscard: ['bayushi-manipulator']
                    },
                    player2: {
                        inPlay: ['kakita-toshimoko'],
                        hand: ['embrace-the-void', 'policy-debate']
                    }
                });

                this.duelEffect = this.player1.findCardByName('a-fate-worse-than-death');
                this.duelEffect.duelFocus({
                    title: 'Honor this character',
                    target: {
                        cardType: 'character',
                        controller: 'self',
                        cardCondition: (card, context) => context.event.duel.isInvolved(card),
                        gameAction: AbilityDsl.actions.honor()
                    }
                })

                this.duelEffect2 = this.player1.findCardByName('desolation');
                this.duelEffect2.duelFocus({
                    title: 'Gain a fate',
                    gameAction: AbilityDsl.actions.gainFate(context => ({ target: context.player}))
                })

                for(const reaction of this.duelEffect.reactions) {
                    reaction.registerEvents();
                }
                for(const reaction of this.duelEffect2.reactions) {
                    reaction.registerEvents();
                }
                
                this.manipulator = this.player1.findCardByName('bayushi-manipulator');
                this.toshimoko = this.player2.findCardByName('kakita-toshimoko');
                this.challenger = this.player1.findCardByName('doji-challenger');
                this.pd = this.player2.findCardByName('policy-debate');
            });

            it('should react appropriately', function() {
                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.challenger],
                    defenders: [this.toshimoko]
                });

                this.player2.clickCard(this.pd);
                this.player2.clickCard(this.toshimoko);
                this.player2.clickCard(this.challenger);

                expect(this.player1).toHavePrompt('Honor Bid');
                this.player1.clickPrompt('1');
                this.player2.clickPrompt('1');

                expect(this.player1).toHavePrompt('Triggered Abilities');
                expect(this.player1).toBeAbleToSelect(this.duelEffect);
                expect(this.player1).toBeAbleToSelect(this.duelEffect2);

                this.player1.clickCard(this.duelEffect);
                expect(this.player1).toBeAbleToSelect(this.challenger);
                this.player1.clickCard(this.challenger);
                expect(this.challenger.isHonored).toBe(true);
            });

            it('should only be able to react once', function() {
                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.challenger],
                    defenders: [this.toshimoko]
                });

                this.player2.clickCard(this.pd);
                this.player2.clickCard(this.toshimoko);
                this.player2.clickCard(this.challenger);

                expect(this.player1).toHavePrompt('Honor Bid');
                this.player1.clickPrompt('1');
                this.player2.clickPrompt('1');

                expect(this.player1).toHavePrompt('Triggered Abilities');
                expect(this.player1).toBeAbleToSelect(this.duelEffect);
                expect(this.player1).toBeAbleToSelect(this.duelEffect2);

                this.player1.clickCard(this.duelEffect);
                expect(this.player1).toBeAbleToSelect(this.challenger);
                this.player1.clickCard(this.challenger);
                expect(this.challenger.isHonored).toBe(true);

                expect(this.player1).toHavePrompt('Policy Debate');
            });

            it('should react after dial reactions and be a separate trigger', function() {
                this.player1.moveCard(this.manipulator, 'play area');
                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.challenger],
                    defenders: [this.toshimoko]
                });

                this.player2.clickCard(this.pd);
                this.player2.clickCard(this.toshimoko);
                this.player2.clickCard(this.challenger);

                expect(this.player1).toHavePrompt('Honor Bid');
                this.player1.clickPrompt('1');
                this.player2.clickPrompt('1');

                expect(this.player1).toHavePrompt('Triggered Abilities');
                expect(this.player1).toBeAbleToSelect(this.manipulator);
                expect(this.player1).not.toBeAbleToSelect(this.duelEffect);
                expect(this.player1).not.toBeAbleToSelect(this.duelEffect2);
                
                this.player1.pass();
                expect(this.player1).toHavePrompt('Triggered Abilities');
                expect(this.player1).not.toBeAbleToSelect(this.manipulator);
                expect(this.player1).toBeAbleToSelect(this.duelEffect);
                expect(this.player1).toBeAbleToSelect(this.duelEffect2);

                this.player1.clickCard(this.duelEffect);
                expect(this.player1).toBeAbleToSelect(this.challenger);
                this.player1.clickCard(this.challenger);
                expect(this.challenger.isHonored).toBe(true);
            });
        });

        describe('Duel Strike', function () {
            beforeEach(function() {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        fate: 20,
                        inPlay: ['doji-challenger'],
                        hand: ['a-fate-worse-than-death', 'desolation'],
                        dynastyDiscard: ['awakened-tsukumogami']
                    },
                    player2: {
                        inPlay: ['kakita-toshimoko'],
                        hand: ['embrace-the-void', 'policy-debate']
                    }
                });

                this.duelEffect = this.player1.findCardByName('a-fate-worse-than-death');
                this.duelEffect.duelStrike({
                    title: 'Honor this character',
                    target: {
                        cardType: 'character',
                        controller: 'self',
                        cardCondition: (card, context) => context.event.duel.isInvolved(card),
                        gameAction: AbilityDsl.actions.honor()
                    }
                })

                this.duelEffect2 = this.player1.findCardByName('desolation');
                this.duelEffect2.duelStrike({
                    title: 'Gain a fate',
                    gameAction: AbilityDsl.actions.gainFate(context => ({ target: context.player}))
                })

                for(const reaction of this.duelEffect.reactions) {
                    reaction.registerEvents();
                }
                for(const reaction of this.duelEffect2.reactions) {
                    reaction.registerEvents();
                }
                
                this.toshimoko = this.player2.findCardByName('kakita-toshimoko');
                this.challenger = this.player1.findCardByName('doji-challenger');
                this.pd = this.player2.findCardByName('policy-debate');
            });

            it('should react appropriately - after dials, before duel effect', function() {
                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.challenger],
                    defenders: [this.toshimoko]
                });

                this.player2.clickCard(this.pd);
                this.player2.clickCard(this.toshimoko);
                this.player2.clickCard(this.challenger);

                expect(this.player1).toHavePrompt('Honor Bid');
                this.player1.clickPrompt('2');
                this.player2.clickPrompt('1');

                expect(this.player1).toHavePrompt('Triggered Abilities');
                expect(this.player1).toBeAbleToSelect(this.duelEffect);
                expect(this.player1).toBeAbleToSelect(this.duelEffect2);

                this.player1.clickCard(this.duelEffect);
                expect(this.player1).toBeAbleToSelect(this.challenger);
                this.player1.clickCard(this.challenger);
                expect(this.challenger.isHonored).toBe(true);

                expect(this.player1).toHavePrompt('Policy Debate');
            });

            it('should only be able to react once', function() {
                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.challenger],
                    defenders: [this.toshimoko]
                });

                this.player2.clickCard(this.pd);
                this.player2.clickCard(this.toshimoko);
                this.player2.clickCard(this.challenger);

                expect(this.player1).toHavePrompt('Honor Bid');
                this.player1.clickPrompt('1');
                this.player2.clickPrompt('1');

                expect(this.player1).toHavePrompt('Triggered Abilities');
                expect(this.player1).toBeAbleToSelect(this.duelEffect);
                expect(this.player1).toBeAbleToSelect(this.duelEffect2);

                this.player1.clickCard(this.duelEffect);
                expect(this.player1).toBeAbleToSelect(this.challenger);
                this.player1.clickCard(this.challenger);
                expect(this.challenger.isHonored).toBe(true);

                expect(this.player1).toHavePrompt('Conflict Action Window');
            });
        });

        describe('All Duel effects together', function () {
            beforeEach(function() {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        fate: 20,
                        inPlay: ['doji-challenger'],
                        hand: ['a-fate-worse-than-death', 'desolation', 'let-go'],
                        dynastyDiscard: ['awakened-tsukumogami']
                    },
                    player2: {
                        inPlay: ['kakita-toshimoko'],
                        hand: ['embrace-the-void', 'policy-debate']
                    }
                });

                this.duelEffect = this.player1.findCardByName('a-fate-worse-than-death');
                this.duelEffect.duelChallenge({
                    title: 'Honor this character',
                    target: {
                        cardType: 'character',
                        controller: 'self',
                        cardCondition: (card, context) => context.event.duel.isInvolved(card),
                        gameAction: AbilityDsl.actions.honor()
                    }
                })

                this.duelEffect2 = this.player1.findCardByName('desolation');
                this.duelEffect2.duelFocus({
                    title: 'Gain a fate',
                    gameAction: AbilityDsl.actions.gainFate(context => ({ target: context.player}))
                })

                this.duelEffect3 = this.player1.findCardByName('let-go');
                this.duelEffect3.duelStrike({
                    title: 'Gain an honor',
                    gameAction: AbilityDsl.actions.gainHonor(context => ({ target: context.player}))
                })

                for(const reaction of this.duelEffect.reactions) {
                    reaction.registerEvents();
                }
                for(const reaction of this.duelEffect2.reactions) {
                    reaction.registerEvents();
                }
                for(const reaction of this.duelEffect3.reactions) {
                    reaction.registerEvents();
                }
                
                this.toshimoko = this.player2.findCardByName('kakita-toshimoko');
                this.challenger = this.player1.findCardByName('doji-challenger');
                this.pd = this.player2.findCardByName('policy-debate');
            });

            it('should react appropriately and apply all effects', function() {
                let fate = this.player1.fate;
                let honor = this.player1.honor;

                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.challenger],
                    defenders: [this.toshimoko]
                });

                this.player2.clickCard(this.pd);
                this.player2.clickCard(this.toshimoko);
                this.player2.clickCard(this.challenger);

                expect(this.player1).toHavePrompt('Triggered Abilities');
                expect(this.player1).toBeAbleToSelect(this.duelEffect);
                expect(this.player1).not.toBeAbleToSelect(this.duelEffect2);
                expect(this.player1).not.toBeAbleToSelect(this.duelEffect3);

                this.player1.clickCard(this.duelEffect);
                expect(this.player1).toBeAbleToSelect(this.challenger);
                this.player1.clickCard(this.challenger);
                expect(this.challenger.isHonored).toBe(true);

                expect(this.player1).toHavePrompt('Honor Bid');
                this.player1.clickPrompt('1');
                this.player2.clickPrompt('1');

                expect(this.player1).toHavePrompt('Triggered Abilities');
                expect(this.player1).toBeAbleToSelect(this.duelEffect2);
                expect(this.player1).not.toBeAbleToSelect(this.duelEffect3);

                this.player1.clickCard(this.duelEffect2);
                expect(this.player1.fate).toBe(fate - 4 - 2 + 1); //4 from AFWTD, 2 from desolation, 1 from the effect

                expect(this.player1).toHavePrompt('Triggered Abilities');
                expect(this.player1).toBeAbleToSelect(this.duelEffect3);

                this.player1.clickCard(this.duelEffect3);
                expect(this.player1.honor).toBe(honor + 1);

                expect(this.player1).toHavePrompt('Policy Debate');
            });
        });
    });
});
