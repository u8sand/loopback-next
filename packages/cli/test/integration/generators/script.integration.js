// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const path = require('path');
const assert = require('yeoman-assert');
const testlab = require('@loopback/testlab');

const TestSandbox = testlab.TestSandbox;

const generator = path.join(__dirname, '../../../generators/script');
const SANDBOX_FILES = require('../../fixtures/script').SANDBOX_FILES;
const testUtils = require('../../test-utils');

// Test Sandbox
const SANDBOX_PATH = path.resolve(__dirname, '..', '.sandbox');
const sandbox = new TestSandbox(SANDBOX_PATH);

describe('lb4 script', () => {
  beforeEach('reset sandbox', async () => {
    await sandbox.reset();
  });

  describe('valid generation of scripts', () => {
    it('generates a basic script from command line arguments', async () => {
      await testUtils
        .executeGenerator(generator)
        .inDir(SANDBOX_PATH, () =>
          testUtils.givenLBProject(SANDBOX_PATH, {
            additionalFiles: SANDBOX_FILES,
          }),
        )
        .withArguments('myObserver');
      verifyGeneratedScript();
    });

    it('generates a script from a config file', async () => {
      await testUtils
        .executeGenerator(generator)
        .inDir(SANDBOX_PATH, () =>
          testUtils.givenLBProject(SANDBOX_PATH, {
            additionalFiles: SANDBOX_FILES,
          }),
        )
        .withArguments('--config myscriptconfig.json');
      verifyGeneratedScript();
    });
  });
});

// Sandbox constants
const SCRIPT_APP_PATH = 'src/scripts';
const INDEX_FILE = path.join(SANDBOX_PATH, SCRIPT_APP_PATH, 'index.ts');

function verifyGeneratedScript() {
  const expectedFile = path.join(
    SANDBOX_PATH,
    SCRIPT_APP_PATH,
    'my-observer.script.ts',
  );
  assert.file(expectedFile);
  assert.fileContent(
    expectedFile,
    /export class MyObserverScript implements LifeCycleObserver {/,
  );
  assert.fileContent(expectedFile, /async start\(\): Promise\<void\> {/);
  assert.fileContent(expectedFile, /async stop\(\): Promise\<void\> {/);
  assert.file(INDEX_FILE);
  assert.fileContent(INDEX_FILE, /export \* from '.\/my-observer.script';/);
}
