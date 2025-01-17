/*!
 * Copyright (c) 2015-2020 Cisco Systems, Inc. See LICENSE file.
 */

import {assert} from '@webex/test-helper-chai';
import sinon from 'sinon';
import Presence from '@webex/internal-plugin-presence';
import MockWebex from '@webex/test-helper-mock-webex';

// Skipping as we have registered it as public plugin and MockWebex will create presence under webex object directly instead of webex.internal
describe.skip('plugin-presence', () => {
  describe('Presence', () => {
    let webex;

    beforeEach(() => {
      webex = new MockWebex({
        children: {
          presence: Presence,
        },
      });
    });

    describe('#get()', () => {
      it('requires a person id parameter', () =>
        assert.isRejected(webex.internal.presence.get(), /A person id is required/));
    });

    describe('#list()', () => {
      it('requires a parameter', () =>
        assert.isRejected(webex.internal.presence.list(), /An array of person ids is required/));

      it('requires a person array parameter', () =>
        assert.isRejected(
          webex.internal.presence.list('abc'),
          /An array of person ids is required/
        ));
    });

    describe('#subscribe()', () => {
      it('requires a person parameter', () =>
        assert.isRejected(webex.internal.presence.subscribe(), /A person id is required/));
      it('subscription request called twice with batch of 100 ids', () => {
        const ids = [...Array(100).keys()];

        webex.request = function (options) {
          return Promise.resolve({
            statusCode: 204,
            body: [],
            options,
          });
        };
        sinon.spy(webex, 'request');

        webex.internal.presence.subscribe(ids);
        assert.calledTwice(webex.request);
      });
    });

    describe('#unsubscribe()', () => {
      it('requires a person parameter', () =>
        assert.isRejected(webex.internal.presence.unsubscribe(), /A person id is required/));
    });

    describe('#setStatus()', () => {
      it('requires a status', () =>
        assert.isRejected(webex.internal.presence.setStatus(), /A status is required/));

      it('passes a label to the API', () => {
        const testGuid = 'test-guid';

        webex.internal.device.userId = testGuid;

        webex.request = function (options) {
          return Promise.resolve({
            statusCode: 204,
            body: [],
            options,
          });
        };
        sinon.spy(webex, 'request');

        webex.internal.presence.setStatus('active');

        assert.calledOnce(webex.request);

        const request = webex.request.getCall(0);

        assert.equal(request.args[0].body.label, testGuid);
      });

      it('does not pass a label to the API if the status is DND', () => {
        const testGuid = 'test-guid';

        webex.internal.device.userId = testGuid;

        webex.request = function (options) {
          return Promise.resolve({
            statusCode: 204,
            body: [],
            options,
          });
        };
        sinon.spy(webex, 'request');

        webex.internal.presence.setStatus('dnd');

        assert.calledOnce(webex.request);

        const request = webex.request.getCall(0);

        assert.notProperty(request.args[0].body, 'label');
      });
    });

    describe('#initializeWorker()', () => {
      it('initializes the worker once webex is ready', () => {
        webex.internal.presence.worker = {initialize: sinon.spy()};
        webex.presence.config.initializeWorker = false;

        webex.internal.presence.initializeWorker();

        assert.notCalled(webex.internal.presence.worker.initialize);

        webex.trigger('ready');

        assert.calledOnce(webex.internal.presence.worker.initialize);
      });
    });
  });
});
