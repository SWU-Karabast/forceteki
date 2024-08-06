const { GameModes } = require('../../../build/GameModes');

describe('Covert - Emerald', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['togashi-mitsu', 'tengu-sensei', 'ikoma-ikehata', 'shinjo-yasamura']
                },
                player2: {
                    inPlay: ['hantei-sotorii', 'master-alchemist', 'doji-challenger', 'doji-whisperer'],
                    hand: ['vine-tattoo', 'finger-of-jade']
                },
                gameMode: GameModes.Emerald
            });

            this.shameful = this.player2.findCardByName('shameful-display', 'province 1');
            this.yasamura = this.player1.findCardByName('shinjo-yasamura');
            this.mitsu = this.player1.findCardByName('togashi-mitsu');
            this.tengu = this.player1.findCardByName('tengu-sensei');
            this.ikehata = this.player1.findCardByName('ikoma-ikehata');

            this.sotorii = this.player2.findCardByName('hantei-sotorii');
            this.masterAlchemist = this.player2.findCardByName('master-alchemist');
            this.challenger = this.player2.findCardByName('doji-challenger');
            this.whisperer = this.player2.findCardByName('doji-whisperer');
            this.vine = this.player2.findCardByName('vine-tattoo');
            this.jade = this.player2.findCardByName('finger-of-jade');
        });

        describe('using the post-declaration prompt', function() {
            it('multiple coverts should only let you pick a single target', function() {
                this.noMoreActions();
                this.player1.clickRing('air');
                this.player1.clickCard(this.shameful);
                this.player1.clickCard(this.mitsu);
                this.player1.clickCard(this.ikehata);
                this.player1.clickPrompt('Initiate Conflict');
                expect(this.player1).toHavePrompt('Choose character to evade with covert');
                expect(this.sotorii.covert).toBe(false);
                this.player1.clickCard(this.sotorii);
                expect(this.sotorii.covert).toBe(true);

                expect(this.player2).toHavePrompt('Choose defenders');

                this.player2.clickCard(this.sotorii);
                this.player2.clickCard(this.masterAlchemist);
                expect(this.game.currentConflict.defenders).toContain(this.masterAlchemist);
                expect(this.game.currentConflict.defenders).not.toContain(this.sotorii);
                this.player2.clickPrompt('Done');
                expect(this.game.currentConflict.defenders).toContain(this.masterAlchemist);
                expect(this.game.currentConflict.defenders).not.toContain(this.sotorii);
            });

            it('multiple covert - reaction to covert', function() {
                this.noMoreActions();
                this.player1.clickRing('air');
                this.player1.clickCard(this.shameful);
                this.player1.clickCard(this.mitsu);
                this.player1.clickCard(this.ikehata);
                this.player1.clickCard(this.tengu);
                this.player1.clickCard(this.yasamura);
                this.player1.clickPrompt('Initiate Conflict');
                expect(this.sotorii.covert).toBe(false);
                this.player1.clickCard(this.sotorii);
                expect(this.sotorii.covert).toBe(true);

                expect(this.player1).toHavePrompt('Triggered Abilities');
                expect(this.player1).toBeAbleToSelect(this.tengu);
                expect(this.player1).toBeAbleToSelect(this.yasamura);
                this.player1.clickCard(this.tengu);
                this.player1.clickCard(this.yasamura);

                expect(this.player2).toHavePrompt('Choose defenders');

                expect(this.getChatLogs(5)).toContain('player1 uses Tengu Sensei to prevent Hantei Sotorii from attacking this phase');
                expect(this.getChatLogs(5)).toContain('player1 uses Shinjo Yasamura to prevent Hantei Sotorii from defending this phase');

                this.player2.clickCard(this.sotorii);
                this.player2.clickCard(this.masterAlchemist);
                expect(this.game.currentConflict.defenders).toContain(this.masterAlchemist);
                expect(this.game.currentConflict.defenders).not.toContain(this.sotorii);
                this.player2.clickPrompt('Done');
                expect(this.game.currentConflict.defenders).toContain(this.masterAlchemist);
                expect(this.game.currentConflict.defenders).not.toContain(this.sotorii);
            });

            it('multiple covert - reaction to covert and Vine Tattoo', function() {
                this.player1.pass();
                this.player2.playAttachment(this.vine, this.challenger);

                this.noMoreActions();
                this.player1.clickRing('air');
                this.player1.clickCard(this.shameful);
                this.player1.clickCard(this.mitsu);
                this.player1.clickCard(this.ikehata);
                this.player1.clickCard(this.tengu);
                this.player1.clickCard(this.yasamura);
                this.player1.clickPrompt('Initiate Conflict');
                expect(this.challenger.covert).toBe(false);
                this.player1.clickCard(this.challenger);
                expect(this.challenger.covert).toBe(true);

                expect(this.player1).toHavePrompt('Triggered Abilities');
                expect(this.player1).not.toBeAbleToSelect(this.tengu);
                expect(this.player1).toBeAbleToSelect(this.yasamura);
                this.player1.clickCard(this.tengu);
                this.player1.clickCard(this.yasamura);

                expect(this.player2).toHavePrompt('Choose defenders');

                expect(this.getChatLogs(5)).not.toContain('player1 uses Tengu Sensei to prevent Doji Challenger from attacking this phase');
                expect(this.getChatLogs(5)).toContain('player1 uses Shinjo Yasamura to prevent Doji Challenger from defending this phase');

                this.player2.clickCard(this.challenger);
                this.player2.clickCard(this.masterAlchemist);
                expect(this.game.currentConflict.defenders).toContain(this.masterAlchemist);
                expect(this.game.currentConflict.defenders).not.toContain(this.challenger);
                this.player2.clickPrompt('Done');
                expect(this.game.currentConflict.defenders).toContain(this.masterAlchemist);
                expect(this.game.currentConflict.defenders).not.toContain(this.challenger);
            });

            it('multiple covert - Vine Tattoo making target ineligible', function() {
                this.player1.pass();
                this.player2.playAttachment(this.vine, this.whisperer);

                this.noMoreActions();
                this.player1.clickRing('air');
                this.player1.clickCard(this.shameful);
                this.player1.clickCard(this.mitsu);
                this.player1.clickCard(this.ikehata);
                this.player1.clickCard(this.tengu);
                this.player1.clickCard(this.yasamura);
                this.player1.clickPrompt('Initiate Conflict');

                expect(this.player1).toHavePrompt('Choose character to evade with covert');
                expect(this.player1).toBeAbleToSelect(this.sotorii);
                expect(this.player1).toBeAbleToSelect(this.masterAlchemist);
                expect(this.player1).toBeAbleToSelect(this.challenger);
                expect(this.player1).not.toBeAbleToSelect(this.whisperer);

                this.player1.clickCard(this.whisperer);
                expect(this.player1).toHavePrompt('Choose character to evade with covert');
            });

            it('FoJ should still prevent', function() {
                this.player1.pass();
                this.player2.playAttachment(this.jade, this.sotorii);
                this.noMoreActions();
                this.player1.clickRing('air');
                this.player1.clickCard(this.shameful);
                this.player1.clickCard(this.mitsu);
                this.player1.clickCard(this.ikehata);
                this.player1.clickPrompt('Initiate Conflict');
                expect(this.player1).toHavePrompt('Choose character to evade with covert');
                expect(this.sotorii.covert).toBe(false);
                this.player1.clickCard(this.sotorii);
                expect(this.sotorii.covert).toBe(false);

                expect(this.player2).toHavePrompt('Triggered Abilities');
                expect(this.player2).toBeAbleToSelect(this.jade);
                this.player2.clickCard(this.jade);
                expect(this.player2).toHavePrompt('Choose defenders');

                this.player2.clickCard(this.sotorii);
                this.player2.clickCard(this.masterAlchemist);
                expect(this.game.currentConflict.defenders).toContain(this.masterAlchemist);
                expect(this.game.currentConflict.defenders).toContain(this.sotorii);
                this.player2.clickPrompt('Done');
                expect(this.game.currentConflict.defenders).toContain(this.masterAlchemist);
                expect(this.game.currentConflict.defenders).toContain(this.sotorii);
            });
        });

        describe('in-declaration targeting should not work', function() {
            it('single covert', function() {
                this.noMoreActions();
                this.player1.clickRing('air');
                this.player1.clickCard(this.shameful);
                this.player1.clickCard(this.mitsu);
                this.player1.clickCard(this.sotorii);
                this.player1.clickPrompt('Initiate Conflict');
                expect(this.player1).toHavePrompt('Choose character to evade with covert');
                expect(this.player2).not.toHavePrompt('Choose defenders');
                expect(this.sotorii.covert).toBe(false);
            });
        });
    });
});

