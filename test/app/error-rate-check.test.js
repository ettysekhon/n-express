const proxyquire = require('proxyquire');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const chai = require('chai');
const expect = chai.expect;
chai.use(sinonChai);

const nHealthStub = {
	runCheck: sinon.stub()
};

const subject = proxyquire('../../src/lib/error-rate-check', {
	'n-health': nHealthStub
});

describe('Default error rate check', () => {

	let env;

	before(() => {
		env = Object.assign({}, process.env);
	});

	after(() => {
		process.env = env;
	});

	it('should compose correct graphite metric with region', () => {
		process.env.REGION = 'US';

		const metric = 'asPercent(summarize(sumSeries(next.heroku.app-name.web_*_US.express.*.res.status.{500,503,504}.count), \'10min\', \'sum\', true), summarize(sumSeries(next.heroku.app-name.web_*_US.express.*.res.status.*.count), \'10min\', \'sum\', true))';

		subject('app-name');
		expect(nHealthStub.runCheck).calledWithMatch({
			metric
		});
	});

	it('should compose correct graphite metric without region', () => {
		delete process.env.REGION;

		const metric = 'asPercent(summarize(sumSeries(next.heroku.app-name.web_*.express.*.res.status.{500,503,504}.count), \'10min\', \'sum\', true), summarize(sumSeries(next.heroku.app-name.web_*.express.*.res.status.*.count), \'10min\', \'sum\', true))';

		subject('app-name');
		expect(nHealthStub.runCheck).calledWithMatch({
			metric
		});
	});

});