describe('Covert - Emerald Bug Checking', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['togashi-mitsu', 'tengu-sensei', 'ikoma-ikehata', 'shinjo-yasamura', 'adept-of-the-waves'],
                    hand: ['pathfinder-s-blade']
                },
                player2: {
                    inPlay: ['hantei-sotorii', 'master-alchemist', 'doji-challenger', 'doji-whisperer'],
                    hand: ['vine-tattoo', 'finger-of-jade'],
                    provinces: ['retire-to-the-brotherhood'],
                    role: ['seeker-of-void']
                },
                gameMode: GameModes.Emerald
            });

            this.shameful = this.player2.findCardByName('shameful-display', 'province 4');
            this.yasamura = this.player1.findCardByName('shinjo-yasamura');
            this.mitsu = this.player1.findCardByName('togashi-mitsu');
            this.tengu = this.player1.findCardByName('tengu-sensei');
            this.ikehata = this.player1.findCardByName('ikoma-ikehata');
            this.pfb = this.player1.findCardByName('pathfinder-s-blade');
            this.adept = this.player1.findCardByName('adept-of-the-waves');

            this.sotorii = this.player2.findCardByName('hantei-sotorii');
            this.masterAlchemist = this.player2.findCardByName('master-alchemist');
            this.challenger = this.player2.findCardByName('doji-challenger');
            this.whisperer = this.player2.findCardByName('doji-whisperer');
            this.vine = this.player2.findCardByName('vine-tattoo');
            this.jade = this.player2.findCardByName('finger-of-jade');
            this.retire = this.player2.findCardByName('retire-to-the-brotherhood');
            this.sov = this.player2.findCardByName('seeker-of-void');

            this.retire.facedown = true;
            this.shameful.facedown = true;
        });

        it('Reactions to declaration', function() {
            this.noMoreActions();
            this.player1.clickRing('air');
            this.player1.clickCard(this.shameful);
            this.player1.clickCard(this.mitsu);
            this.player1.clickCard(this.ikehata);
            this.player1.clickPrompt('Initiate Conflict');
            this.player1.clickCard(this.sotorii);

            expect(this.player2).toHavePrompt('Triggered Abilities');
            expect(this.player2).toBeAbleToSelect(this.sov);
            this.player2.clickCard(this.sov);
            expect(this.player2).toHavePrompt('Choose defenders');
        });

        it('Reactions to declaration', function() {
            this.noMoreActions();
            this.player1.clickRing('air');
            this.player1.clickCard(this.retire);
            this.player1.clickCard(this.mitsu);
            this.player1.clickCard(this.ikehata);
            this.player1.clickPrompt('Initiate Conflict');
            this.player1.clickCard(this.sotorii);

            expect(this.player2).toHavePrompt('Triggered Abilities');
            expect(this.player2).toBeAbleToSelect(this.retire);
            this.player2.clickCard(this.retire);
            expect(this.player2).toHavePrompt('Choose defenders');
        });

        it('Interrupts to Declaration', function() {
            this.player1.playAttachment(this.pfb, this.mitsu);
            this.noMoreActions();
            this.player1.clickRing('air');
            this.player1.clickCard(this.retire);
            this.player1.clickCard(this.mitsu);
            this.player1.clickCard(this.ikehata);
            this.player1.clickPrompt('Initiate Conflict');
            this.player1.clickCard(this.sotorii);

            expect(this.player2).toHavePrompt('Triggered Abilities');
            expect(this.player2).toBeAbleToSelect(this.retire);
            this.player2.clickCard(this.retire);
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.pfb);
            this.player1.clickCard(this.pfb);
        });

        it('Adept of the Waves and FoJ', function() {
            this.player1.clickCard(this.adept);
            this.player1.clickCard(this.adept);
            this.player2.playAttachment(this.jade, this.sotorii);
            this.player1.playAttachment(this.pfb, this.adept);
            this.noMoreActions();
            this.player1.clickRing('water');
            this.player1.clickCard(this.retire);
            this.player1.clickCard(this.adept);
            this.player1.clickPrompt('Initiate Conflict');
            this.player1.clickCard(this.sotorii);

            expect(this.player2).toHavePrompt('Triggered Abilities');
            expect(this.player2).toBeAbleToSelect(this.jade);

            this.player2.clickCard(this.jade);
            expect(this.player2).toHavePrompt('Triggered Abilities');
            expect(this.player2).toBeAbleToSelect(this.retire);
            this.player2.clickCard(this.retire);
            // expect(this.player1).toHavePrompt('Triggered Abilities');
            // expect(this.player1).toBeAbleToSelect(this.pfb);
            // this.player1.clickCard(this.pfb);
        });
    });
});
